// https://developer.apple.com/documentation/uikit/uidevice

import { NSObject } from "../ObjectiveC/NSObject";
import { call } from "../Foreign";

/**
 * A representation of the current device.
 */
export class UIDevice extends NSObject {
  /**
   * The model of the device.
   */
  get model() {
    return call({ "UIKit_UIDevice_current_model_get": {} });
  }

  // Getting the device battery state

  /**
   * A Boolean value that indicates whether battery monitoring is enabled.
   */
  isBatteryMonitoringEnabled = {
    set(value: boolean): Promise<boolean> {
      return call({ "UIKit_UIDevice_current_isBatteryMonitoringEnabled_set": { value } });
    },
  };

  /**
   * The battery charge level for the device.
   */
  get batteryLevel() {
    return call({ "UIKit_UIDevice_current_batteryLevel_get": {} });
  }
}

export const current = new UIDevice();

// Make UIDevice unconstructable (breaks the TS contract)
delete (UIDevice as any).prototype.constructor;
