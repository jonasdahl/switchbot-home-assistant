import noble from "@abandonware/noble";
import Switchbot from "node-switchbot";
import { interpret } from "xstate";
import { HomeAssistantMqtt } from "./home-assistant-mqtt";
import { syncMachine } from "./machines/sync-machine";
import { logger } from "./utils/logger";

const switchbot = new Switchbot({ noble });
const homeAssistantMqtt = new HomeAssistantMqtt({
  url: process.env.MQTT_URL ?? `tcp://localhost:1883`,
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