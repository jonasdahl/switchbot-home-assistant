import noble from "@abandonware/noble";
import { machineIdSync } from "node-machine-id";
import { interpret } from "xstate";
import { createSwitchbotCurtainMachine } from "./devices/switchbot-curtain";
import { HassClient } from "./home-assistant-mqtt";
import { logger } from "./logger";
import { bluetoothControllerMachine } from "./machines/bluetooth-controller";
import { createDiscoveryMachine } from "./machines/discovery";

const hassClient = new HassClient();

const id = machineIdSync(true);
const bridgeDevice = hassClient.device("bluetooth-bridge-" + id);
bridgeDevice
  .setMetadata({
    name: "Bluetooth Bridge",
  })
  .sensor("id")
  .setEntityMeta({ name: "Machine ID" })
  .announce()
  .reportState(id)
  .reportAvailability(true);

bridgeDevice
  .button("restart")
  .setEntityMeta({ name: "Restart controller" })
  .announce()
  .reportAvailability(true)
  .onCommand(() => {
    logger.warn("Killing process to restart controller");
    process.exit(1);
  });

const discoveryMachine = createDiscoveryMachine({
  getPeripheralMachine: ({ peripheral }) => {
    if (peripheral.advertisement.localName !== "WoCurtain") {
      return null;
    }
    return createSwitchbotCurtainMachine({ hassClient, logger, peripheral });
  },
})
  .withContext({ noble: noble, peripherals: {} })
  .withConfig({
    delays: { DISCOVERY_LOGGING_INTERVAL: 60_000 },
    actions: {
      onStart: () => logger.debug("Discovery started"),
      onExit: () => logger.debug("Discovery ended"),
      onScanningStarted: () => logger.debug("Scanning started"),
      onScanningStopped: () => logger.debug("Scanning stopped"),
      onError: (_, e) => {
        logger.error(e);
        process.exit(1);
      },
      onPeripheralDiscovered: (_, e) =>
        logger.info("Discovered peripheral: %s", e.peripheral.uuid),
    },
  });

const bluetoothController = interpret(
  bluetoothControllerMachine.withContext({ noble }).withConfig({
    actions: {
      onError: (_, e) => {
        logger.error(e);
        process.exit(1);
      },
      onPoweredOff: () => logger.info("Bluetooth controller turned off"),
      onPoweredOn: () => logger.info("Bluetooth controller turned on"),
      onStarted: () => logger.info("Bluetooth controller started"),
    },
    services: {
      discovery: discoveryMachine,
    },
  })
);

bluetoothController.start();

hassClient.onStatusChange((_) => {
  bluetoothController.send({ type: "RESET" });
});
