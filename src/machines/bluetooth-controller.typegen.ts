// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    onStarted: "xstate.init";
    onPoweredOn: "POWERED_ON" | "";
    onPoweredOff: "POWERED_OFF" | "";
    onError:
      | "done.invoke.(machine).on:invocation[0]"
      | "error.platform.(machine).on:invocation[0]";
  };
  internalEvents: {
    "": { type: "" };
    "done.invoke.(machine).on:invocation[0]": {
      type: "done.invoke.(machine).on:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.(machine).on:invocation[0]": {
      type: "error.platform.(machine).on:invocation[0]";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    listenForStateChanges: "done.invoke.(machine):invocation[0]";
    discovery: "done.invoke.(machine).on:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    listenForStateChanges: "xstate.init";
    discovery: "POWERED_ON" | "";
  };
  eventsCausingGuards: {
    stateIsPoweredOn: "";
    stateIsPoweredOff: "";
  };
  eventsCausingDelays: {};
  matchesStates: "unknown" | "on" | "off" | "error";
  tags: never;
}
