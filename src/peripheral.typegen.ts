// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    rssiUpdateReceived: "RSSI_UPDATE";
    error: "error.platform.(machine).connecting:invocation[0]";
    serviceDiscoveryDone: "done.invoke.(machine).connected.discoveringServices:invocation[0]";
    saveServices: "done.invoke.(machine).connected.discoveringServices:invocation[0]";
    serviceDiscoveryError: "error.platform.(machine).connected.discoveringServices:invocation[0]";
    peripheralStarted: "xstate.init";
    connected: "done.invoke.(machine).connecting:invocation[0]";
    serviceDiscoveryStarted: "done.invoke.(machine).connected.discoveringServices:invocation[0]";
  };
  internalEvents: {
    "error.platform.(machine).connecting:invocation[0]": {
      type: "error.platform.(machine).connecting:invocation[0]";
      data: unknown;
    };
    "done.invoke.(machine).connected.discoveringServices:invocation[0]": {
      type: "done.invoke.(machine).connected.discoveringServices:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.(machine).connected.discoveringServices:invocation[0]": {
      type: "error.platform.(machine).connected.discoveringServices:invocation[0]";
      data: unknown;
    };
    "done.invoke.(machine).connecting:invocation[0]": {
      type: "done.invoke.(machine).connecting:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.(machine).disconnecting:invocation[0]": {
      type: "done.invoke.(machine).disconnecting:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "": { type: "" };
    "xstate.after(10000)#(machine).disconnected": {
      type: "xstate.after(10000)#(machine).disconnected";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    eventListener: "done.invoke.(machine):invocation[0]";
    connect: "done.invoke.(machine).connecting:invocation[0]";
    discovery: "done.invoke.(machine).connected.discoveringServices:invocation[0]";
    disconnect: "done.invoke.(machine).disconnecting:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    eventListener: "xstate.init";
    connect: "" | "xstate.after(10000)#(machine).disconnected";
    discovery: "done.invoke.(machine).connected.discoveringServices:invocation[0]";
    disconnect: "xstate.init";
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates:
    | "initial"
    | "error"
    | "connecting"
    | "connected"
    | "connected.discoveringServices"
    | "disconnecting"
    | "disconnected"
    | { connected?: "discoveringServices" };
  tags: never;
}
