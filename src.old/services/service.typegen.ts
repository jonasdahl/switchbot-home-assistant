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
    "": { type: "" };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    discoverCharacteristics: "done.invoke.(machine).discoveringCharacteristics:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    discoverCharacteristics: "";
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates: "initial" | "discoveringCharacteristics";
  tags: never;
}
