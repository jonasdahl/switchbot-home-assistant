import noble from "@abandonware/noble";
import { createBinaryParser } from "./utils/binary-parser";

async function run() {
  await new Promise((resolve) =>
    noble.once("stateChange", () => {
      resolve(null);
    })
  );
  console.log(noble.state);
  noble.on("discover", (peripheral) => {
    try {
      // Service data
      // The following table is the Service Data of SCAN_RSP.
      const scanBroadcastPackage = Buffer.from([]);
      const serviceData = createBinaryParser()
        .bit1("nc")
        .bit7("deviceType")
        .bit1("allowConnection")
        .bit1("calibrationStatus")
        .bit6("nc")
        .bit1("nc")
        .bit7("battery")
        .bit1("movementStatus")
        .bit7("position")
        .bit4("lightLevel")
        .bit4("chainLength");
      console.log(
        serviceData.parse(peripheral?.advertisement?.manufacturerData)
      );
    } catch (e) {
      console.error(e);
    }
  });

  await noble.startScanningAsync();
  console.log("Scanning");
  await new Promise((resolve) => setTimeout(resolve, 10000));
  await noble.stopScanningAsync();
}

run();
