import { merge } from "lodash";
import { MqttClient } from "mqtt";
import { logger } from "../../logger";
import { HassDevice } from "../device";
import { BaseEntityMeta, HassEntity } from "./entity";

export type SensorMeta = { unitOfMeasurement?: string };

export class HassSensor extends HassEntity {
  stateTopic: string;
  configTopic: string;
  sensorMeta: SensorMeta = {};

  lastState: null | number | string = null;
  lastStateReport: null | Date = null;
  stateReportTimeout = 30_000;

  constructor(mqttClient: MqttClient, id: string, device: HassDevice) {
    super(mqttClient, id, device);
    this.configTopic = `homeassistant/sensor/${this.uniqueId}/config`;
    this.stateTopic = `hassmqtt/${this.uniqueId}/state`;
  }

  announce() {
    const data = {
      ...this.getAvailabilityDiscoveryData(),
      device: this.device.getDiscoveryData(),
      unique_id: this.uniqueId,
      state_topic: this.stateTopic,
      name: this.meta.name,
      unit_of_measurement: this.sensorMeta.unitOfMeasurement,
      entity_category: this.meta.entityCategory,
      enabled_by_default: this.meta.enabledByDefault,
    };
    logger.info("Announcing sensor: %s", this.entityId);
    this.publish(this.configTopic, JSON.stringify(data));
    return this;
  }

  setEntityMeta(partial: Partial<BaseEntityMeta & SensorMeta>) {
    super.setEntityMeta(partial);
    this.sensorMeta = merge(this.sensorMeta, partial);
    return this;
  }

  setStateThrottleTimeout(timeout: number) {
    this.stateReportTimeout = timeout;
    return this;
  }

  reportState(state: number | string) {
    if (this.lastState === state) {
      return this;
    }
    this.lastState = state;

    if (
      this.lastStateReport !== null &&
      Date.now() - this.lastStateReport.getTime() < this.stateReportTimeout
    ) {
      return this;
    }
    this.lastStateReport = new Date();
    this.publish(
      this.stateTopic,
      typeof state === "number" ? JSON.stringify(state) : state
    );
    return this;
  }
}
