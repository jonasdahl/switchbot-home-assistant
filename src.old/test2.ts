import noble from "@abandonware/noble";
import { interpret } from "xstate";
import { bluetoothControllerMachine } from "./bluetooth-controller";
import { discoveryMachine } from "./discovery";
import { logger } from "./utils/logger";

const mac = "ef:dc:02:82:9f:e4";
logger.info("mac: %s", mac);

const bluetoothController = interpret(
  bluetoothControllerMachine.withContext({ noble }).withConfig({
    actions: {
      started: () => logger.info("Bluetooth controller started"),
      poweredOn: () => logger.info("Bluetooth powered on"),
      poweredOff: () => logger.info("Bluetooth powered off"),
      error: (_, e) =>
        logger.error("An error occurred: %s", JSON.stringify(e.data)),
    },
    services: {
      on: discoveryMachine.withContext({ noble, peripherals: {} }).withConfig({
        actions: {
          scanningStarted: () => logger.info("Discovery started"),
          scanningStopped: () => logger.info("Discovery stopped"),
          peripheralDiscovered: (_c, { peripheral }) => {
            logger.info(
              "Peripheral discovered: %s, %s",
              peripheral.id,
              peripheral.advertisement.localName
            );
          },
          error: () => logger.error("Discovery error"),
        },
      }),
    },
  })
);

bluetoothController.start();
