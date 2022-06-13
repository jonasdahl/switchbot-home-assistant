// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    characteristicsDiscovered: "done.invoke.(machine).discoveringCharacteristics:invocation[0]";
    started: "xstate.init";
  };
  internalEvents: {
    "done.invoke.(machine).discoveringCharacteristics:invocation[0]": {
      type: "done.invoke.(machine).discoveringCharacteristics:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    discoverCharacteristics: "done.invoke.(machine).discoveringCharacteristics:invocation[0]";
  };
  missingImplementations: {
    actions: "started";
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    discoverCharacteristics: "xstate.init";
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates: "discoveringCharacteristics";
  tags: never;
}
