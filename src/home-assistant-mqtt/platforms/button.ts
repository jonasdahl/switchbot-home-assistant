import { merge } from "lodash";
import { MqttClient } from "mqtt";
import { logger } from "../../logger";
import { HassDevice } from "../device";
import { BaseEntityMeta, HassEntity } from "./entity";

export type ButtonMeta = {};

export class HassButton extends HassEntity {
  configTopic: string;
  commandTopic: string;

  sensorMeta: ButtonMeta = {};

  constructor(mqttClient: MqttClient, id: string, device: HassDevice) {
    super(mqttClient, id, device);

    this.configTopic = `homeassistant/button/${this.uniqueId}/config`;
    this.commandTopic = `hassmqtt/${this.uniqueId}/command`;
  }

  announce() {
    const data = {
      ...this.getAvailabilityDiscoveryData(),
      device: this.device.getDiscoveryData(),
      unique_id: this.uniqueId,
      command_topic: this.commandTopic,
      name: this.meta.name,
      entity_category: this.meta.entityCategory,
      enabled_by_default: this.meta.enabledByDefault,
    };
    logger.info("Announcing button: %s", this.entityId);
    this.publish(this.configTopic, JSON.stringify(data));
    return this;
  }

  setEntityMeta(partial: Partial<BaseEntityMeta & ButtonMeta>) {
    super.setEntityMeta(partial);
    this.sensorMeta = merge(this.sensorMeta, partial);
    return this;
  }

  onCommand(callback: () => void) {
    return this.subscribe(this.commandTopic, () => {
      callback();
    });
  }
}
