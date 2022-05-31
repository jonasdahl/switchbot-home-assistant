import { readFileSync } from "fs";
import { connect, MqttClient } from "mqtt";
import { join } from "path";
import { logger } from "../utils/logger";
import {
  HomeAssistantMqttBinarySensor,
  HomeAssistantMqttCover,
  HomeAssistantMqttSensor,
} from "./types";

export * from "./types";

export class HomeAssistantMqtt {
  private mqttClient: MqttClient;

  constructor({ url }: { url: string }) {
    const extraFunParts = {
      checkServerIdentity: () => {
        return null;
      },
    };

    this.mqttClient = connect({
      ...extraFunParts,
      protocol: "mqtts",
      hostname: "localhost",
      port: 8883,
      cert: readFileSync(join(__dirname, "../../mosquitto/client.crt")),
      ca: readFileSync(join(__dirname, "../../mosquitto/ca.crt")),
      key: readFileSync(join(__dirname, "../../mosquitto/client.key")),
    });
    this.mqttClient.on("error", (e) => {
      console.error("Error in MQTT client:", e);
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
    cover: HomeAssistantMqttCover & { unique_id: string },
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
    sensor: HomeAssistantMqttSensor & { unique_id: string },
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
    sensor: HomeAssistantMqttBinarySensor & { unique_id: string },
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
