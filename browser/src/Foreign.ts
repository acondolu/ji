import { NativeAction, Native, Command, Browser, Return } from "./Types";

declare const FinalizationRegistry: any | undefined;

const VERSION = 0;

class Foreign {
  //
  private ffi_registry: any;
  private rpc_no: any = 0;
  private rpcs: Map<
    number,
    { resolve: (value: any) => void; reject: (reason: any) => void }
  >;
  private postMessage: (value: string) => void;
  private remoteLog: (message: string) => void;

  constructor() {
    this.postMessage = (value) =>
      (window as any).webkit?.messageHandlers?.nativeCallback?.postMessage(
        value
      );
    if (!(window as any).webkit?.messageHandlers?.nativeCallback?.postMessage) {
      throw Error(
        "Unsupported: window.webkit.messageHandlers.nativeCallback.postMessage"
      );
    }
    this.remoteLog = (message) =>
      (window as any).webkit?.messageHandlers?.nativeLogger?.postMessage(
        message
      );
    if (!(window as any).webkit?.messageHandlers?.nativeLogger?.postMessage) {
      throw Error(
        "Unsupported: window.webkit.messageHandlers.nativeLogger.postMessage"
      );
    }
    if (!FinalizationRegistry) {
      throw Error("Unsupported: FinalizationRegistry");
    }
    this.ffi_registry = new FinalizationRegistry(async (id: number) => {
      await this.call({ free: { id } });
    });
    this.rpcs = new Map();
  }

  // private alloc(id: number, value: any) {
  //   this.ffi_registry.register(value, id);
  // }

  /**
   * Process a command sent from the native app.
   */
  private recv(cmd: Command<Browser>): void {
    this.log(`recv(${JSON.stringify(cmd)})`);
    const { key, value } = tag(cmd);
    switch (key) {
      case "ret": {
        const { _id, contents } = value;
        this.recvRet(_id, contents);
        break;
      }
      case "call": {
        const { _id, contents } = value;
        const ret = this.runBrowserAction(contents);
        this.ret(_id, ret);
      }
    }
  }

  private recvRet(_id: number, contents: Return<void>) {
    const resolve = (value: any) => {
      const resolve = this.rpcs.get(_id)?.resolve;
      if (resolve) {
        this.rpcs.delete(_id);
        resolve(value);
      }
    };
    const reject = (reason: any) => {
      const reject = this.rpcs.get(_id)?.reject;
      if (reject) {
        this.rpcs.delete(_id);
        reject(reason);
      }
    };
    const { key, value } = tag<Return<void>>(contents);
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
      default:
        this.log(`recvRet: unknown command: ${JSON.stringify(contents)}`);
    }
  }

  /**
   * Implements the browser actions that can be called from the native app.
   */
  private runBrowserAction(action: Browser["Action"]): Return<void> {
    const { key, value } = tag(action);
    switch (key) {
      case "alert":
        alert(value.message);
        return { Void: {} };
      default:
        return {
          RetError: {
            reason: `Unknwon browser action: ${JSON.stringify(action)}.`,
          },
        };
    }
  }

  call(action: NativeAction): Promise<any> {
    this.rpc_no = this.rpc_no + 1;
    const _id: number = this.rpc_no;
    return new Promise((resolve, reject) => {
      this.rpcs.set(_id, { resolve, reject });
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
      "jirecv",
      (e: CustomEvent) => {
        this.log(`XrecvX ${e}`);
        this.recv(e.detail);
      },
      false
    );
    return this.call({ hello: { version: VERSION } });
  }
}

let foreign: Foreign | null = mkForeign();
export let error: Error = null;

function mkForeign(): Foreign | null {
  try {
    return new Foreign();
  } catch (e) {
    error = e;
    return null;
  }
}

function withForeign<T>(act: (foreign: Foreign) => Promise<T>): Promise<T> {
  if (foreign) {
    return act(foreign);
  } else {
    return Promise.reject(new Error(`ji: not available (${error.toString()})`));
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
