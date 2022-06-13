import { readFileSync } from "fs";
import { connect, IClientOptions, MqttClient } from "mqtt";
import { logger } from "../utils/logger";
import {
  HomeAssistantMQTTBinarySensor,
  HomeAssistantMQTTCover,
  HomeAssistantMQTTSensor,
} from "./types";

export * from "./types";

export class HomeAssistantMQTT {
  private mqttClient: MqttClient;

  constructor({ mqtt }: { mqtt?: IClientOptions & { url?: string } } = {}) {
    const extra = {
      checkServerIdentity: () => {
        return null;
      },
    };

    const url = mqtt?.url ?? process.env.MQTT_URL;
    if (!url) {
      throw new Error(
        "HomeAssistantMQTT needs either MQTT_URL environment variable or mqtt.url in options"
      );
    }
    logger.info("Connecting to MQTT url: %s", url);

    const ca = mqtt?.ca
      ? mqtt?.ca
      : process.env.MQTT_CA_PATH
      ? readFileSync(process.env.MQTT_CA_PATH)
      : undefined;
    logger.info("Using CA: %s", ca ? "yes" : "no");
    const key = mqtt?.key
      ? mqtt?.key
      : process.env.MQTT_KEY_PATH
      ? readFileSync(process.env.MQTT_KEY_PATH)
      : undefined;
    logger.info("Using Key: %s", key ? "yes" : "no");
    const cert = mqtt?.cert
      ? mqtt?.cert
      : process.env.MQTT_CERT_PATH
      ? readFileSync(process.env.MQTT_CERT_PATH)
      : undefined;
    logger.info("Using cert: %s", cert ? "yes" : "no");

    this.mqttClient = connect(url, {
      ...extra,
      ...mqtt,
      cert,
      ca,
      key,
    });
    this.mqttClient.publish("homeassistantswitchbot/status", "started");

    this.mqttClient.on("error", (e) => {
      logger.error("Error in MQTT client:", e);
      throw e;
    });
  }

  publish(topic: string, payload: string) {
    this.mqttClient.publish(topic, payload);
  }

  subscribe(
    topic: string,
    topicRegex: RegExp,
    callback: (matches: string[], msg: string) => void
  ) {
    this.mqttClient.subscribe(topic, { qos: 0 });
    const listener = (topic: string, message: Buffer) => {
      const matches = topic.match(topicRegex);
      if (!matches) {
        return;
      }
      callback(matches.slice(1), message.toString());
    };

    this.mqttClient.on("message", listener);
    return () => {
      this.mqttClient.off("message", listener);
    };
  }

  announceCover(
    cover: HomeAssistantMQTTCover & { unique_id: string },
    topic_?: string
  ) {
    const topic =
      topic_ ?? `homeassistant/cover/${safeId(cover.unique_id)}/config`;

    logger.info(
      "Announcing cover %s on topic %s",
      JSON.stringify(cover),
      topic
    );

    this.mqttClient.publish(topic, JSON.stringify(cover));
  }

  announceSensor(
    sensor: HomeAssistantMQTTSensor & { unique_id: string },
    topic_?: string
  ) {
    const topic =
      topic_ ?? `homeassistant/sensor/${safeId(sensor.unique_id)}/config`;

    logger.info(
      "Announcing sensor %s on topic %s",
      JSON.stringify(sensor),
      topic
    );

    this.mqttClient.publish(topic, JSON.stringify(sensor));
  }

  announceBinarySensor(
    sensor: HomeAssistantMQTTBinarySensor & { unique_id: string },
    topic_?: string
  ) {
    const topic =
      topic_ ??
      `homeassistant/binary_sensor/${safeId(sensor.unique_id)}/config`;

    logger.info(
      "Announcing binary sensor %s on topic %s",
      JSON.stringify(sensor),
      topic
    );

    this.mqttClient.publish(topic, JSON.stringify(sensor));
  }
}

function safeId(id: string) {
  return id.replace(/[^a-zA-Z0-9-]/g, "-");
}
