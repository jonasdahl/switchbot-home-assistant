import { readFileSync } from "fs";
import { connect, MqttClient } from "mqtt";
import { logger } from "../logger";
import { HassDevice } from "./device";

export class HassClient {
  mqtt: MqttClient;
  devices: Record<string, HassDevice> = {};

  constructor() {
    const extra = { checkServerIdentity: () => null };
    const url = process.env.MQTT_URL;
    if (!url) {
      throw new Error("Needs MQTT_URL.");
    }
    logger.info("Connecting to MQTT url: %s", url);
    const ca = process.env.MQTT_CA_PATH
      ? readFileSync(process.env.MQTT_CA_PATH)
      : undefined;
    logger.info("Using CA: %s", ca ? "yes" : "no");
    const key = process.env.MQTT_KEY_PATH
      ? readFileSync(process.env.MQTT_KEY_PATH)
      : undefined;
    logger.info("Using Key: %s", key ? "yes" : "no");
    const cert = process.env.MQTT_CERT_PATH
      ? readFileSync(process.env.MQTT_CERT_PATH)
      : undefined;
    logger.info("Using cert: %s", cert ? "yes" : "no");
    this.mqtt = connect(url, { ...extra, cert, ca, key });
    this.mqtt.on("error", (e) => {
      throw e;
    });
  }

  private getOrCreateDevice(id: string) {
    const oldDevice = this.devices[id];
    if (oldDevice) {
      return oldDevice;
    }
    const device = new HassDevice(this.mqtt, id);
    this.devices[id] = device;
    return device;
  }

  device(id: string) {
    const device = this.getOrCreateDevice(id);
    return device;
  }

  onStatusChange(callback: (status: string) => void) {
    const statusTopic = `homeassistant/status`;
    this.mqtt.subscribe(statusTopic);
    const handler = (topic: string, payload: Buffer) => {
      if (topic === statusTopic) {
        callback(payload.toString("utf-8"));
      }
    };
    this.mqtt.on("message", handler);

    return {
      unsubscribe: () => {
        // this.mqtt.unsubscribe(subscriptionTopic);
        this.mqtt.off("message", handler);
      },
    };
  }
}
