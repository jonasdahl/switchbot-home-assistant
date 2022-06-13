import { Peripheral, Service } from "@abandonware/noble";
import { ActorRefFrom, assign, createMachine, spawn } from "xstate";
import { serviceMachine } from "./services/service";
import { logger } from "./utils/logger";

type Event =
  | { type: "DISCONNECTED" }
  | { type: "CONNECTED" }
  | { type: "RSSI_UPDATE"; rssi: number };

export const peripheralMachine = createMachine(
  {
    tsTypes: {} as import("./peripheral.typegen").Typegen0,
    schema: {
      context: {} as {
        peripheral: Peripheral;
        services: Record<
          string,
          { service: Service; actor: ActorRefFrom<typeof serviceMachine> }
        >;
      },
      services: {} as {
        discovery: { data: Service[] };
        connect: { data: void };
      },
      events: {} as Event,
    },
    initial: "initial",
    invoke: { src: "eventListener" },
    states: {
      initial: {
        entry: "peripheralStarted",
        always: "connecting",
      },
      error: {},
      connecting: {
        invoke: {
          src: "connect",
          onDone: "connected",
          onError: { actions: "error", target: "error" },
        },
      },
      connected: {
        entry: "connected",
        on: {
          DISCONNECTED: "disconnected",
        },
        initial: "discoveringServices",
        states: {
          discoveringServices: {
            entry: "serviceDiscoveryStarted",
            invoke: {
              src: "discovery",
              onDone: {
                target: "..disconnecting",
                actions: ["serviceDiscoveryDone", "saveServices"],
              },
              onError: { actions: "serviceDiscoveryError" },
            },
          },
        },
      },
      disconnecting: {
        invoke: { src: "disconnect", onDone: "disconnected" },
      },
      disconnected: {
        after: { 10_000: "connecting" },
      },
    },
    on: {
      RSSI_UPDATE: { actions: "rssiUpdateReceived" },
    },
  },
  {
    actions: {
      peripheralStarted: ({ peripheral }) =>
        logger.debug("Peripheral started: %s", peripheral.id),
      serviceDiscoveryStarted: (c) =>
        logger.debug("Service discovery started for %s", c.peripheral.id),
      serviceDiscoveryDone: (c, e) =>
        logger.debug("Service discovery done: %s, %s", c.peripheral.id, e.data),
      serviceDiscoveryError: (c) =>
        logger.error("Service discovery error: %s", c.peripheral.id),
      error: (c) => logger.error("Peripheral error: %s", c.peripheral.id),
      connected: (c) => logger.debug("Connected to: %s", c.peripheral.id),
      rssiUpdateReceived: (c, e) =>
        logger.debug(
          "RSSI update received for %s: %d",
          c.peripheral.id,
          e.rssi
        ),
      saveServices: assign((c, e) => {
        const services = e.data.reduce((result, service) => {
          const id = service.uuid;
          const actor = spawn(
            serviceMachine.withContext({ service, characteristics: {} })
          );
          return {
            ...result,
            [id]: { service, actor: actor },
          };
        }, c.services ?? {});

        return { services };
      }),
    },
    services: {
      connect: async (c) => {
        await c.peripheral.connectAsync();
      },
      disconnect: async (c) => {
        await c.peripheral.disconnectAsync();
      },
      discovery: async (c) => {
        return await c.peripheral.discoverServicesAsync();
      },
      eventListener: (c) => (send) => {
        const disconnectHandler = () => send({ type: "DISCONNECTED" });
        const connectHandler = () => send({ type: "CONNECTED" });
        const rssiHandler = (rssi: number) =>
          send({ type: "RSSI_UPDATE", rssi });

        c.peripheral.on("disconnect", disconnectHandler);
        c.peripheral.on("connect", connectHandler);
        c.peripheral.on("rssiUpdate", rssiHandler);

        return () => {
          c.peripheral.removeListener("disconnect", disconnectHandler);
          c.peripheral.removeListener("connect", connectHandler);
          c.peripheral.removeListener("rssiUpdate", rssiHandler);
        };
      },
    },
  }
);
