import { CBCentralManager, CBCentralManagerDelegate } from "./CoreBluetooth";

export type Command<T extends { Action: unknown; Object: unknown }> =
  | { ret: { _id: number; contents: Return<T["Object"]> } }
  | { call: { _id: number; contents: T["Action"] } };

export type Return<T> =
  | { Void: {} }
  | { Null: {} }
  | { RetError: { reason: string } }
  | { RetBool: { b: boolean } }
  | { RetInt: { n: number } }
  | { String: { s: string } }
  | { Float: { f: number } }
  | { Pointer: { ptr: RemotePointer<any> } };

export type Browser = {
  Action: BrowserAction;
  Object: void;
};

export type Native = {
  Action: NativeAction;
  Object: void;
};

type RemotePointer_<T> = number;
export type RemotePointer<T> = RemotePointer_<T>;

export type BrowserAction =
  | { alert: { message: string } }
  | {
      CoreBluetooth_centralManagerDidUpdateState: {
        ptr: RemotePointer<CBCentralManager>;
      };
    };

export type NativeAction =
  | { hello: { version: number } }
  | { free: { id: number } }
  | { exit: { code: number } }
  | { UIKit_UIDevice_current_model_get: {} }
  | { UIKit_UIDevice_current_batteryLevel_get: {} }
  | {
      UIKit_UIDevice_current_isBatteryMonitoringEnabled_set: { value: boolean };
    }
  | { CoreBluetooth_CBCentralManager_new: {} };

// type NativeActionReturn_ = {
//   hello: number,
//   free: void,
//   exit: void,
//   UIKit_UIDevice_current_model_get: string,
//   UIKit_UIDevice_current_batteryLevel_get: number,
//   UIKit_UIDevice_current_isBatteryMonitoringEnabled_set: boolean,
// }

// export type NativeActionReturn<T> = NativeActionReturn_ extends T ? T extends infer U
//   ? U extends object
//     ? NativeActionReturn_[keyof T]
//     : never
//   : never : never ;
