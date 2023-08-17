// https://developer.apple.com/documentation/uikit/uidevice

import { NSObject } from "../ObjectiveC/NSObject";
import { foreign } from "../Foreign";

export default class UIDevice extends NSObject {
  constructor() {
    super();
  }
  /**
   * The model of the device.
   */
  get model() {
    return foreign.call({ "UIKit_UIDevice_current_model_get": {} });
  }

  // Getting the device battery state

  // TODO: UIDevice.current.isBatteryMonitoringEnabled = true
  isBatteryMonitoringEnabled = {
    set(value: boolean): Promise<boolean> {
      return foreign.call({ "UIKit_UIDevice_current_isBatteryMonitoringEnabled_set": { value } });
    },
  };

  /**
   * The battery charge level for the device.
   */
  get batteryLevel() {
    return foreign.call({ "UIKit_UIDevice_current_batteryLevel_get": {} });
  }
}

export const current = new UIDevice();
