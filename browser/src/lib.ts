import * as Foreign from "./Foreign";
import UIKit from "./UIKit";
import CoreBluetooth from "./CoreBluetooth";

const ji = {
  /**
   * Begin handshake with native app.
   * Will exchange and compare the version numbers.
   */
  hello: Foreign.hello,
  /**
   * Print a message into native app's stdout.
   */
  log: Foreign.log,
  /**
   * Exit the app with given error code.
   */
  exit: Foreign.exit,
  UIKit: UIKit,
  CoreBluetooth: CoreBluetooth,
};

declare global {
  interface Window {
    ji: typeof ji;
    webkit: any;
  }
}

window["ji"] = ji;
