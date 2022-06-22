// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    onRssiUpdate: "RSSI_UPDATE";
    savePeripheral: "UPDATE_PERIPHERAL";
    forwardAdvertisement: "UPDATE_PERIPHERAL";
    parseAdvertisement: "ADVERTISEMENT_RECEIVED";
    onAdvertisement: "ADVERTISEMENT_RECEIVED";
    onServiceData: "SERVICE_DATA_RECEIVED";
    onBasicData: "BASIC_INFORMATION_RECEIVED";
    onConnected: "done.invoke.(machine).connecting:invocation[0]";
    onServicesDiscovered: "done.invoke.(machine).discoveringServices:invocation[0]";
    onReset: "RESET";
    onNotifyData: "NOTIFY_DATA";
    open: "OPEN";
    close: "CLOSE";
    stop: "STOP";
    setPosition: "SET_POSITION";
    sendCommand: "SEND_COMMAND";
    onExit: "xstate.init";
    onStart: "xstate.init";
    onConnecting: "xstate.after(10000)#(machine).error";
    requestPollData:
      | "done.invoke.(machine).discoveringServices:invocation[0]"
      | "RESET"
      | "xstate.after(10000)#(machine).idle.pollNotifyData";
    onPollResponse: "NOTIFY_DATA";
    onDisconnecting: "xstate.init";
    onDisconnected: "done.invoke.(machine).disconnecting:invocation[0]";
    onError:
      | "error.platform.(machine).connecting:invocation[0]"
      | "xstate.after(30000)#(machine).connecting";
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
    "xstate.after(10000)#(machine).error": {
      type: "xstate.after(10000)#(machine).error";
    };
    "xstate.after(10000)#(machine).idle.pollNotifyData": {
      type: "xstate.after(10000)#(machine).idle.pollNotifyData";
    };
    "error.platform.(machine).connecting:invocation[0]": {
      type: "error.platform.(machine).connecting:invocation[0]";
      data: unknown;
    };
    "xstate.after(30000)#(machine).connecting": {
      type: "xstate.after(30000)#(machine).connecting";
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
    connected: "done.invoke.(machine).idle:invocation[0]";
    listenForNotifyData: "done.invoke.(machine).idle.listenForNotifyData:invocation[0]";
    disconnect: "done.invoke.(machine).disconnecting:invocation[0]";
  };
  missingImplementations: {
    actions:
      | "onRssiUpdate"
      | "onServiceData"
      | "onBasicData"
      | "onServicesDiscovered"
      | "onReset"
      | "onError";
    services: "connected";
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    eventListener: "xstate.init";
    connect: "xstate.after(10000)#(machine).error";
    discoverServices: "done.invoke.(machine).connecting:invocation[0]";
    connected:
      | "done.invoke.(machine).discoveringServices:invocation[0]"
      | "RESET";
    listenForNotifyData:
      | "done.invoke.(machine).discoveringServices:invocation[0]"
      | "RESET";
    disconnect: "xstate.init";
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates:
    | "connecting"
    | "discoveringServices"
    | "idle"
    | "idle.listenForNotifyData"
    | "idle.listenForActions"
    | "idle.pollNotifyData"
    | "idle.pollNotifyData.requestPollData"
    | "idle.pollNotifyData.handlePollResponse"
    | "disconnecting"
    | "disconnected"
    | "error"
    | {
        idle?:
          | "listenForNotifyData"
          | "listenForActions"
          | "pollNotifyData"
          | { pollNotifyData?: "requestPollData" | "handlePollResponse" };
      };
  tags: never;
}
