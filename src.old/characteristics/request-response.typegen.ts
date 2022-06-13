// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    dataReceived: "DATA_RECEIVED";
    saveRequest: "done.invoke.(machine).subscribed.createRequest:invocation[0]";
    started:
      | "xstate.after(10000)#(machine).error"
      | "done.invoke.(machine).unsubscribing:invocation[0]";
    error:
      | "error.platform.(machine).subscribing:invocation[0]"
      | "error.platform.(machine).subscribed:invocation[0]";
    requestData: "done.invoke.(machine).subscribed.createRequest:invocation[0]";
  };
  internalEvents: {
    "done.invoke.(machine).subscribed.createRequest:invocation[0]": {
      type: "done.invoke.(machine).subscribed.createRequest:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "xstate.after(10000)#(machine).error": {
      type: "xstate.after(10000)#(machine).error";
    };
    "done.invoke.(machine).unsubscribing:invocation[0]": {
      type: "done.invoke.(machine).unsubscribing:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.(machine).subscribing:invocation[0]": {
      type: "error.platform.(machine).subscribing:invocation[0]";
      data: unknown;
    };
    "error.platform.(machine).subscribed:invocation[0]": {
      type: "error.platform.(machine).subscribed:invocation[0]";
      data: unknown;
    };
    "": { type: "" };
    "done.invoke.(machine).subscribing:invocation[0]": {
      type: "done.invoke.(machine).subscribing:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.(machine).subscribed:invocation[0]": {
      type: "done.invoke.(machine).subscribed:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.(machine).subscribed.createRequest:invocation[0]": {
      type: "error.platform.(machine).subscribed.createRequest:invocation[0]";
      data: unknown;
    };
    "xstate.after(10000)#(machine).subscribed.waiting": {
      type: "xstate.after(10000)#(machine).subscribed.waiting";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    subscribe: "done.invoke.(machine).subscribing:invocation[0]";
    subscribeToData: "done.invoke.(machine).subscribed:invocation[0]";
    createRequest: "done.invoke.(machine).subscribed.createRequest:invocation[0]";
    unsubscribe: "done.invoke.(machine).unsubscribing:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    services: "createRequest";
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    subscribe: "";
    subscribeToData: "done.invoke.(machine).subscribing:invocation[0]";
    unsubscribe: "done.invoke.(machine).subscribed:invocation[0]";
    createRequest:
      | "error.platform.(machine).subscribed.createRequest:invocation[0]"
      | "xstate.after(10000)#(machine).subscribed.waiting";
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates:
    | "initial"
    | "error"
    | "subscribing"
    | "subscribed"
    | "subscribed.createRequest"
    | "subscribed.requesting"
    | "subscribed.waiting"
    | "unsubscribing"
    | { subscribed?: "createRequest" | "requesting" | "waiting" };
  tags: never;
}
