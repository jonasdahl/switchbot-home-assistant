import { Peripheral } from "@abandonware/noble";
import { Logger } from "pino";
import { ContextFrom } from "xstate";
import { HassClient } from "../home-assistant-mqtt";
import { peripheralMachine } from "../machines/peripheral";

export function createSwitchbotCurtainMachine({
  peripheral,
  hassClient,
  logger,
}: {
  logger: Logger;
  hassClient: HassClient;
  peripheral: Peripheral;
}) {
  const announceAll = (c: ContextFrom<typeof peripheralMachine>) => {
    hassClient
      .device(c.peripheral.id)
      .getEntities()
      .forEach((entity) => entity.announce());
  };

  const reportAllUnavailable = (c: ContextFrom<typeof peripheralMachine>) => {
    hassClient
      .device(c.peripheral.id)
      .getEntities()
      .filter((e) => e.entityId !== CONNECTION_STATUS_SENSOR_ID)
      .forEach((entity) => entity.announce().reportAvailability(false));
  };

  const reportAllAvailable = (c: ContextFrom<typeof peripheralMachine>) => {
    hassClient
      .device(c.peripheral.id)
      .getEntities()
      .forEach((entity) => entity.announce().reportAvailability(true));
  };

  setupEntities(hassClient, peripheral);

  return peripheralMachine.withContext({ peripheral }).withConfig({
    actions: {
      onAdvertisement: (c) => {
        hassClient
          .device(c.peripheral.id)
          .sensor(RSSI_SENSOR_ID)
          .reportState(c.peripheral.rssi);
      },
      onReset: (c) => {
        announceAll(c);
      },
      onServiceData: (c, e) => {
        const device = hassClient.device(c.peripheral.id);
        device
          .cover(COVER_ID)
          .reportPosition(e.data.position)
          .reportState("closed");
        device.sensor(LIGHT_LEVEL_SENSOR_ID).reportState(e.data.lightLevel);
        device.sensor(BATTERY_SENSOR_ID).reportState(e.data.battery);
        device
          .binarySensor(ALLOW_CONNECTION_BINARY_SENSOR_ID)
          .reportState(!!e.data.allowConnection);
        device
          .sensor(MOVEMENT_STATUS_SENSOR_ID)
          .reportState(e.data.movementStatus);
      },
      onBasicData: (c, e) => {
        const device = hassClient.device(c.peripheral.id);
        device.sensor(BATTERY_SENSOR_ID).reportState(e.data.battery);
        device
          .sensor(FIRMWARE_VERSION_SENSOR_ID)
          .reportState(e.data.firmwareVersion);
        device
          .sensor(DEVICE_CHAIN_LENGTH_SENSOR_ID)
          .reportState(e.data.deviceChainLength);
        device
          .binarySensor(CALIBRATED_BINARY_SENSOR_ID)
          .reportState(!!e.data.calibrated);
        device.sensor(DIRECTION_SENSOR_ID).reportState(e.data.direction);
        device
          .binarySensor(TOUCH_AND_GO_BINARY_SENSOR_ID)
          .reportState(!!e.data.touchAndGo);
        device
          .binarySensor(LIGHTING_EFFECT_BINARY_SENSOR_ID)
          .reportState(!!e.data.lightingEffect);
        device
          .binarySensor(SOLAR_PANEL_PLUGGED_IN_BINARY_SENSOR_ID)
          .reportState(!!e.data.solarPanelPluggedIn);
        device.sensor(TIMER_COUNT_SENSOR_ID).reportState(e.data.timerCount);
        device.sensor(MOTION_STATUS_SENSOR_ID).reportState(e.data.motionStatus);
        device.cover(COVER_ID).reportPosition(e.data.currentPosition);
      },
      onRssiUpdate: (c) => {
        logger.trace(
          "Got RSSI update for peripheral %s: %d",
          c.peripheral.id,
          c.peripheral.rssi
        );
        hassClient
          .device(c.peripheral.id)
          .sensor(RSSI_SENSOR_ID)
          .reportState(c.peripheral.rssi);
      },
      onStart: (c) => {
        hassClient.device(c.peripheral.id).cover(COVER_ID).announce();
        logger.info("Started machine for peripheral: %s", c.peripheral.id);
        const device = hassClient.device(c.peripheral.id);
        reportAllUnavailable(c);
        device.sensor(CONNECTION_STATUS_SENSOR_ID).reportState("unknown");
      },
      onExit: (c) => {
        logger.warn("Stopped machine for peripheral: %s", c.peripheral.id);
        hassClient
          .device(c.peripheral.id)
          .getEntities()
          .filter((e) => e.entityId !== CONNECTION_STATUS_SENSOR_ID)
          .forEach((entity) => entity.announce().reportAvailability(false));
        hassClient
          .device(c.peripheral.id)
          .sensor(CONNECTION_STATUS_SENSOR_ID)
          .reportState("disconnected");
      },
      onConnected: (c) => {
        logger.debug("Connected to peripheral %s", c.peripheral.id);
        reportAllAvailable(c);
      },
      onDisconnected: (c) => {
        logger.warn("Disconnected from peripheral %s", c.peripheral.id);
        reportAllUnavailable(c);
        hassClient
          .device(c.peripheral.id)
          .sensor(CONNECTION_STATUS_SENSOR_ID)
          .reportState("disconnected");
      },
      onConnecting: (c) => {
        logger.debug("Connecting to peripheral %s...", c.peripheral.id);
        hassClient
          .device(c.peripheral.id)
          .sensor(CONNECTION_STATUS_SENSOR_ID)
          .reportState("connecting");
      },
      onServicesDiscovered: (c) => {
        logger.debug(
          "Services and characteristics discovered for peripheral %s: %o",
          c.peripheral.id,
          c.peripheral.services.map((s) => ({
            uuid: s.uuid,
            characteristics: s.characteristics.map((c) => ({
              uuid: c.uuid,
            })),
          }))
        );
      },
      onError: (c, e) => {
        logger.error("Error in peripheral: %s", c.peripheral.id);
        logger.error(e);
      },
    },
    services: {
      connected: (c) => (send) => {
        const cover = hassClient.device(c.peripheral.id).cover(COVER_ID);
        const onCommand = cover.onCommand((command) => {
          logger.warn("Got command: %s", command);
          switch (command) {
            case "open":
              send({ type: "OPEN" });
              break;
            case "close":
              send({ type: "CLOSE" });
              break;
            case "stop":
              send({ type: "STOP" });
              break;
          }
        });
        const onSetPosition = cover.onSetPosition((position) => {
          logger.warn("Setting position: %s", position);
          send({ type: "SET_POSITION", position });
        });
        return () => {
          onCommand.unsubscribe();
          onSetPosition.unsubscribe();
        };
      },
    },
  });
}

function setupEntities(hassClient: HassClient, peripheral: Peripheral) {
  const device = hassClient.device(peripheral.id).setMetadata({
    name: (
      peripheral.advertisement.localName +
      " " +
      peripheral.id.slice(0, 4)
    ).trim(),
  });
  device.cover(COVER_ID).setEntityMeta({ name: COVER_NAME });
  device.binarySensor(ALLOW_CONNECTION_BINARY_SENSOR_ID).setEntityMeta({
    name: ALLOW_CONNECTION_BINARY_SENSOR_NAME,
    entityCategory: "config",
    enabledByDefault: false,
  });
  device
    .sensor(CONNECTION_STATUS_SENSOR_ID)
    .setEntityMeta({
      name: CONNECTION_STATUS_SENSOR_NAME,
      unitOfMeasurement: "",
      entityCategory: "diagnostic",
      enabledByDefault: false,
    })
    .reportState("connected");
  device.sensor(BATTERY_SENSOR_ID).setEntityMeta({
    name: BATTERY_SENSOR_NAME,
    unitOfMeasurement: "%",
    entityCategory: "diagnostic",
    enabledByDefault: false,
  });
  device.sensor(MOVEMENT_STATUS_SENSOR_ID).setEntityMeta({
    name: MOVEMENT_STATUS_SENSOR_NAME,
    unitOfMeasurement: "",
    entityCategory: "diagnostic",
    enabledByDefault: false,
  });
  device.sensor(RSSI_SENSOR_ID).setEntityMeta({
    name: RSSI_SENSOR_NAME,
    unitOfMeasurement: "dBm",
    entityCategory: "diagnostic",
    enabledByDefault: false,
  });
  device
    .sensor(LIGHT_LEVEL_SENSOR_ID)
    .setEntityMeta({
      name: LIGHT_LEVEL_SENSOR_NAME,
      unitOfMeasurement: "",
      enabledByDefault: false,
    });
  device.sensor(FIRMWARE_VERSION_SENSOR_ID).setEntityMeta({
    name: FIRMWARE_VERSION_SENSOR_NAME,
    unitOfMeasurement: "",
    entityCategory: "diagnostic",
    enabledByDefault: false,
  });
  device.sensor(DEVICE_CHAIN_LENGTH_SENSOR_ID).setEntityMeta({
    name: DEVICE_CHAIN_LENGTH_SENSOR_NAME,
    unitOfMeasurement: "",
    entityCategory: "diagnostic",
    enabledByDefault: false,
  });
  device.binarySensor(CALIBRATED_BINARY_SENSOR_ID).setEntityMeta({
    name: CALIBRATED_BINARY_SENSOR_NAME,
    entityCategory: "diagnostic",
    enabledByDefault: false,
  });
  device.sensor(DIRECTION_SENSOR_ID).setEntityMeta({
    name: DIRECTION_SENSOR_NAME,
    unitOfMeasurement: "",
    entityCategory: "config",
    enabledByDefault: false,
  });
  device.binarySensor(TOUCH_AND_GO_BINARY_SENSOR_ID).setEntityMeta({
    name: TOUCH_AND_GO_BINARY_SENSOR_NAME,
    entityCategory: "config",
    enabledByDefault: false,
  });
  device.binarySensor(LIGHTING_EFFECT_BINARY_SENSOR_ID).setEntityMeta({
    name: LIGHTING_EFFECT_BINARY_SENSOR_NAME,
    entityCategory: "diagnostic",
    enabledByDefault: false,
  });
  device.binarySensor(SOLAR_PANEL_PLUGGED_IN_BINARY_SENSOR_ID).setEntityMeta({
    name: SOLAR_PANEL_PLUGGED_IN_BINARY_SENSOR_NAME,
    entityCategory: "diagnostic",
    enabledByDefault: false,
  });
  device.sensor(TIMER_COUNT_SENSOR_ID).setEntityMeta({
    name: TIMER_COUNT_SENSOR_NAME,
    unitOfMeasurement: "",
    entityCategory: "diagnostic",
    enabledByDefault: false,
  });
  device.sensor(MOTION_STATUS_SENSOR_ID).setEntityMeta({
    name: MOTION_STATUS_SENSOR_NAME,
    unitOfMeasurement: "",
    enabledByDefault: false,
  });
}

export const COVER_ID = "cover";
export const COVER_NAME = "Curtain";

export const LIGHT_LEVEL_SENSOR_ID = "lightlevel";
export const LIGHT_LEVEL_SENSOR_NAME = "Light level";

export const BATTERY_SENSOR_ID = "battery";
export const BATTERY_SENSOR_NAME = "Battery";

export const ALLOW_CONNECTION_BINARY_SENSOR_ID = "allowconnection";
export const ALLOW_CONNECTION_BINARY_SENSOR_NAME = "Allow connection";

export const MOVEMENT_STATUS_SENSOR_ID = "movementstatus";
export const MOVEMENT_STATUS_SENSOR_NAME = "Movement status";

export const RSSI_SENSOR_ID = "rssi";
export const RSSI_SENSOR_NAME = "RSSI";

export const CONNECTION_STATUS_SENSOR_ID = "connectionstatus";
export const CONNECTION_STATUS_SENSOR_NAME = "Connection status";

export const FIRMWARE_VERSION_SENSOR_ID = "firewareversion";
export const FIRMWARE_VERSION_SENSOR_NAME = "Firmware version";

export const DEVICE_CHAIN_LENGTH_SENSOR_ID = "devicechainlength";
export const DEVICE_CHAIN_LENGTH_SENSOR_NAME = "Device chain length";

export const CALIBRATED_BINARY_SENSOR_ID = "calibrated";
export const CALIBRATED_BINARY_SENSOR_NAME = "Calibrated";

export const DIRECTION_SENSOR_ID = "direction";
export const DIRECTION_SENSOR_NAME = "Direction";

export const TOUCH_AND_GO_BINARY_SENSOR_ID = "touchandgo";
export const TOUCH_AND_GO_BINARY_SENSOR_NAME = "Touch and go";

export const LIGHTING_EFFECT_BINARY_SENSOR_ID = "lightingeffect";
export const LIGHTING_EFFECT_BINARY_SENSOR_NAME = "Lighting effect";

export const SOLAR_PANEL_PLUGGED_IN_BINARY_SENSOR_ID = "solarpanelpluggedin";
export const SOLAR_PANEL_PLUGGED_IN_BINARY_SENSOR_NAME =
  "Solar panel plugged in";

export const TIMER_COUNT_SENSOR_ID = "timerCount";
export const TIMER_COUNT_SENSOR_NAME = "Timer count";

export const MOTION_STATUS_SENSOR_ID = "motionstatus";
export const MOTION_STATUS_SENSOR_NAME = "Motion status";
