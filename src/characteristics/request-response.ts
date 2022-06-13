import { Characteristic } from "@abandonware/noble";
import { assign, createMachine } from "xstate";
import { logger } from "../utils/logger";

type Event = { type: "DATA_RECEIVED"; data: Buffer };

export const requestResponseCharacteristicMachine = createMachine(
  {
    tsTypes: {} as import("./request-response.typegen").Typegen0,
    schema: {
      context: {} as { characteristic: Characteristic; request?: Buffer },
      services: {} as {
        run: { data: null };
        subscribeToData: { data: any };
        subscribe: { data: void };
        unsubscribe: { data: void };
        createRequest: { data: Buffer };
      },
      events: {} as Event,
    },
    initial: "initial",
    states: {
      initial: {
        entry: "started",
        always: "subscribing",
      },
      error: { entry: "error", after: { 10_000: "initial" } },
      subscribing: {
        invoke: { src: "subscribe", onDone: "subscribed", onError: "error" },
      },
      subscribed: {
        invoke: {
          src: "subscribeToData",
          onDone: "unsubscribing",
          onError: "error",
        },
        initial: "createRequest",
        states: {
          createRequest: {
            invoke: {
              src: "createRequest",
              onDone: { target: "requesting", actions: "saveRequest" },
              onError: "..error",
            },
          },
          requesting: { entry: "requestData", always: "waiting" },
          waiting: { after: { 10_000: "createRequest" } },
        },
      },
      unsubscribing: {
        invoke: { src: "unsubscribe", onDone: "initial" },
      },
    },
    on: {
      DATA_RECEIVED: { actions: "dataReceived" },
    },
  },
  {
    actions: {
      error: (c, e) => {
        logger.error(e.data);
        logger.error(
          "An error occurred in request-response characteristic %s",
          c.characteristic.uuid
        );
      },
      saveRequest: assign((c, e) => ({ request: e.data })),
      started: (c) =>
        logger.debug("Characteristic started: %s", c.characteristic.uuid),
      dataReceived: (c) =>
        logger.warn(
          "Data received for characteristic %s",
          c.characteristic.uuid
        ),
      requestData: async (c) => {
        logger.debug(
          "Requesting data for characteristic %s: 0x%s",
          c.characteristic.uuid,
          c.request!.toString("hex")
        );
        await c.characteristic.writeAsync(c.request!, false);
      },
    },
    services: {
      subscribeToData: (c) => (send) => {
        const handler = (data: Buffer) => {
          send({ type: "DATA_RECEIVED", data });
        };
        c.characteristic.on("data", handler);
        return () => {
          c.characteristic.removeListener("data", handler);
        };
      },
      subscribe: async (c) => {
        await c.characteristic.subscribeAsync();
      },
      unsubscribe: async (c) => {
        await c.characteristic.subscribeAsync();
      },
    },
  }
);
