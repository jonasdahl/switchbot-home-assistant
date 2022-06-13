// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    error:
      | "error.platform.(machine).startingScan:invocation[0]"
      | "error.platform.(machine).scanning:invocation[0]"
      | "error.platform.(machine).stoppingScan:invocation[0]";
    peripheralDiscovered: "PERIPHERAL_DISCOVERED";
    startAndSavePeripheralActor: "PERIPHERAL_DISCOVERED";
    scanningStopped: "xstate.init";
    scanningStarted: "done.invoke.(machine).startingScan:invocation[0]";
  };
  internalEvents: {
    "error.platform.(machine).startingScan:invocation[0]": {
      type: "error.platform.(machine).startingScan:invocation[0]";
      data: unknown;
    };
    "error.platform.(machine).scanning:invocation[0]": {
      type: "error.platform.(machine).scanning:invocation[0]";
      data: unknown;
    };
    "error.platform.(machine).stoppingScan:invocation[0]": {
      type: "error.platform.(machine).stoppingScan:invocation[0]";
      data: unknown;
    };
    "done.invoke.(machine).startingScan:invocation[0]": {
      type: "done.invoke.(machine).startingScan:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.(machine).stoppingScan:invocation[0]": {
      type: "done.invoke.(machine).stoppingScan:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "": { type: "" };
    "xstate.after(10000)#(machine).waiting": {
      type: "xstate.after(10000)#(machine).waiting";
    };
    "xstate.after(10000)#(machine).scanning": {
      type: "xstate.after(10000)#(machine).scanning";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    startScan: "done.invoke.(machine).startingScan:invocation[0]";
    scanning: "done.invoke.(machine).scanning:invocation[0]";
    stopScan: "done.invoke.(machine).stoppingScan:invocation[0]";
  };
  missingImplementations: {
    actions: "error" | "peripheralDiscovered";
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    startScan: "" | "xstate.after(10000)#(machine).waiting";
    scanning: "done.invoke.(machine).startingScan:invocation[0]";
    stopScan: "xstate.after(10000)#(machine).scanning";
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates:
    | "idle"
    | "startingScan"
    | "scanning"
    | "stoppingScan"
    | "waiting";
  tags: never;
}
