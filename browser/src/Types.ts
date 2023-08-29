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
  | { Float: { f: number } };

export type Browser = {
  Action: BrowserAction;
  Object: void;
};

export type Native = {
  Action: NativeAction;
  Object: void;
};

export type BrowserAction = { alert: { message: string } };

export type NativeAction =
  | { hello: { version: number } }
  | { free: { id: number } }
  | { exit: { code: number } }
  | { UIKit_UIDevice_current_model_get: {} }
  | { UIKit_UIDevice_current_batteryLevel_get: {} }
  | {
      UIKit_UIDevice_current_isBatteryMonitoringEnabled_set: { value: boolean };
    };
