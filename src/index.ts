import noble from "@abandonware/noble";
import { interpret } from "xstate";
import { logger } from "./logger";
import { bluetoothControllerMachine } from "./machines/bluetooth-controller";
import { createDiscoveryMachine } from "./machines/discovery";
import { peripheralMachine } from "./machines/peripheral";

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
      discovery: createDiscoveryMachine({
        getPeripheralMachine: ({ peripheral }) => {
          if (peripheral.advertisement.localName !== "WoCurtain") {
            return null;
          }
          return peripheralMachine.withContext({ peripheral }).withConfig({
            actions: {
              onError: (c, e) => {
                logger.error("Error in peripheral: %s", c.peripheral.id);
                logger.error(e);
                process.exit(1);
              },
              onNotifyData: (c, e) => {
                logger.debug(
                  "Got data from peripheral %s: 0x%s",
                  c.peripheral.id,
                  e.buffer.toString("hex")
                );
              },
              onRssiUpdate: (c, e) => {
                logger.debug(
                  "Got RSSI update for peripheral %s: %d",
                  c.peripheral.id,
                  e.rssi
                );
              },
              onStart: (c) =>
                logger.debug(
                  "Started machine for peripheral: %s",
                  c.peripheral.id
                ),
              onExit: (c) =>
                logger.error(
                  "Stopped machine for peripheral: %s",
                  c.peripheral.id
                ),
              onConnected: (c) =>
                logger.debug("Connected to peripheral %s", c.peripheral.id),
              onDisconnected: (c) =>
                logger.warn("Disconnected from peripheral %s", c.peripheral.id),
              onConnecting: (c) =>
                logger.debug("Connecting to peripheral %s...", c.peripheral.id),
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
            },
          });
        },
      })
        .withContext({ noble: noble, peripherals: {} })
        .withConfig({
          delays: { DISCOVERY_LOGGING_INTERVAL: 60_000 },
          actions: {
            onStart: () => {
              logger.debug("Discovery started");
            },
            onExit: () => {
              logger.debug("Discovery ended");
            },
            onScanningStarted: () => {
              logger.debug("Scanning started");
            },
            onScanningStopped: () => {
              logger.debug("Scanning stopped");
            },
            onError: (_, e) => {
              logger.error(e);
              process.exit(1);
            },
            onPeripheralDiscovered: (_, e) => {
              logger.info("Discovered peripheral: %s", e.peripheral.uuid);
            },
          },
        }),
    },
  })
);
bluetoothController.start();
