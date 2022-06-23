export type EntityCategory = "config" | "diagnostic";

export type CoverDeviceClass =
  | "awning"
  | "blind"
  | "curtain"
  | "damper"
  | "door"
  | "garage"
  | "gate"
  | "shade"
  | "shutter"
  | "window";

export type SensorDeviceClass =
  | "apparent_power"
  | "aqi"
  | "battery"
  | "carbon_dioxide"
  | "carbon_monoxide"
  | "current"
  | "date"
  | "duration"
  | "energy"
  | "frequency"
  | "gas"
  | "humidity"
  | "illuminance"
  | "monetary"
  | "nitrogen_dioxide"
  | "nitrogen_monoxide"
  | "nitrous_oxide"
  | "ozone"
  | "pm1"
  | "pm10"
  | "pm25"
  | "power_factor"
  | "power"
  | "pressure"
  | "reactive_power"
  | "signal_strength"
  | "sulphur_dioxide"
  | "temperature"
  | "timestamp"
  | "volatile_organic_compounds"
  | "voltage";

export type BinarySensorDeviceClass =
  | "battery"
  | "battery_charging"
  | "carbon_monoxide"
  | "cold"
  | "connectivity"
  | "door"
  | "garage_door"
  | "gas"
  | "heat"
  | "light"
  | "lock"
  | "moisture"
  | "motion"
  | "moving"
  | "occupancy"
  | "opening"
  | "plug"
  | "power"
  | "presence"
  | "problem"
  | "running"
  | "safety"
  | "smoke"
  | "sound"
  | "tamper"
  | "update"
  | "vibration"
  | "window";

export type StateClass = "measurement" | "total" | "total_increasing";

export type HomeAssistantMQTTDevice = {
  configuration_url?: string;
  connections?: [ConnectionType: string, ConnectionIdentifier: string][];
  identifiers?: string | string[];
  manufacturer?: string;
  model?: string;
  name?: string;
  suggested_area?: string;
  sw_version?: string;
  via_device?: string;
};

export type HomeAssistantMQTTSensor = HomeAssistantMQTTAvailabilityConfig & {
  device?: HomeAssistantMQTTDevice;
  device_class?: SensorDeviceClass;
  enabled_by_default?: boolean;
  encoding?: string;
  entity_category?: EntityCategory;
  expire_after?: number;
  icon?: string;
  force_update?: boolean;
  json_attributes_template?: string;
  json_attributes_topic?: string;
  last_reset_value_template?: string;
  name?: string;
  object_id?: string;
  payload_available?: string;
  payload_not_available?: string;
  qos?: number;
  state_class?: StateClass;
  state_topic?: string;
  unique_id?: string;
  unit_of_measurement?: string;
  value_template?: string;
};

export type HomeAssistantMQTTBinarySensor =
  HomeAssistantMQTTAvailabilityConfig & {
    device?: HomeAssistantMQTTDevice;
    device_class?: BinarySensorDeviceClass;
    enabled_by_default?: boolean;
    encoding?: string;
    entity_category?: EntityCategory;
    expire_after?: number;
    icon?: string;
    force_update?: boolean;
    json_attributes_template?: string;
    json_attributes_topic?: string;
    name?: string;
    object_id?: string;
    off_delay?: number;
    payload_available?: string;
    payload_not_available?: string;
    payload_off?: string;
    payload_on?: string;
    qos?: number;
    state_topic?: string;
    unique_id?: string;
    value_template?: string;
  };

export type CoverCommand = "close" | "open" | "stop";
export type HomeAssistantMQTTCover = HomeAssistantMQTTAvailabilityConfig & {
  command_topic?: string;
  device?: HomeAssistantMQTTDevice;
  device_class?: CoverDeviceClass;
  enabled_by_default?: boolean;
  encoding?: string;
  entity_category?: EntityCategory;
  icon?: string;
  json_attributes_template?: string;
  json_attributes_topic?: string;
  name?: string;
  object_id?: string;
  optimistic?: boolean;
  payload_available?: string;
  payload_close?: string;
  payload_not_available?: string;
  payload_open?: string;
  payload_stop?: string;
  position_closed?: number;
  position_open?: number;
  position_template?: string;
  position_topic?: string;
  qos?: number;
  retain?: boolean;
  set_position_template?: string;
  set_position_topic?: string;
  state_closed?: string;
  state_closing?: string;
  state_opening?: string;
  state_stopped?: string;
  state_topic?: string;
  tilt_closed_value?: number;
  tilt_command_template?: string;
  tilt_command_topic?: string;
  tilt_max?: number;
  tilt_min?: number;
  tilt_opened_value?: number;
  tilt_optimistic?: boolean;
  tilt_status_template?: string;
  tilt_status_topic?: string;
  unique_id?: string;
  value_template?: string;
};

export type HomeAssistantMQTTAvailabilityConfig = (
  | {
      availability: {
        payload_available?: string;
        payload_not_available?: string;
        topic: string;
        value_template?: string;
      }[];
    }
  | { availability_topic?: string }
) & {
  availability_mode?: "all" | "any" | "latest";
  availability_template?: string;
};
