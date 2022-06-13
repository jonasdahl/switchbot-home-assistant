// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    onRssiUpdate: "RSSI_UPDATE";
    onConnected: "done.invoke.(machine).connecting:invocation[0]";
    onServicesDiscovered: "done.invoke.(machine).discoveringServices:invocation[0]";
    onNotifyData: "NOTIFY_DATA";
    onExit: "xstate.init";
    onStart: "xstate.init";
    onConnecting: "error.platform.(machine).connecting:invocation[0]";
    pollNotifyData: "xstate.init";
    onPollResponse: "NOTIFY_DATA";
    onDisconnecting: "xstate.init";
    onDisconnected: "done.invoke.(machine).disconnecting:invocation[0]";
    onError: "xstate.init";
  };
  internalEvents: {
    "done.invoke.(machine).connecting:invocation[0]": {
      type: "done.invoke.(machine).connecting:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.(machine).discoveringServices:invocation[0]": {
      type: "done.invoke.(machine).discoveringServices:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.(machine).connecting:invocation[0]": {
      type: "error.platform.(machine).connecting:invocation[0]";
      data: unknown;
    };
    "xstate.after(10000)#(machine).idle.pollNotifyData": {
      type: "xstate.after(10000)#(machine).idle.pollNotifyData";
    };
    "done.invoke.(machine).disconnecting:invocation[0]": {
      type: "done.invoke.(machine).disconnecting:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    eventListener: "done.invoke.(machine):invocation[0]";
    connect: "done.invoke.(machine).connecting:invocation[0]";
    discoverServices: "done.invoke.(machine).discoveringServices:invocation[0]";
    listenForNotifyData: "done.invoke.(machine).idle.listenForNotifyData:invocation[0]";
    disconnect: "done.invoke.(machine).disconnecting:invocation[0]";
  };
  missingImplementations: {
    actions:
      | "onRssiUpdate"
      | "onServicesDiscovered"
      | "onNotifyData"
      | "onError";
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    eventListener: "xstate.init";
    connect: "error.platform.(machine).connecting:invocation[0]";
    discoverServices: "done.invoke.(machine).connecting:invocation[0]";
    listenForNotifyData: "xstate.init";
    disconnect: "xstate.init";
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates:
    | "connecting"
    | "discoveringServices"
    | "idle"
    | "idle.listenForNotifyData"
    | "idle.pollNotifyData"
    | "idle.pollNotifyData.requestPollData"
    | "idle.pollNotifyData.handlePollResponse"
    | "disconnecting"
    | "disconnected"
    | "error"
    | {
        idle?:
          | "listenForNotifyData"
          | "pollNotifyData"
          | { pollNotifyData?: "requestPollData" | "handlePollResponse" };
      };
  tags: never;
}
