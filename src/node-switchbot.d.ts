declare module "node-switchbot" {
  import type noble from "@abandonware/noble";
  import type { Peripheral } from "@abandonware/noble";

  interface SwitchbotParams {
    noble?: NobleType;
  }

  type Model = "H" | "T" | "e" | "s" | "d" | "c";

  interface DiscoverParams {
    duration?: number;
    model?: Model;
    id?: string;
    quick?: boolean;
  }

  interface StartScanParams {
    model?: Model;
    id?: string;
  }

  type ConnectionState = Peripheral["state"];
  type NobleType = typeof noble;

  export class SwitchbotDevice {
    constructor(peripheral: Peripheral, nobleInstance: NobleType);
    get id(): string;
    get address(): string;
    get model(): string;
    get modelName(): string;
    get connectionState(): ConnectionState;
    set onconnect(func: () => void);
    set ondisconnect(func: () => void);

    connect(): void;
    disconnect(): Promise<void>;
    getDeviceName(): Promise<string>;
    setDeviceName(name: string): Promise<void>;
  }

  export class SwitchbotDeviceWoCurtain extends SwitchbotDevice {
    get model(): "c";
    open(): Promise<void>;
    close(): Promise<void>;
    pause(): Promise<void>;
    runToPos(percent: number, mode?: number | null): Promise<void>;
  }
  export class SwitchbotDeviceWoSensorTH extends SwitchbotDevice {
    get model(): "T";
  }
  export class SwitchbotDeviceWoPresence extends SwitchbotDevice {
    get model(): "s";
  }
  export class SwitchbotDeviceWoHumi extends SwitchbotDevice {
    open(): Promise<void>;
    turnOn(): Promise<void>;
    turnOff(): Promise<void>;
    down(): Promise<void>;
    up(): Promise<void>;
    get model(): "e";
  }
  export class SwitchbotDeviceWoHand extends SwitchbotDevice {
    open(): Promise<void>;
    turnOn(): Promise<void>;
    turnOff(): Promise<void>;
    down(): Promise<void>;
    up(): Promise<void>;
    get model(): "H";
  }
  export class SwitchbotDeviceWoContact extends SwitchbotDevice {
    get model(): "d";
  }

  export type AnySwitchbotDevice =
    | SwitchbotDeviceWoCurtain
    | SwitchbotDeviceWoSensorTH
    | SwitchbotDeviceWoPresence
    | SwitchbotDeviceWoHumi
    | SwitchbotDeviceWoHand
    | SwitchbotDeviceWoContact;

  export type Advertisement = {
    id: string;
    address: string;
    rssi: number;
    serviceData: {
      model: Model;
      modelName: string;
      calibration: boolean;
      battery: number;
      position: number;
      lightLevel: number;
    };
  };

  export default class Switchbot {
    noble: NobleType;
    ondiscover: null | (() => void);
    onadvertisement: null | ((ad: Advertisement) => void);
    onlog: null | (() => void);

    constructor(params?: SwitchbotParams);
    discover(args?: DiscoverParams): Promise<AnySwitchbotDevice[]>;
    startScan(args?: StartScanParams): Promise<void>;
    stopScan(): void;
    wait(duration: number): Promise<void>;
  }
}
