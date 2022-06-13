import noble from "@abandonware/noble";
import { createMachine } from "xstate";

type Event = { type: "POWERED_ON" } | { type: "POWERED_OFF" };

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
    entry: "started",
    states: {
      unknown: {
        always: [
          { cond: "stateIsPoweredOn", target: "on" },
          { cond: "stateIsPoweredOff", target: "off" },
        ],
        on: { POWERED_ON: "on", POWERED_OFF: "off" },
      },
      on: {
        entry: "poweredOn",
        on: { POWERED_OFF: "off" },
        invoke: { src: "on", onDone: "error", onError: { target: "error" } },
      },
      off: {
        entry: "poweredOff",
        on: { POWERED_ON: "on" },
      },
      error: { type: "final", entry: "error" },
    },
  },
  {
    actions: {
      error: () => {},
      poweredOff: () => {},
      poweredOn: () => {},
      started: () => {},
    },
    guards: {
      stateIsPoweredOff: (c) => c.noble.state === "poweredOff",
      stateIsPoweredOn: (c) => c.noble.state === "poweredOn",
    },
    services: {
      on: () => () => {},
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
