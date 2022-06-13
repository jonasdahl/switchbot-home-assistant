import noble from "@abandonware/noble";
import Switchbot from "node-switchbot";
import { interpret } from "xstate";
import { HomeAssistantMQTT } from "./home-assistant-mqtt";
import { syncMachine } from "./machines/sync-machine";
import { logger } from "./utils/logger";

const switchbot = new Switchbot({ noble });
const homeAssistantMqtt = new HomeAssistantMQTT();

const machine = interpret(
  syncMachine
    .withContext({ switchbot, homeAssistantMqtt, deviceActors: {} })
    .withConfig({
      actions: {
        onDiscoverDevices: () => logger.debug("Discovering devices..."),
        onDiscoveredDevices: () => logger.debug("Device discovery done."),
      },
    })
);

machine.start();
logger.info("Setup complete, machine started");
