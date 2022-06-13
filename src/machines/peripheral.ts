import { Characteristic, Peripheral, Service } from "@abandonware/noble";
import { createMachine } from "xstate";
import { createBinaryParser } from "../binary-parser";

type Event =
  | { type: "DISCONNECTED" }
  | { type: "CONNECTED" }
  | { type: "RSSI_UPDATE"; rssi: number }
  | { type: "NOTIFY_DATA"; buffer: Buffer };

export const peripheralMachine = createMachine(
  {
    tsTypes: {} as import("./peripheral.typegen").Typegen0,
    schema: {
      context: {} as { peripheral: Peripheral },
      services: {} as {
        connect: { data: void };
        discoverServices: {
          data: { services: Service[]; characteristics: Characteristic[] };
        };
        listenForNotifyData: { data: void };
      },
      events: {} as Event,
    },
    initial: "connecting",
    invoke: { src: "eventListener" },
    entry: "onStart",
    exit: "onExit",
    states: {
      connecting: {
        entry: "onConnecting",
        invoke: {
          src: "connect",
          onDone: { target: "discoveringServices", actions: "onConnected" },
          onError: "..error",
        },
      },
      discoveringServices: {
        invoke: {
          src: "discoverServices",
          onDone: {
            target: "idle",
            actions: "onServicesDiscovered",
          },
        },
      },
      idle: {
        type: "parallel",
        states: {
          listenForNotifyData: {
            invoke: { src: "listenForNotifyData" },
            on: { NOTIFY_DATA: { actions: "onNotifyData" } },
          },
          pollNotifyData: {
            initial: "requestPollData",
            after: { 10_000: "pollNotifyData" },
            states: {
              requestPollData: {
                entry: "pollNotifyData",
                on: {
                  NOTIFY_DATA: "handlePollResponse",
                },
              },
              handlePollResponse: { entry: "onPollResponse" },
            },
          },
        },
      },
      disconnecting: {
        entry: "onDisconnecting",
        invoke: { src: "disconnect", onDone: "disconnected" },
      },
      disconnected: { entry: "onDisconnected", type: "final" },
      error: { entry: "onError" },
    },

    on: { RSSI_UPDATE: { actions: "onRssiUpdate" } },
  },
  {
    actions: {
      onStart: () => {},
      onExit: () => {},
      onConnecting: () => {},
      onConnected: () => {},
      onDisconnected: () => {},
      onDisconnecting: () => {},
      onPollResponse: (_c, e) => {
        const dataType = createBinaryParser()
          .bit8("responseStatus")
          .bit8("battery")
          .bit8("firmwareVersion")
          .bit8("deviceChainLength")
          .bit1("direction")
          .bit1("touchAndGo")
          .bit1("lightingEffect")
          .skipBit(1)
          .bit1("fault")
          .skipBit(3)
          .skipBit(4)
          .bit1("solarPanelPluggedIn")
          .bit1("calibrated")
          .bit2("motionStatus")
          .bit8("currentPosition")
          .bit8("timerCount");

        try {
          console.log(e.buffer.toString("hex"), dataType.parse(e.buffer));
        } catch (e) {
          console.log("Error!", e);
        }
      },
      pollNotifyData: (c) => {
        const writeCharacteristic = c.peripheral.services
          .flatMap((s) => s.characteristics)
          .find((c) => c.uuid === "cba20002224d11e69fb80002a5d5c51b");
        if (!writeCharacteristic) {
          throw new Error("No write characteristic found");
        }
        console.log("Writing");
        // const open = [0x57, 0x0f, 0x45, 0x01, 0x05, 0xff, 0x00];
        // const close = [0x57, 0x0f, 0x45, 0x01, 0x05, 0xff, 0x64];
        const req = [
          0x57, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        ];
        writeCharacteristic
          .writeAsync(Buffer.from(req), true)
          .catch((e) => console.log(e));
      },
    },
    services: {
      listenForNotifyData: (c) => (send) => {
        const characteristic = c.peripheral.services
          .flatMap((s) => s.characteristics)
          .find((c) => c.uuid === "cba20003224d11e69fb80002a5d5c51b");
        if (!characteristic) {
          throw new Error("No notify characteristic found");
        }
        const handleData = (buffer: Buffer) => {
          console.log({ buffer });
          send({ type: "NOTIFY_DATA", buffer });
        };
        console.log("Waiting for data");
        characteristic.subscribe();
        characteristic.on("data", handleData);
        return () => {
          console.log("STopped waiting for data");
          characteristic.unsubscribe();
          characteristic.removeListener("data", handleData);
        };
      },
      connect: async (c) => {
        await c.peripheral.connectAsync();
      },
      disconnect: async (c) => {
        await c.peripheral.disconnectAsync();
      },
      discoverServices: async (c) => {
        return await c.peripheral.discoverAllServicesAndCharacteristicsAsync();
      },
      eventListener: (c) => (send) => {
        const disconnectHandler = () => send({ type: "DISCONNECTED" });
        const connectHandler = () => send({ type: "CONNECTED" });
        const rssiHandler = (rssi: number) =>
          send({ type: "RSSI_UPDATE", rssi });

        c.peripheral.on("disconnect", disconnectHandler);
        c.peripheral.on("connect", connectHandler);
        c.peripheral.on("rssiUpdate", rssiHandler);

        return () => {
          c.peripheral.removeListener("disconnect", disconnectHandler);
          c.peripheral.removeListener("connect", connectHandler);
          c.peripheral.removeListener("rssiUpdate", rssiHandler);
        };
      },
    },
  }
);
