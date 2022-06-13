import { createBinaryParser } from "../../utils/binary-parser";

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
const data = serviceData.parse(scanBroadcastPackage);
