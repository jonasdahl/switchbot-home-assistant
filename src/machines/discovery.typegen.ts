// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    resetAllPeripherals: "RESET";
    onPeripheralDiscovered: "PERIPHERAL_DISCOVERED";
    saveDiscoveredPeripheral: "PERIPHERAL_DISCOVERED";
    updatePeripheral: "PERIPHERAL_DISCOVERED";
    onExit: "xstate.init";
    onStart: "xstate.init";
    logDevices: "xstate.after(DISCOVERY_LOGGING_INTERVAL)#(machine).logger";
    onError:
      | "error.platform.(machine).discovery.startingScan:invocation[0]"
      | "error.platform.(machine).discovery.scanning:invocation[0]"
      | "error.platform.(machine).discovery.stoppingScan:invocation[0]";
    onScanningStopped: "xstate.init";
    onScanningStarted: "SCAN_STARTED";
  };
  internalEvents: {
    "xstate.after(DISCOVERY_LOGGING_INTERVAL)#(machine).logger": {
      type: "xstate.after(DISCOVERY_LOGGING_INTERVAL)#(machine).logger";
    };
    "done.invoke.(machine).discovery.stoppingScan:invocation[0]": {
      type: "done.invoke.(machine).discovery.stoppingScan:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.(machine).discovery.startingScan:invocation[0]": {
      type: "error.platform.(machine).discovery.startingScan:invocation[0]";
      data: unknown;
    };
    "error.platform.(machine).discovery.scanning:invocation[0]": {
      type: "error.platform.(machine).discovery.scanning:invocation[0]";
      data: unknown;
    };
    "error.platform.(machine).discovery.stoppingScan:invocation[0]": {
      type: "error.platform.(machine).discovery.stoppingScan:invocation[0]";
      data: unknown;
    };
    "": { type: "" };
    "xstate.after(1000)#(machine).discovery.waiting": {
      type: "xstate.after(1000)#(machine).discovery.waiting";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    eventListener: "done.invoke.(machine):invocation[0]";
    startScan: "done.invoke.(machine).discovery.startingScan:invocation[0]";
    scanning: "done.invoke.(machine).discovery.scanning:invocation[0]";
    stopScan: "done.invoke.(machine).discovery.stoppingScan:invocation[0]";
  };
  missingImplementations: {
    actions: "onExit" | "onStart" | "onError";
    services: never;
    guards: never;
    delays: "DISCOVERY_LOGGING_INTERVAL";
  };
  eventsCausingServices: {
    eventListener: "xstate.init";
    scanning: "SCAN_STARTED";
    startScan: "" | "xstate.after(1000)#(machine).discovery.waiting";
    stopScan: "xstate.init";
  };
  eventsCausingGuards: {
    peripheralIsNotKnown: "PERIPHERAL_DISCOVERED";
    peripheralIsKnown: "PERIPHERAL_DISCOVERED";
  };
  eventsCausingDelays: {
    DISCOVERY_LOGGING_INTERVAL: "xstate.init";
  };
  matchesStates:
    | "logger"
    | "discovery"
    | "discovery.idle"
    | "discovery.error"
    | "discovery.startingScan"
    | "discovery.scanning"
    | "discovery.stoppingScan"
    | "discovery.waiting"
    | {
        discovery?:
          | "idle"
          | "error"
          | "startingScan"
          | "scanning"
          | "stoppingScan"
          | "waiting";
      };
  tags: never;
}
