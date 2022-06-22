import { merge } from "lodash";
import { MqttClient } from "mqtt";
import { logger } from "../../logger";
import { HassDevice } from "../device";

export type BaseEntityMeta = {
  name?: string;
  entityCategory?: "diagnostic" | "config";
  enabledByDefault?: boolean;
};

export class HassEntity {
  mqttClient: MqttClient;
  device: HassDevice;
  entityId: string;
  uniqueId: string;
  meta: BaseEntityMeta = {};
  availabilityTopic: string;

  constructor(mqttClient: MqttClient, entityId: string, device: HassDevice) {
    this.mqttClient = mqttClient;
    this.device = device;
    this.entityId = entityId;
    this.uniqueId = `${this.device.uniqueId}_${entityId}`;
    this.availabilityTopic = `hassmqtt/${this.uniqueId}/availability`;
  }

  setEntityMeta(partial: Partial<BaseEntityMeta>) {
    this.meta = merge(this.meta, partial);
    return this;
  }

  publish(topic: string, payload: string) {
    logger.trace("Publishing on topic %s: %s", topic, payload);
    this.mqttClient.publish(topic, Buffer.from(payload, "utf-8"));
    return this;
  }

  subscribe(subscriptionTopic: string, callback: (message: string) => void) {
    this.mqttClient.subscribe(subscriptionTopic);
    const handler = (topic: string, payload: Buffer) => {
      if (topic === subscriptionTopic) {
        callback(payload.toString("utf-8"));
      }
    };
    this.mqttClient.on("message", handler);

    return {
      unsubscribe: () => {
        // this.mqttClient.unsubscribe(subscriptionTopic);
        this.mqttClient.off("message", handler);
      },
    };
  }

  reportAvailability(available: boolean | null) {
    const availability =
      available === true ? ONLINE : available === false ? OFFLINE : UNKNOWN;
    this.publish(this.availabilityTopic, availability);
    return this;
  }

  getAvailabilityDiscoveryData() {
    return {
      availability: [
        {
          payload_available: ONLINE,
          payload_not_available: OFFLINE,
          topic: this.availabilityTopic,
        },
      ],
      availability_mode: "latest",
    };
  }
}

const ONLINE = "online";
const OFFLINE = "offline";
const UNKNOWN = "unknown";
