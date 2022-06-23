import { MqttClient } from "mqtt";
import { z } from "zod";
import { logger } from "../../logger";
import { HassDevice } from "../device";
import { HassEntity } from "./entity";

export class HassCover extends HassEntity {
  configTopic: string;
  setPositionTopic: string;
  positionTopic: string;
  commandTopic: string;
  stateTopic: string;

  constructor(mqttClient: MqttClient, id: string, device: HassDevice) {
    super(mqttClient, id, device);
    this.configTopic = `homeassistant/cover/${this.uniqueId}/config`;
    this.setPositionTopic = `hassmqtt/${this.uniqueId}/set_position`;
    this.commandTopic = `hassmqtt/${this.uniqueId}/set`;
    this.positionTopic = `hassmqtt/${this.uniqueId}/position`;
    this.stateTopic = `hassmqtt/${this.uniqueId}/state`;
  }

  announce() {
    const data = {
      ...this.getAvailabilityDiscoveryData(),
      command_topic: this.commandTopic,
      payload_open: OPEN,
      payload_close: CLOSE,
      payload_stop: STOP,
      entity_category: this.meta.entityCategory,
      enabled_by_default: this.meta.enabledByDefault,
      // state_open: STATE_OPEN,
      // state_opening: STATE_OPENING,
      // state_closed: STATE_CLOSED,
      // state_closing: STATE_CLOSING,
      device: this.device.getDiscoveryData(),
      unique_id: this.uniqueId,
      state_topic: this.stateTopic,
      set_position_topic: this.setPositionTopic,
      position_topic: this.positionTopic,
      position_open: 0,
      position_closed: 100,
      encoding: "utf-8",
      // optimistic: true,
      device_class: "curtain",
      name: this.meta.name,
    };
    logger.info("Announcing cover: %s", this.uniqueId);
    this.publish(this.configTopic, JSON.stringify(data));
    return this;
  }

  lastState:
    | null
    | typeof STATE_OPEN
    | typeof STATE_OPENING
    | typeof STATE_CLOSED
    | typeof STATE_CLOSING = null;

  reportState(
    state:
      | typeof STATE_OPEN
      | typeof STATE_OPENING
      | typeof STATE_CLOSED
      | typeof STATE_CLOSING
  ) {
    if (this.lastState === state) {
      return this;
    }
    this.lastState = state;

    this.publish(this.stateTopic, JSON.stringify(state));
    return this;
  }

  lastPosition: number | null = null;

  reportPosition(position: number) {
    if (this.lastPosition === position) {
      return this;
    }
    this.lastPosition = position;

    this.publish(this.positionTopic, JSON.stringify(position));
    return this;
  }

  onSetPosition(callback: (position: number) => void) {
    return this.subscribe(this.setPositionTopic, (message) => {
      const res = setPositionType.safeParse(JSON.parse(message));
      if (res.success) {
        logger.warn("Setting position");
        callback(res.data);
      } else {
        logger.error("Failed to parse payload for set position: %s", message);
      }
    });
  }

  onCommand(callback: (command: CoverCommand) => void) {
    return this.subscribe(this.commandTopic, (message) => {
      const res = commandType.safeParse(message);
      if (res.success) {
        logger.warn("Command: %s", res.data);
        callback(res.data);
      } else {
        logger.error("Failed to parse payload for command: %s", message);
      }
    });
  }
}

const OPEN = "open";
const CLOSE = "close";
const STOP = "stop";
const STATE_OPEN = "open";
const STATE_OPENING = "opening";
const STATE_CLOSED = "closed";
const STATE_CLOSING = "closing";
const setPositionType = z.number();
const commandType = z.union([
  z.literal("open"),
  z.literal("close"),
  z.literal("stop"),
]);
export type CoverCommand = z.TypeOf<typeof commandType>;
