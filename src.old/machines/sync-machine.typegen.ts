// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    handleDeviceAdvertisement: "DEVICE_AD_RECEIVED";
    createOrUpdateDeviceActors: "done.invoke.sync.discoverDevices:invocation[0]";
    onDiscoveredDevices: "xstate.init";
    onDiscoverDevices: "xstate.after(60000)#sync.idle";
  };
  internalEvents: {
    "done.invoke.sync.discoverDevices:invocation[0]": {
      type: "done.invoke.sync.discoverDevices:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "xstate.after(60000)#sync.idle": { type: "xstate.after(60000)#sync.idle" };
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
    discovery: "xstate.after(60000)#sync.idle";
    scan: "done.invoke.sync.discoverDevices:invocation[0]";
  };
  eventsCausingGuards: {
    actorIsKnown: "DEVICE_AD_RECEIVED";
  };
  eventsCausingDelays: {};
  matchesStates: "discoverDevices" | "idle" | "done" | "error";
  tags: never;
}
