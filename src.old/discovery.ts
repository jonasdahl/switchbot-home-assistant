import noble, { Peripheral } from "@abandonware/noble";
import { ActorRefFrom, assign, createMachine, spawn } from "xstate";
import { peripheralMachine } from "./peripheral";

type Event = { type: "PERIPHERAL_DISCOVERED"; peripheral: Peripheral };

export const discoveryMachine = createMachine(
  {
    tsTypes: {} as import("./discovery.typegen").Typegen0,
    schema: {
      context: {} as {
        noble: typeof noble;
        peripherals: Record<
          string,
          {
            peripheral: Peripheral;
            actor: ActorRefFrom<typeof peripheralMachine>;
          }
        >;
      },
      services: {} as {
        startScan: { data: void };
        stopScan: { data: void };
        scanning: never;
      },
      events: {} as Event,
    },
    initial: "idle",
    states: {
      idle: {
        always: "startingScan",
      },
      startingScan: {
        invoke: {
          src: "startScan",
          onDone: "scanning",
          onError: { actions: "error" },
        },
      },
      scanning: {
        entry: "scanningStarted",
        exit: "scanningStopped",
        invoke: { src: "scanning", onError: { actions: "error" } },
        after: { 10_000: "stoppingScan" },
        on: {
          PERIPHERAL_DISCOVERED: {
            actions: ["peripheralDiscovered", "startAndSavePeripheralActor"],
          },
        },
      },
      stoppingScan: {
        invoke: {
          src: "stopScan",
          onDone: "waiting",
          onError: { actions: "error" },
        },
      },
      waiting: {
        after: { 10_000: "startingScan" },
      },
    },
  },
  {
    actions: {
      scanningStarted: () => {},
      scanningStopped: () => {},
      startAndSavePeripheralActor: assign((c, e) => {
        const peripheral = e.peripheral;
        if (!peripheral.advertisement.localName?.includes("WoCurtain")) {
          return c;
        }
        const id = `${peripheral.id}`;
        if (id in c.peripherals) {
          return c;
        }
        const actor = spawn(
          peripheralMachine.withContext({ peripheral, services: {} })
        );
        return {
          peripherals: {
            ...c.peripherals,
            [id]: { peripheral, actor: actor },
          },
        };
      }),
    },
    services: {
      startScan: async (c) => await c.noble.startScanningAsync([], false),
      stopScan: async (c) => await c.noble.stopScanningAsync(),
      scanning: (_) => (send) => {
        const handler = (peripheral: Peripheral) => {
          send({ type: "PERIPHERAL_DISCOVERED", peripheral });
        };

        noble.on("discover", handler);

        return () => {
          noble.removeListener("discover", handler);
        };
      },
    },
  }
);
