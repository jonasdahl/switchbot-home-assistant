import noble, { Peripheral } from "@abandonware/noble";
import {
  AnyActorRef,
  AnyStateMachine,
  assign,
  createMachine,
  spawn,
} from "xstate";

type Event =
  | { type: "PERIPHERAL_DISCOVERED"; peripheral: Peripheral }
  | { type: "SCAN_STARTED" }
  | { type: "SCAN_STOPPED" };

export const createDiscoveryMachine = ({
  getPeripheralMachine,
}: {
  getPeripheralMachine: (args: {
    peripheral: Peripheral;
  }) => AnyStateMachine | null;
}) =>
  createMachine(
    {
      tsTypes: {} as import("./discovery.typegen").Typegen0,
      schema: {
        context: {} as {
          noble: typeof noble;
          peripherals: Record<
            string,
            { peripheral: Peripheral; actor: AnyActorRef | null }
          >;
        },
        services: {} as {
          startScan: { data: void };
          stopScan: { data: void };
          eventListener: never;
          scanning: never;
        },
        events: {} as Event,
      },
      type: "parallel",
      entry: "onStart",
      exit: "onExit",
      invoke: { src: "eventListener" },
      states: {
        logger: {
          entry: "logDevices",
          after: { DISCOVERY_LOGGING_INTERVAL: "logger" },
        },
        discovery: {
          initial: "idle",
          states: {
            idle: { always: "startingScan" },
            error: { entry: "onError" },
            startingScan: {
              invoke: { src: "startScan", onError: "error" },
            },
            scanning: {
              entry: "onScanningStarted",
              exit: "onScanningStopped",
              invoke: { src: "scanning", onError: "error" },
              after: { 20_000: "stoppingScan" },
              on: {
                PERIPHERAL_DISCOVERED: [
                  {
                    cond: "peripheralIsNotKnown",
                    actions: [
                      "onPeripheralDiscovered",
                      "saveDiscoveredPeripheral",
                    ],
                  },
                ],
              },
            },
            stoppingScan: {
              invoke: { src: "stopScan", onDone: "waiting", onError: "error" },
            },
            waiting: { after: { 60_000: "startingScan" } },
          },
          on: {
            SCAN_STARTED: ".scanning",
            SCAN_STOPPED: ".waiting",
          },
        },
      },
    },
    {
      guards: {
        peripheralIsNotKnown: (c, e) => {
          const peripheral = e.peripheral;
          const id = `${peripheral.id}`;
          return !(id in c.peripherals);
        },
      },
      actions: {
        logDevices: () => {},
        onScanningStarted: () => {},
        onScanningStopped: () => {},
        saveDiscoveredPeripheral: assign((c, e) => {
          const peripheral = e.peripheral;
          const id = `${peripheral.id}`;
          const machine = getPeripheralMachine({ peripheral: e.peripheral });
          if (!machine) {
            return {
              peripherals: {
                ...c.peripherals,
                [id]: { peripheral, actor: null },
              },
            };
          }
          return {
            peripherals: {
              ...c.peripherals,
              [id]: { peripheral, actor: spawn(machine) },
            },
          };
        }),
        onPeripheralDiscovered: () => {},
      },
      services: {
        eventListener: (c) => (send) => {
          const onScanStart = () => {
            send({ type: "SCAN_STARTED" });
          };
          const onScanStopped = () => {
            send({ type: "SCAN_STOPPED" });
          };
          c.noble.on("scanStart", onScanStart);
          c.noble.on("scanStop", onScanStopped);
          return () => {
            c.noble.removeListener("scanStart", onScanStart);
            c.noble.removeListener("scanStop", onScanStopped);
          };
        },
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
