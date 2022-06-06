import Switchbot, { Advertisement, AnySwitchbotDevice } from "node-switchbot";
import { ActorRefFrom, assign, createMachine, spawn } from "xstate";
import { HomeAssistantMQTT } from "../home-assistant-mqtt";
import { logger } from "../utils/logger";
import { curtainMachine } from "./curtain-machine";

type Event = { type: "DEVICE_AD_RECEIVED"; advertisement: Advertisement };
type Context = {
  switchbot: Switchbot;
  homeAssistantMqtt: HomeAssistantMQTT;
  deviceActors: Record<string, ActorRefFrom<typeof curtainMachine>>;
};

export const syncMachine = createMachine(
  {
    initial: "discoverDevices",
    id: "sync",
    schema: {
      events: {} as any as Event,
      context: {} as any as Context,
      services: {} as any as {
        discovery: { data: AnySwitchbotDevice[] };
        scan: { data: never };
      },
    },
    tsTypes: {} as import("./sync-machine.typegen").Typegen0,
    states: {
      discoverDevices: {
        invoke: {
          src: "discovery",
          onDone: { target: "idle", actions: "createOrUpdateDeviceActors" },
          onError: "error",
        },
      },
      idle: {
        invoke: { src: "scan", onDone: { target: "done" } },
        on: {
          DEVICE_AD_RECEIVED: { actions: "handleDeviceAdvertisement" },
        },
      },
      done: { type: "final" },
      error: { type: "final" },
    },
  },
  {
    actions: {
      handleDeviceAdvertisement: ({ deviceActors }, { advertisement }) => {
        const actor = deviceActors[advertisement.id];
        if (!actor) {
          logger.error(
            "Got advertisement from undiscovered device %s, this should probably create a new actor right?",
            advertisement.id
          );
          logger.info(
            "Available IDs are %s",
            JSON.stringify(Object.keys(deviceActors))
          );
          return;
        }
        actor.send({ type: "DEVICE_AD_RECEIVED", advertisement });
      },

      createOrUpdateDeviceActors: assign(
        ({ deviceActors, homeAssistantMqtt, switchbot }, { data }) => {
          const newActors = { ...deviceActors };
          for (const device of data) {
            if (device.model !== "c") {
              continue;
            }
            if (newActors[device.id]) {
              continue;
            }
            const actor = spawn(
              curtainMachine.withContext({
                switchbotDevice: device,
                homeAssistantMqtt,
                switchbot,

                latestRssi: null,
                latestBattery: null,
                latestCalibration: null,
                latestLightData: null,
              }),
              { name: `device-${device.id}` }
            );
            actor.subscribe((state) => {
              logger
                .child({ deviceId: device.id })
                .info(
                  "Actor state changed over %s: %s",
                  state.transitions[state.transitions.length - 1]?.eventType,
                  JSON.stringify(state.value)
                );
            });
            newActors[device.id] = actor;
          }
          return { deviceActors: newActors };
        }
      ),
    },
    services: {
      discovery: async ({ switchbot }) => {
        return await switchbot.discover();
      },

      scan:
        ({ switchbot }) =>
        (send) => {
          switchbot.onadvertisement = (advertisement) => {
            send({ type: "DEVICE_AD_RECEIVED", advertisement });
          };
          switchbot.startScan();
          return () => {
            switchbot.onadvertisement = null;
            switchbot.stopScan();
          };
        },
    },
  }
);
