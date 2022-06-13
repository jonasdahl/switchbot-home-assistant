import Switchbot, {
  Advertisement,
  SwitchbotDeviceWoCurtain,
} from "node-switchbot";
import { assign, createMachine } from "xstate";
import {
  HomeAssistantMQTT,
  HomeAssistantMQTTDevice,
} from "../home-assistant-mqtt";
import { logger } from "../utils/logger";

type Context = {
  switchbotDevice: SwitchbotDeviceWoCurtain;
  homeAssistantMqtt: HomeAssistantMQTT;
  switchbot: Switchbot;

  latestRssi: null | { time: Date; rssi: number };
  latestCalibration: null | { time: Date; isCalibrated: boolean };
  latestBattery: null | { time: Date; battery: number };
  latestLightData: null | { time: Date; lightLevel: number };
};

type Event =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "PAUSE" }
  | { type: "DISCONNECTED" }
  | { type: "CONNECTED" }
  | { type: "DEVICE_AD_RECEIVED"; advertisement: Advertisement }
  | { type: "SET_POSITION"; position: number };

export const curtainMachine = createMachine(
  {
    schema: {
      context: {} as any as Context,
      events: {} as any as Event,
      services: {} as any as {
        receiveCommands: { data: never };
        receivePositionCommands: { data: never };
      },
    },
    tsTypes: {} as import("./curtain-machine.typegen").Typegen0,

    initial: "init",
    invoke: { src: "listenToEvents" },
    states: {
      init: { always: "connecting" },
      connecting: {
        entry: "connect",
        after: { 10_000: "connecting" },
        on: { CONNECTED: "connected", DISCONNECTED: "connecting" },
      },
      connected: {
        type: "parallel",
        states: {
          periodicallyAnnounce: {
            initial: "announce",
            states: {
              announce: {
                entry: "announceHomeAssistantEntity",
                after: { 60_000: "announce" },
              },
            },
          },
          receiveStateCommands: {
            invoke: { src: "receiveStateCommands" },
          },
          receivePositionCommands: {
            invoke: { src: "receivePositionCommands" },
          },
          sendPeriodicData: {
            entry: [
              "publishRssiData",
              "publishCalibrationStatusData",
              "publishBatteryData",
              "publishLightData",
            ],
            after: { 30_000: "sendPeriodicData" },
          },
        },

        on: {
          DEVICE_AD_RECEIVED: {
            actions: [
              "publishPositionData",
              "saveRssiInContext",
              "saveCalibrationInContext",
              "saveBatteryInContext",
              "saveLightDataInContext",
            ],
          },

          OPEN: { actions: "open" },
          CLOSE: { actions: "close" },
          PAUSE: { actions: "pause" },
          SET_POSITION: { actions: "moveToPosition" },
          CONNECTED: "connected",
          DISCONNECTED: "connecting",
        },
      },
      disconnecting: {
        entry: "disconnect",
        after: { 10_000: "disconnecting" },
        on: { DISCONNECTED: "connecting", CONNECTED: "connected" },
      },
    },
  },
  {
    actions: {
      connect: (c) => {
        c.switchbotDevice.connect();
      },

      disconnect: (c) => {
        c.switchbotDevice.disconnect();
      },

      open: async ({ switchbotDevice }) => {
        tryRepeatedly(() => switchbotDevice.open()).catch((e) =>
          logger.error(e)
        );
      },

      close: async ({ switchbotDevice }) => {
        tryRepeatedly(() => switchbotDevice.close()).catch((e) =>
          logger.error(e)
        );
      },

      pause: async ({ switchbotDevice }) => {
        tryRepeatedly(() => switchbotDevice.pause()).catch((e) =>
          logger.error(e)
        );
      },

      moveToPosition: async ({ switchbotDevice }, { position }) => {
        if (position < 0 || position > 100) {
          throw new Error("Invalid position: " + position);
        }
        tryRepeatedly(() => switchbotDevice.runToPos(position)).catch((e) =>
          logger.error(e)
        );
      },

      saveRssiInContext: assign(({}, { advertisement }) => {
        const rssi = advertisement.rssi ?? null;
        if (rssi !== null) {
          return { latestRssi: { time: new Date(), rssi } };
        }
        return {};
      }),

      saveCalibrationInContext: assign(({}, { advertisement }) => {
        const isCalibrated = advertisement.serviceData?.calibration ?? null;
        if (isCalibrated !== null) {
          return { latestCalibration: { time: new Date(), isCalibrated } };
        }
        return {};
      }),

      saveBatteryInContext: assign(({}, { advertisement }) => {
        const battery = advertisement.serviceData?.battery ?? null;
        if (battery !== null) {
          return { latestBattery: { time: new Date(), battery } };
        }
        return {};
      }),

      saveLightDataInContext: assign(({}, { advertisement }) => {
        const lightLevel = advertisement.serviceData?.lightLevel ?? null;
        if (lightLevel !== null) {
          return { latestLightData: { time: new Date(), lightLevel } };
        }
        return {};
      }),

      publishBatteryData: ({
        switchbotDevice,
        homeAssistantMqtt,
        latestBattery,
      }) => {
        const log = logger.child({ device: switchbotDevice.id });
        if (!latestBattery) {
          log.warn("There is no latest battery");
          return;
        }
        if (Date.now() - latestBattery.time.getTime() > 5 * 60_000) {
          log.warn("Latest battery is too old");
          return;
        }
        log.debug("Sending battery %s", latestBattery.battery);
        homeAssistantMqtt.publish(
          getBatteryStateTopic(switchbotDevice.id),
          JSON.stringify(latestBattery.battery)
        );
      },

      publishLightData: ({
        switchbotDevice,
        homeAssistantMqtt,
        latestLightData,
      }) => {
        const log = logger.child({ device: switchbotDevice.id });
        if (!latestLightData) {
          log.warn("There is no latest light data");
          return;
        }
        if (Date.now() - latestLightData.time.getTime() > 5 * 60_000) {
          log.warn("Latest light data is too old");
          return;
        }
        log.debug("Sending light data %s", latestLightData.lightLevel);
        homeAssistantMqtt.publish(
          getLightLevelStateTopic(switchbotDevice.id),
          JSON.stringify(latestLightData.lightLevel)
        );
      },

      publishPositionData: (
        { switchbotDevice, homeAssistantMqtt },
        { advertisement }
      ) => {
        const position = advertisement.serviceData?.position ?? null;
        if (position !== null) {
          homeAssistantMqtt.publish(
            getPositionStateTopic(switchbotDevice.id),
            JSON.stringify(100 - position)
          );
        }
      },

      publishRssiData: ({ homeAssistantMqtt, switchbotDevice, latestRssi }) => {
        const log = logger.child({ device: switchbotDevice.id });
        if (!latestRssi) {
          log.warn("There is no latest RSSI");
          return;
        }
        if (Date.now() - latestRssi.time.getTime() > 5 * 60_000) {
          log.warn("Latest RSSI is too old");
          return;
        }
        log.debug("Sending RSSI %s", latestRssi.rssi);
        homeAssistantMqtt.publish(
          getRSSITopic(switchbotDevice.id),
          JSON.stringify(latestRssi.rssi)
        );
      },

      publishCalibrationStatusData: ({
        homeAssistantMqtt,
        switchbotDevice,
        latestCalibration,
      }) => {
        const log = logger.child({ device: switchbotDevice.id });
        if (!latestCalibration) {
          log.warn("There is no latest calibration data");
          return;
        }
        if (Date.now() - latestCalibration.time.getTime() > 5 * 60_000) {
          log.warn("Latest calibration data is too old");
          return;
        }
        log.debug("Sending calibration %d", latestCalibration.isCalibrated);
        homeAssistantMqtt.publish(
          getCalibratedTopic(switchbotDevice.id),
          latestCalibration.isCalibrated ? "on" : "off"
        );
      },

      announceHomeAssistantEntity: ({ homeAssistantMqtt, switchbotDevice }) => {
        const { id, modelName, address } = switchbotDevice;
        const safeId = id.replace(/[^a-zA-Z0-9-]/g, "-");
        if (safeId !== id) {
          throw new Error("Cannot represent ID %as a valid MQTT topic: " + id);
        }

        logger.child({ device: id }).debug("Announcing device %s", id);
        const name = switchbotDevice.modelName;

        const device: HomeAssistantMQTTDevice = {
          model: modelName,
          connections: address ? [["mac", address]] : [],
          identifiers: id,
          manufacturer: "Switchbot",
          name: name,
        };

        homeAssistantMqtt.announceCover({
          unique_id: id + "_cover",
          name: name,
          device,
          device_class: "curtain",
          enabled_by_default: true,
          command_topic: getCommandTopic(id),
          set_position_topic: `switchbot/${safeId}/set_position`,
          position_topic: getPositionStateTopic(id),
          position_closed: 0,
          position_open: 100,
        });

        homeAssistantMqtt.announceSensor({
          unique_id: id + "_battery",
          name: `${name} battery`,
          device,
          device_class: "battery",
          enabled_by_default: true,
          entity_category: "diagnostic",
          state_topic: getBatteryStateTopic(id),
          unit_of_measurement: "%",
        });

        homeAssistantMqtt.announceSensor({
          unique_id: id + "_light_level",
          name: `${name} light level`,
          device,
          device_class: "illuminance",
          enabled_by_default: true,
          state_topic: getLightLevelStateTopic(id),
          unit_of_measurement: "",
        });

        homeAssistantMqtt.announceSensor({
          unique_id: id + "_position",
          name: `${name} position`,
          device,
          enabled_by_default: true,
          state_topic: getPositionStateTopic(id),
          unit_of_measurement: "%",
        });

        homeAssistantMqtt.announceSensor({
          unique_id: id + "_rssi",
          name: `${name} RSSI`,
          device,
          enabled_by_default: true,
          entity_category: "diagnostic",
          state_topic: getRSSITopic(id),
          unit_of_measurement: "dBm",
        });

        homeAssistantMqtt.announceBinarySensor({
          unique_id: id + "_calibrated",
          name: `${name} calibrated`,
          device,
          enabled_by_default: true,
          entity_category: "diagnostic",
          state_topic: getCalibratedTopic(id),
          payload_off: "off",
          payload_on: "on",
        });

        homeAssistantMqtt.announceSensor({
          unique_id: id + "_mac",
          name: `${name} MAC Address`,
          device,
          enabled_by_default: true,
          entity_category: "diagnostic",
          state_topic: getMacAddressTopic(id),
        });

        if (switchbotDevice.address) {
          homeAssistantMqtt.publish(
            getMacAddressTopic(id),
            switchbotDevice.address
          );
        }
      },
    },
    services: {
      listenToEvents: (c) => (send) => {
        c.switchbotDevice.ondisconnect = () => {
          logger.info("Disconnected from %s", c.switchbotDevice.id);
          send({ type: "DISCONNECTED" });
        };
        c.switchbotDevice.onconnect = () => {
          logger.info("Connected to %s", c.switchbotDevice.id);
          send({ type: "CONNECTED" });
        };
      },

      receiveStateCommands:
        ({ homeAssistantMqtt, switchbotDevice }, e) =>
        (send) => {
          const unsubscribe = homeAssistantMqtt.subscribe(
            getCommandTopic(switchbotDevice.id),
            /^switchbot\/(.*)\/set$/,
            ([id], message) => {
              if (!id) {
                throw new Error("Parse failed to find ID");
              }
              switch (getCommand(message)) {
                case "close":
                  send({ type: "CLOSE" });
                  return;
                case "open":
                  send({ type: "OPEN" });
                  return;
                case "pause":
                  send({ type: "PAUSE" });
                  return;
              }
            }
          );

          return () => {
            unsubscribe();
          };
        },
      receivePositionCommands:
        ({ homeAssistantMqtt }) =>
        (send) => {
          console.log("Listening for position commands");
          const unsubscribe = homeAssistantMqtt.subscribe(
            "switchbot/+/set_position",
            /^switchbot\/(.*)\/set_position$/,
            ([id], message) => {
              console.log([id], message);
              if (!id) {
                throw new Error("No ID in topic");
              }
              const command = parseInt(message);
              if (typeof command !== "number" || isNaN(command)) {
                logger.error(
                  "Invalid payload on set_position topic: %s",
                  message
                );
                return;
              }
              send({ type: "SET_POSITION", position: 100 - command });
            }
          );

          return () => {
            unsubscribe();
          };
        },
    },
  }
);

function getCommandTopic(deviceId: string) {
  return `switchbot/${deviceId}/set`;
}

function getBatteryStateTopic(deviceId: string) {
  return `switchbot/${deviceId}/battery`;
}

function getLightLevelStateTopic(deviceId: string) {
  return `switchbot/${deviceId}/light_level`;
}

function getPositionStateTopic(deviceId: string) {
  return `switchbot/${deviceId}/position`;
}

function getRSSITopic(deviceId: string) {
  return `switchbot/${deviceId}/rssi`;
}

function getCalibratedTopic(deviceId: string) {
  return `switchbot/${deviceId}/calibrated`;
}

function getMacAddressTopic(deviceId: string) {
  return `switchbot/${deviceId}/mac`;
}

function getCommand(payload: string) {
  switch (payload) {
    case "OPEN":
      return "open";
    case "CLOSE":
      return "close";
    case "STOP":
      return "pause";
  }
  logger.error("Unrecognized command payload: " + payload);
  return null;
}

async function tryRepeatedly<T>(fn: () => Promise<T>): Promise<T> {
  const numTries = 3;
  let lastError: any = null;
  for (let i = 0; i < numTries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      logger.error("Failed to execute attempt " + (i + 1) + ".");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw lastError;
}
