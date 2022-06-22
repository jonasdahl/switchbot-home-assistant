// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    reset: "RESET";
    onStarted: "xstate.init";
    onPoweredOn: "POWERED_ON" | "";
    onPoweredOff: "POWERED_OFF" | "";
    onError: "done.invoke.discovery" | "error.platform.discovery";
  };
  internalEvents: {
    "": { type: "" };
    "done.invoke.discovery": {
      type: "done.invoke.discovery";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.discovery": {
      type: "error.platform.discovery";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    listenForStateChanges: "done.invoke.(machine):invocation[0]";
    discovery: "done.invoke.discovery";
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
