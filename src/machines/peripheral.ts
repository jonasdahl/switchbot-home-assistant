import {
  Advertisement,
  Characteristic,
  Peripheral,
  Service,
} from "@abandonware/noble";

import { assign, createMachine, send } from "xstate";
import { pure } from "xstate/lib/actions";
import { createBinaryParser, ParserReturn } from "../binary-parser";

type Event =
  | { type: "DISCONNECTED" }
  | { type: "CONNECTED" }
  | { type: "RSSI_UPDATE"; rssi: number }
  | { type: "NOTIFY_DATA"; buffer: Buffer }
  | { type: "UPDATE_PERIPHERAL"; peripheral: Peripheral }
  | { type: "ADVERTISEMENT_RECEIVED"; advertisement: Advertisement }
  | {
      type: "SERVICE_DATA_RECEIVED";
      data: ParserReturn<typeof serviceDataType>;
    }
  | {
      type: "BASIC_INFORMATION_RECEIVED";
      data: ParserReturn<typeof basicInformationDataType>;
    }
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "STOP" }
  | { type: "RESET" }
  | { type: "SEND_COMMAND"; buffer: Buffer }
  | { type: "SET_POSITION"; position: number };

type Context = { peripheral: Peripheral };

export const peripheralMachine = createMachine(
  {
    tsTypes: {} as import("./peripheral.typegen").Typegen0,
    schema: {
      context: {} as Context,
      services: {} as {
        connect: { data: void };
        discoverServices: {
          data: { services: Service[]; characteristics: Characteristic[] };
        };
        connected: { data: void };
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
          onError: "error",
        },
        after: { 30_000: "error" },
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
        invoke: { src: "connected" },
        states: {
          listenForNotifyData: {
            invoke: { src: "listenForNotifyData" },
            on: { NOTIFY_DATA: { actions: "onNotifyData" } },
          },
          listenForActions: {
            on: {
              OPEN: { actions: "open" },
              CLOSE: { actions: "close" },
              STOP: { actions: "stop" },
              SET_POSITION: { actions: "setPosition" },
              SEND_COMMAND: { actions: "sendCommand" },
            },
          },
          pollNotifyData: {
            initial: "requestPollData",
            after: { 10_000: "pollNotifyData" },
            states: {
              requestPollData: {
                entry: "requestPollData",
                on: { NOTIFY_DATA: "handlePollResponse" },
              },
              handlePollResponse: { entry: "onPollResponse" },
            },
          },
        },
        on: { RESET: { target: "idle", actions: "onReset" } },
      },
      disconnecting: {
        entry: "onDisconnecting",
        invoke: { src: "disconnect", onDone: "disconnected" },
      },
      disconnected: { entry: "onDisconnected", type: "final" },
      error: { entry: "onError", after: { 10_000: "connecting" } },
    },

    on: {
      RSSI_UPDATE: { actions: "onRssiUpdate" },
      UPDATE_PERIPHERAL: {
        actions: ["savePeripheral", "forwardAdvertisement"],
      },
      ADVERTISEMENT_RECEIVED: {
        actions: ["parseAdvertisement", "onAdvertisement"],
      },
      SERVICE_DATA_RECEIVED: { actions: "onServiceData" },
      BASIC_INFORMATION_RECEIVED: { actions: "onBasicData" },
    },
  },
  {
    actions: {
      parseAdvertisement: pure((_c: any, e_: any) => {
        const e = e_ as Event & { type: "ADVERTISEMENT_RECEIVED" };
        const res = e.advertisement.serviceData
          .map((service) => {
            try {
              const res = serviceDataType.parse(service.data);
              return send<Context, Event>({
                type: "SERVICE_DATA_RECEIVED",
                data: res,
              });
            } catch (e) {
              return null;
            }
          })
          .filter(function <T>(x: T | null): x is T {
            return x !== null;
          });
        return res;
      }) as any,
      onStart: () => {},
      onExit: () => {},
      onConnecting: () => {},
      onConnected: () => {},
      onDisconnected: () => {},
      onDisconnecting: () => {},
      onAdvertisement: () => {},
      onNotifyData: () => {},
      onPollResponse: pure<Context, Event & { buffer: Buffer }>((_c, e) => {
        try {
          return [
            send({
              type: "BASIC_INFORMATION_RECEIVED",
              data: basicInformationDataType.parse(e.buffer),
            }),
          ];
        } catch (e) {
          return [];
        }
      }) as any,
      requestPollData: send({
        type: "SEND_COMMAND",
        buffer: Buffer.from([
          0x57, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        ]),
      }),
      open: send({ type: "SET_POSITION", position: 0 }),
      close: send({ type: "SET_POSITION", position: 100 }),
      sendCommand: (c, e) => {
        const writeCharacteristic = c.peripheral.services
          .flatMap((s) => s.characteristics)
          .find((c) => c.uuid === "cba20002224d11e69fb80002a5d5c51b");
        if (!writeCharacteristic) {
          throw new Error("No write characteristic found");
        }
        writeCharacteristic
          .writeAsync(e.buffer, true)
          .catch((e) => console.log(e));
      },
      setPosition: send((_c, e) => {
        if (e.position < 0 || e.position > 100) {
          throw new Error("Position out of bounds");
        }
        return {
          type: "SEND_COMMAND",
          buffer: Buffer.from([0x57, 0x0f, 0x45, 0x01, 0x05, 0xff, e.position]),
        };
      }),
      stop: send({
        type: "SEND_COMMAND",
        buffer: Buffer.from([
          0x57,
          0x0f,
          0x45,
          0x01,
          0x00, // @todo Why not 0x05 as in set position?
          0xff,
        ]),
      }),
      savePeripheral: assign((_, e) => ({ peripheral: e.peripheral })),
      forwardAdvertisement: send((_, e) => ({
        type: "ADVERTISEMENT_RECEIVED",
        advertisement: e.peripheral.advertisement,
      })),
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
          send({ type: "NOTIFY_DATA", buffer });
        };

        characteristic.subscribe();
        characteristic.on("data", handleData);
        return () => {
          characteristic.unsubscribe();
          characteristic.removeListener("data", handleData);
        };
      },
      connect: async (c) => {
        if (c.peripheral.state === "connected") {
          return;
        }
        if (c.peripheral.state === "disconnected") {
          await c.peripheral.connectAsync();
          return;
        }
        console.log("Peripheral was in state: " + c.peripheral.state);
        throw new Error("Peripheral was in state: " + c.peripheral.state);
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

const serviceDataType = createBinaryParser()
  .skipBit(1)
  .bit7("deviceType")
  .bit1("allowConnection")
  .bit1("calibrationStatus")
  .skipBit(6)
  .skipBit(1)
  .bit7("battery")
  .bit1("movementStatus")
  .bit7("position")
  .bit4("lightLevel")
  .bit4("chainLength");

const basicInformationDataType = createBinaryParser()
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
