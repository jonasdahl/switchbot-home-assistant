import { Characteristic } from "@abandonware/noble";
import { characteristicMachinesByUuid } from "./by-uuid";

export function getCharacteristicsMachine({
  characteristic,
}: {
  characteristic: Characteristic;
}) {
  const uuid = characteristic.uuid;

  const byUuid = characteristicMachinesByUuid[uuid];
  if (byUuid) {
    return byUuid.withContext({ characteristic });
  }
  return null;
}
