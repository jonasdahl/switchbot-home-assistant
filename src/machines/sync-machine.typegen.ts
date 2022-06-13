// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    createOrUpdateDeviceActors: "done.invoke.sync.discoverDevices:invocation[0]";
    handleDeviceAdvertisement: "DEVICE_AD_RECEIVED";
    onDiscoveredDevices: "xstate.init";
    onDiscoverDevices: "xstate.init";
  };
  internalEvents: {
    "done.invoke.sync.discoverDevices:invocation[0]": {
      type: "done.invoke.sync.discoverDevices:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    discovery: "done.invoke.sync.discoverDevices:invocation[0]";
    scan: "done.invoke.sync.idle:invocation[0]";
  };
  missingImplementations: {
    actions: "onDiscoveredDevices" | "onDiscoverDevices";
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    discovery: "xstate.init";
    scan: "done.invoke.sync.discoverDevices:invocation[0]";
  };
  eventsCausingGuards: {
    actorIsKnown: "DEVICE_AD_RECEIVED";
  };
  eventsCausingDelays: {};
  matchesStates: "discoverDevices" | "idle" | "done" | "error";
  tags: never;
}
