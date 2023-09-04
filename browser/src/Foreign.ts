import { CBCentralManager } from "./CoreBluetooth";
import {
  NativeAction,
  Native,
  Command,
  Browser,
  Return,
  RemotePointer,
} from "./Types";

declare class FinalizationRegistry<T, V> {
  constructor(finalizer: (heldValue: V) => void);
  register(target: T, heldValue: V): void;
  // unregister(target: any): void;
}

declare class WeakRef<T> {
  constructor(value: T);
  deref(): T | undefined;
}

const VERSION = 0;

class Foreign {
  private remoteRegistry: FinalizationRegistry<any, number>;
  private remoteMap: Map<number, WeakRef<any>>;
  private commandNo: any = 0;
  private inflightCommands: Map<
    number,
    { resolve: (value: any) => void; reject: (reason: any) => void }
  >;
  private postMessage: (value: string) => void;
  private remoteLog: (message: string) => void;

  constructor() {
    if (!(window as any).webkit?.messageHandlers?.nativeCallback?.postMessage) {
      throw Error(
        "Unsupported: window.webkit.messageHandlers.nativeCallback.postMessage"
      );
    }
    if (!(window as any).webkit?.messageHandlers?.nativeLogger?.postMessage) {
      throw Error(
        "Unsupported: window.webkit.messageHandlers.nativeLogger.postMessage"
      );
    }
    this.postMessage = (value) =>
      (window as any).webkit?.messageHandlers?.nativeCallback?.postMessage(
        value
      );
    this.remoteLog = (message) =>
      (window as any).webkit?.messageHandlers?.nativeLogger?.postMessage(
        message
      );
    if (!FinalizationRegistry) {
      throw Error("Unsupported: FinalizationRegistry");
    }
    if (!WeakRef) {
      throw Error("Unsupported: WeakRef");
    }
    this.remoteRegistry = new FinalizationRegistry(async (id: number) => {
      this.remoteMap.delete(id);
      await this.call({ free: { id } });
    });
    this.remoteMap = new Map();
    this.inflightCommands = new Map();
  }

  register<T>(id: RemotePointer<T>, value: T) {
    this.remoteRegistry.register(value, id);
    this.remoteMap.set(id, new WeakRef(value));
  }

  /**
   * Process a command sent from the native app.
   */
  private recv(cmd: Command<Browser>): void {
    this.log(`recv(${JSON.stringify(cmd)})`);
    const { key, value } = tag(cmd)!;
    switch (key) {
      case "ret": {
        const { _id, contents } = value;
        this.recvRet(_id, contents);
        break;
      }
      case "call": {
        const { _id, contents } = value;
        const ret = this.runBrowserAction(contents);
        if (ret) this.ret(_id, ret);
      }
    }
  }

  private recvRet(_id: number, contents: Return<void>) {
    const resolve = (value: any) => {
      const resolve = this.inflightCommands.get(_id)?.resolve;
      if (resolve) {
        this.inflightCommands.delete(_id);
        resolve(value);
      }
    };
    const reject = (reason: any) => {
      const reject = this.inflightCommands.get(_id)?.reject;
      if (reject) {
        this.inflightCommands.delete(_id);
        reject(reason);
      }
    };
    const { key, value } = tag<Return<void>>(contents)!;
    switch (key) {
      case "Void":
        return resolve(undefined);
      case "RetInt":
        return resolve(value.n);
      case "Null":
        return resolve(null);
      case "RetError":
        return reject(Error(value.reason));
      case "String":
        return resolve(value.s);
      case "Float":
        return resolve(value.f);
      case "RetBool":
        return resolve(value.b);
      case "Pointer":
        return resolve(value.ptr);
      default:
        this.log(`recvRet: unknown command: ${JSON.stringify(contents)}`);
    }
  }

  /**
   * Implements the browser actions that can be called from the native app.
   */
  private runBrowserAction(action: Browser["Action"]): Return<void> | void {
    const { key, value } = tag(action)!;
    switch (key) {
      case "alert":
        alert(value.message);
        return { Void: {} };
      case "CoreBluetooth_centralManagerDidUpdateState": {
        const obj = this.getObj<CBCentralManager>(value.ptr);
        obj?.delegate?.centralManagerDidUpdateState(obj);
        return;
      }
      default:
        return {
          RetError: {
            reason: `Unknown browser action: ${JSON.stringify(action)}.`,
          },
        };
    }
  }

  getObj<T>(ptr: RemotePointer<T>): T | undefined {
    const ret = this.remoteMap.get(ptr)?.deref();
    if (!ret) {
      this.remoteMap.delete(ptr);
    }
    return ret;
  }

  call(action: NativeAction): Promise<any> {
    this.commandNo = this.commandNo + 1;
    const _id: number = this.commandNo;
    return new Promise((resolve, reject) => {
      this.inflightCommands.set(_id, { resolve, reject });
      this.send({ call: { _id, contents: action } });
    });
  }

  private ret(_id: number, contents: Return<void>) {
    return this.send({ ret: { _id, contents } });
  }

  private send(cmd: Command<Native>) {
    this.log(JSON.stringify(cmd));
    return this.postMessage(JSON.stringify(cmd));
  }

  log(message: string) {
    return this.remoteLog(message);
  }

  hello(): Promise<number> {
    document.addEventListener(
      "jirecv" as any,
      (e: CustomEvent) => {
        this.recv(e.detail);
      },
      false
    );
    return this.call({ hello: { version: VERSION } });
  }
}

let foreign: Foreign | null = mkForeign();
export let error: Error | null = null;

function mkForeign(): Foreign | null {
  try {
    return new Foreign();
  } catch (e) {
    error = e as Error;
    return null;
  }
}

function withForeign<T>(act: (foreign: Foreign) => Promise<T>): Promise<T> {
  if (foreign) {
    return act(foreign);
  } else {
    return Promise.reject(
      new Error(`ji: not available (${error?.toString()})`)
    );
  }
}

export function hello(): Promise<number> {
  return withForeign((foreign) => foreign.hello());
}

export function exit(code: number = 0): Promise<void> {
  return withForeign((foreign) => foreign.call({ exit: { code } }));
}

export function log(message: string) {
  if (foreign) foreign.log(message);
}

export function call(action: NativeAction): Promise<any> {
  return withForeign((foreign) => foreign.call(action));
}

export function register<T>(id: RemotePointer<T>, value: T): T {
  if (foreign) foreign.register(id, value);
  return value;
}

type TaggedProperty<T> = {
  key: keyof T;
  value: T[keyof T];
};

type TaggedUnion<T> = T extends infer U
  ? U extends object
    ? TaggedProperty<U>
    : never
  : never;

function tag<T>(obj: T): TaggedUnion<T> | null {
  const keys = Object.getOwnPropertyNames(obj) as Array<keyof T>;
  if (keys.length > 0) {
    const key = keys[0];
    return {
      key,
      value: obj[key],
    } as any;
  }
  return null;
}
