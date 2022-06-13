import { Characteristic, Service } from "@abandonware/noble";
import { ActorRefFrom, createMachine } from "xstate";
import { characteristicMachinesByUuid } from "../../characteristics/by-uuid";

type Event = { type: "DISCONNECTED" };

export const serviceMachine = createMachine(
  {
    tsTypes:
      {} as import("./cba20d00224d11e69fb80002a5d5c51b.typegen").Typegen0,
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
    initial: "discoveringCharacteristics",
    states: {
      discoveringCharacteristics: {
        entry: "started",
        invoke: {
          src: "discoverCharacteristics",
          onDone: { actions: "characteristicsDiscovered" },
        },
      },
    },
  },
  {
    actions: {
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
