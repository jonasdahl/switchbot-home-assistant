import Switchbot, { Advertisement, AnySwitchbotDevice } from "node-switchbot";
import { ActorRefFrom, assign, createMachine, spawn } from "xstate";
import { HomeAssistantMQTT } from "../home-assistant-mqtt";
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
        entry: "onDiscoverDevices",
        exit: "onDiscoveredDevices",
        invoke: {
          src: "discovery",
          onDone: { target: "idle", actions: "createOrUpdateDeviceActors" },
          onError: "error",
        },
      },
      idle: {
        invoke: { src: "scan", onDone: { target: "done" } },
        on: {
          DEVICE_AD_RECEIVED: [
            { cond: "actorIsKnown", actions: "handleDeviceAdvertisement" },
          ],
        },
      },
      done: { type: "final" },
      error: { type: "final" },
    },
  },
  {
    guards: {
      actorIsKnown: ({ deviceActors }, { advertisement }) => {
        return !!deviceActors[advertisement.id];
      },
    },
    actions: {
      handleDeviceAdvertisement: ({ deviceActors }, { advertisement }) => {
        const actor = deviceActors[advertisement.id];
        if (!actor) {
          throw new Error("Actor is not in context.");
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
