import noble from "@abandonware/noble";
import { config } from "dotenv";
import Switchbot from "node-switchbot";
import { interpret } from "xstate";
import { HomeAssistantMqtt } from "./home-assistant-mqtt";
import { syncMachine } from "./machines/sync-machine";
import { logger } from "./utils/logger";

config();

const switchbot = new Switchbot({ noble });
const homeAssistantMqtt = new HomeAssistantMqtt({
  url: process.env.MQTT_URL ?? `tcp://localhost:1883`,
  mqttCaPath: process.env.MQTT_CA_PATH,
  mqttCertPath: process.env.MQTT_CERT_PATH,
  mqttKeyPath: process.env.MQTT_KEY_PATH,
  mqttProtocol: process.env.MQTT_PROTOCOL,
});

const machine = interpret(
  syncMachine.withContext({ switchbot, homeAssistantMqtt, deviceActors: {} })
);

machine.onEvent((event) => {
  logger.info("Event: '%s'", event.type);
});

machine.onTransition((s) => {
  logger.info("Transitioned to state: '%s'", s.value);
});

machine.start();
logger.info("Setup complete, machine started");
