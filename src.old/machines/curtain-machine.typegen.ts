// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    publishPositionData: "DEVICE_AD_RECEIVED";
    saveRssiInContext: "DEVICE_AD_RECEIVED";
    saveCalibrationInContext: "DEVICE_AD_RECEIVED";
    saveBatteryInContext: "DEVICE_AD_RECEIVED";
    saveLightDataInContext: "DEVICE_AD_RECEIVED";
    open: "OPEN";
    close: "CLOSE";
    pause: "PAUSE";
    moveToPosition: "SET_POSITION";
    connect: "" | "DISCONNECTED" | "xstate.after(10000)#(machine).connecting";
    announceHomeAssistantEntity: "xstate.after(60000)#(machine).connected.periodicallyAnnounce.announce";
    publishRssiData: "xstate.after(30000)#(machine).connected.sendPeriodicData";
    publishCalibrationStatusData: "xstate.after(30000)#(machine).connected.sendPeriodicData";
    publishBatteryData: "xstate.after(30000)#(machine).connected.sendPeriodicData";
    publishLightData: "xstate.after(30000)#(machine).connected.sendPeriodicData";
    disconnect: "xstate.after(10000)#(machine).disconnecting";
  };
  internalEvents: {
    "": { type: "" };
    "xstate.after(10000)#(machine).connecting": {
      type: "xstate.after(10000)#(machine).connecting";
    };
    "xstate.after(60000)#(machine).connected.periodicallyAnnounce.announce": {
      type: "xstate.after(60000)#(machine).connected.periodicallyAnnounce.announce";
    };
    "xstate.after(30000)#(machine).connected.sendPeriodicData": {
      type: "xstate.after(30000)#(machine).connected.sendPeriodicData";
    };
    "xstate.after(10000)#(machine).disconnecting": {
      type: "xstate.after(10000)#(machine).disconnecting";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    listenToEvents: "done.invoke.(machine):invocation[0]";
    receiveStateCommands: "done.invoke.(machine).connected.receiveStateCommands:invocation[0]";
    receivePositionCommands: "done.invoke.(machine).connected.receivePositionCommands:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    listenToEvents: "xstate.init";
    receiveStateCommands: "xstate.init";
    receivePositionCommands: "xstate.init";
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates:
    | "init"
    | "connecting"
    | "connected"
    | "connected.periodicallyAnnounce"
    | "connected.periodicallyAnnounce.announce"
    | "connected.receiveStateCommands"
    | "connected.receivePositionCommands"
    | "connected.sendPeriodicData"
    | "disconnecting"
    | {
        connected?:
          | "periodicallyAnnounce"
          | "receiveStateCommands"
          | "receivePositionCommands"
          | "sendPeriodicData"
          | { periodicallyAnnounce?: "announce" };
      };
  tags: never;
}
