import * as Foreign from "./Foreign";
import * as UIDevice from "./UIKit/UIDevice";

async function sleep(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(), seconds * 1000);
  })
}

async function main() {
  let remoteVersion = await Foreign.hello();
  // await foreign.exit();
  Foreign.log(`Done hello, native and browser versions are: ${remoteVersion}`);
  Foreign.log(`Device model is: ${await UIDevice.current.model}`);
  await UIDevice.current.isBatteryMonitoringEnabled.set(true);
  await sleep(2);
  Foreign.log(`Battery level: ${await UIDevice.current.batteryLevel}`);
}
main();
