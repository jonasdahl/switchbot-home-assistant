import noble from "@abandonware/noble";
import { createMachine, send } from "xstate";

type Event =
  | { type: "POWERED_ON" }
  | { type: "POWERED_OFF" }
  | { type: "RESET" };

export const bluetoothControllerMachine = createMachine(
  {
    tsTypes: {} as import("./bluetooth-controller.typegen").Typegen0,
    schema: {
      context: {} as { noble: typeof noble },
      services: {} as { listenForStateChanges: never },
      events: {} as Event,
    },
    initial: "unknown",
    invoke: { src: "listenForStateChanges" },
    entry: "onStarted",
    context: { noble },
    states: {
      unknown: {
        always: [
          { cond: "stateIsPoweredOn", target: "on" },
          { cond: "stateIsPoweredOff", target: "off" },
        ],
        on: { POWERED_ON: "on", POWERED_OFF: "off" },
      },
      on: {
        entry: "onPoweredOn",
        on: { POWERED_OFF: "off", RESET: { actions: "reset" } },
        invoke: {
          id: "discovery",
          src: "discovery",
          onDone: "error",
          onError: "error",
        },
      },
      off: { entry: "onPoweredOff", on: { POWERED_ON: "on" } },
      error: { type: "final", entry: "onError" },
    },
  },
  {
    actions: {
      onError: () => {},
      onPoweredOff: () => {},
      onPoweredOn: () => {},
      onStarted: () => {},
      reset: send({ type: "RESET" }, { to: "discovery" }),
    },
    guards: {
      stateIsPoweredOff: (c) => c.noble.state === "poweredOff",
      stateIsPoweredOn: (c) => c.noble.state === "poweredOn",
    },
    services: {
      discovery: () => () => {},
      listenForStateChanges: (c) => (send) => {
        const handler = (state: string) => {
          if (state === "poweredOn") {
            send({ type: "POWERED_ON" });
          }
          if (state === "poweredOff") {
            send({ type: "POWERED_OFF" });
          }
        };
        c.noble.on("stateChange", handler);
        return () => {
          c.noble.removeListener("stateChange", handler);
        };
      },
    },
  }
);
