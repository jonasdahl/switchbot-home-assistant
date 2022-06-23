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
  | { type: "SCAN_STOPPED" }
  | { type: "RESET" };

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
      context: { noble, peripherals: {} },
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
              on: {
                PERIPHERAL_DISCOVERED: [
                  {
                    cond: "peripheralIsNotKnown",
                    actions: [
                      "onPeripheralDiscovered",
                      "saveDiscoveredPeripheral",
                    ],
                  },
                  {
                    cond: "peripheralIsKnown",
                    actions: "updatePeripheral",
                  },
                ],
              },
            },
            stoppingScan: {
              invoke: { src: "stopScan", onDone: "waiting", onError: "error" },
            },
            waiting: { after: { 1_000: "startingScan" } },
          },
          on: {
            SCAN_STARTED: ".scanning",
            SCAN_STOPPED: ".waiting",
            RESET: { actions: "resetAllPeripherals" },
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
        peripheralIsKnown: (c, e) => {
          const peripheral = e.peripheral;
          const id = `${peripheral.id}`;
          return !!(id in c.peripherals);
        },
      },
      actions: {
        resetAllPeripherals: (c) => {
          Object.values(c.peripherals)
            .map((v) => v.actor)
            .forEach((actor) => {
              actor?.send({ type: "RESET" });
            });
        },
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
        updatePeripheral: (c, e) => {
          const id = `${e.peripheral.id}`;
          const registryEntry = c.peripherals[id];
          const actor = registryEntry?.actor;
          if (!actor) {
            return;
          }
          actor.send({ type: "UPDATE_PERIPHERAL", peripheral: e.peripheral });
        },
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
        startScan: async (c) =>
          await c.noble.startScanningAsync(undefined, true),
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
