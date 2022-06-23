import { MqttClient } from "mqtt";
import { logger } from "../../logger";
import { HassDevice } from "../device";
import { HassEntity } from "./entity";

export class HassBinarySensor extends HassEntity {
  stateTopic: string;
  configTopic: string;

  constructor(mqttClient: MqttClient, id: string, device: HassDevice) {
    super(mqttClient, id, device);
    this.configTopic = `homeassistant/binary_sensor/${this.uniqueId}/config`;
    this.stateTopic = `hassmqtt/${this.uniqueId}/state`;
  }

  announce() {
    const data = {
      ...this.getAvailabilityDiscoveryData(),
      device: this.device.getDiscoveryData(),
      unique_id: this.uniqueId,
      state_topic: this.stateTopic,
      name: this.meta.name,
      payload_off: OFF,
      payload_on: ON,
      entity_category: this.meta.entityCategory,
      enabled_by_default: this.meta.enabledByDefault,
    };
    logger.info("Announcing sensor: %s", this.entityId);
    this.publish(this.configTopic, JSON.stringify(data));
    return this;
  }

  lastState: boolean | null = null;

  reportState(state: boolean) {
    if (this.lastState === state) {
      return this;
    }
    this.lastState = state;

    this.publish(this.stateTopic, state ? ON : OFF);
    return this;
  }
}

const ON = "ON";
const OFF = "OFF";
