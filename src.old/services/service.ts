import { Characteristic, Service } from "@abandonware/noble";
import { ActorRefFrom, assign, createMachine, spawn } from "xstate";
import { getCharacteristicsMachine } from "./characteristics";
import { characteristicMachinesByUuid } from "./characteristics/by-uuid";
import { logger } from "./utils/logger";

type Event = { type: "DISCONNECTED" };

export const serviceMachine = createMachine(
  {
    tsTypes: {} as import("./service.typegen").Typegen0,
    schema: {
      context: {} as {
        service: Service;
        characteristics: Record<
          string,
          {
            actor: ActorRefFrom<
              typeof characteristicMachinesByUuid[keyof typeof characteristicMachinesByUuid]
            >;
            characteristic: Characteristic;
          }
        >;
      },
      services: {} as { discoverCharacteristics: { data: Characteristic[] } },
      events: {} as Event,
    },
    initial: "initial",
    states: {
      initial: {
        entry: "started",
        always: "discoveringCharacteristics",
      },
      discoveringCharacteristics: {
        invoke: {
          src: "discoverCharacteristics",
          onDone: { actions: "characteristicsDiscovered" },
        },
      },
    },
  },
  {
    actions: {
      started: (c) => logger.debug("Service started: %s", c.service.uuid),
      characteristicsDiscovered: assign((c, e) => {
        const characteristics = e.data.reduce((result, characteristic) => {
          if (characteristic.uuid in result) {
            return result;
          }
          const machine = getCharacteristicsMachine({ characteristic });
          if (!machine) {
            return result;
          }
          return {
            ...result,
            [characteristic.uuid]: {
              characteristic,
              actor: spawn(machine),
            },
          };
        }, c.characteristics ?? {});
        return { characteristics };
      }),
    },
    services: {
      discoverCharacteristics: async (c) => {
        return await c.service.discoverCharacteristicsAsync();
      },
    },
  }
);
