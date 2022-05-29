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
    announceHomeAssistantEntity: "xstate.after(60000)#(machine).periodicallyAnnounce.announce";
    publishRssiData: "xstate.after(30000)#(machine).sendPeriodicData";
    publishCalibrationStatusData: "xstate.after(30000)#(machine).sendPeriodicData";
    publishBatteryData: "xstate.after(30000)#(machine).sendPeriodicData";
    publishLightData: "xstate.after(30000)#(machine).sendPeriodicData";
  };
  internalEvents: {
    "xstate.after(60000)#(machine).periodicallyAnnounce.announce": {
      type: "xstate.after(60000)#(machine).periodicallyAnnounce.announce";
    };
    "xstate.after(30000)#(machine).sendPeriodicData": {
      type: "xstate.after(30000)#(machine).sendPeriodicData";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    receiveStateCommands: "done.invoke.(machine).receiveStateCommands:invocation[0]";
    receivePositionCommands: "done.invoke.(machine).receivePositionCommands:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    receiveStateCommands: "xstate.init";
    receivePositionCommands: "xstate.init";
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates:
    | "periodicallyAnnounce"
    | "periodicallyAnnounce.announce"
    | "receiveStateCommands"
    | "receivePositionCommands"
    | "sendPeriodicData"
    | { periodicallyAnnounce?: "announce" };
  tags: never;
}
