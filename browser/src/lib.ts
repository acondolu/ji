/**
 * This is a sample main file.
 */

import * as Foreign from "./Foreign";
import UIKit from "./UIKit";

const ji = {
  hello: Foreign.hello,
  log: Foreign.log,
  exit: Foreign.exit,
  UIKit: UIKit,
};

declare global {
  interface Window {
    ji: typeof ji,
    webkit: any,
  }
}

window['ji'] = ji;
