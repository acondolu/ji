async function sleep(seconds) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(), seconds * 1000);
  })
}

async function main() {
  try {
    document.write(" OK HELLO 1 ");
    let remoteVersion = await ji.hello();
    document.write(" OK HELLO 2 ");
    ji.log(`Done hello, native and browser versions are: ${remoteVersion}`);
    ji.log(`Device model is: ${await ji.UIKit.UIDevice.current.model}`);
    await ji.UIKit.UIDevice.current.isBatteryMonitoringEnabled.set(true);
    await sleep(2);
    ji.log(`Battery level: ${await ji.UIKit.UIDevice.current.batteryLevel}`);
    await ji.exit();
  } catch (e) {
    document.write(e);
    document.write(e.toString());
  }
}

window.onload = () => main();