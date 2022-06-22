import { merge } from "lodash";
import { MqttClient } from "mqtt";
import { HassBinarySensor } from "./platforms/binary-sensor";
import { HassButton } from "./platforms/button";
import { HassCover } from "./platforms/cover";
import { HassSensor } from "./platforms/sensor";
import { HomeAssistantMQTTDevice } from "./types";

const entityClassFactories = {
  sensor: f(HassSensor),
  cover: f(HassCover),
  binarySensor: f(HassBinarySensor),
  button: f(HassButton),
};

export class HassDevice {
  entities: { [X: string]: EntityWrapper<keyof EntityClass> } = {};
  uniqueId: string;
  mqttClient: MqttClient;
  meta: HomeAssistantMQTTDevice;

  constructor(mqttClient: MqttClient, uniqueId: string) {
    this.uniqueId = uniqueId;
    this.mqttClient = mqttClient;
    this.meta = { identifiers: [uniqueId] };
  }

  private getEntityRecordOrCreate<TType extends keyof EntityClass>(
    id: string,
    type: TType
  ): EntityClass[TType] {
    const oldRecord = this.entities[id];
    if (oldRecord) {
      if (oldRecord.type !== type) {
        throw new Error(
          "Unexpected type in registry: " +
            oldRecord.type +
            " but expected: " +
            type +
            " for id: " +
            id
        );
      }
      return oldRecord.entity as EntityClass[TType];
    }
    const entity = entityClassFactories[type](this.mqttClient, id, this);
    const newRecord = { type: type, entity };
    this.entities[id] = newRecord;
    return newRecord.entity as EntityClass[TType];
  }

  getEntities() {
    return Object.values(this.entities).map((x) => x.entity);
  }

  setMetadata(partial: Partial<HomeAssistantMQTTDevice>) {
    // @todo
    this.meta = merge(this.meta, partial);
    return this;
  }

  getDiscoveryData() {
    return {
      configuration_url: "https://npmjs.org/hass-mqtt",
      connections: [], // @todo
      identifiers: [this.uniqueId], // @todo
      manufacturer: undefined, // @todo
      model: undefined, // @todo
      name: this.meta.name, // @todo
      suggested_area: undefined, // @todo
      sw_version: undefined, // @todo
      via_device: undefined, // @todo
    };
  }

  entity<TType extends keyof EntityClass>(type: TType, id: string) {
    return this.getEntityRecordOrCreate(id, type);
  }

  sensor(id: string) {
    return this.entity("sensor", id);
  }

  cover(id: string) {
    return this.entity("cover", id);
  }

  binarySensor(id: string) {
    return this.entity("binarySensor", id);
  }

  button(id: string) {
    return this.entity("button", id);
  }
}

type EntityClass = {
  [X in keyof typeof entityClassFactories]: ReturnType<
    typeof entityClassFactories[X]
  >;
};

type EntityWrapper<T extends keyof EntityClass> = {
  type: T;
  entity: EntityClass[T];
};

function f<T>(X: {
  new (mqttClient: MqttClient, id: string, device: HassDevice): T;
}) {
  return (mqttClient: MqttClient, id: string, device: HassDevice) =>
    new X(mqttClient, id, device);
}
