import { HomeAssistantMQTT } from "./home-assistant-mqtt";

const mqttClient = new HomeAssistantMQTT();

const bluetoothAdapter = createBluetoothAdapter();

bluetoothAdapter.start();
