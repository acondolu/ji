import {
  NativeAction,
  Native,
  Command,
  Browser,
  Return,
  ForeignInterface,
} from "./types.d";

declare const FinalizationRegistry: any | undefined;
const postMessage: ((value: string) => void) | undefined =
  // = (window as any).webkit?.messageHandlers?.nativeCallback?.postMessage;
  (window as any)["ji"]["postMessage"];

const remoteLog = (window as any)["ji"]["remoteLog"];

const VERSION = 0;

class Foreign implements ForeignInterface {
  //
  private ffi_registry: any;
  private rpc_no: any = 0;
  private rpcs: Map<
    number,
    { resolve: (value: any) => void; reject: (reason: any) => void }
  >;

  constructor() {
    if (!postMessage) {
      throw Error(
        "Unsupported: window.webkit.messageHandlers.nativeCallback.postMessage"
      );
    }
    if (!FinalizationRegistry) {
      throw Error("Unsupported: FinalizationRegistry");
    }
    this.ffi_registry = new FinalizationRegistry(async (id: number) => {
      await this.call({ free: { id } });
    });
    (window as any)["ji"]["got"] = (x: Command<Browser>) => this.recv(x);
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
    if ("ret" in cmd) {
      const { _id, contents } = cmd.ret;
      this.recvRet(_id, contents);
    } else if ("call" in cmd) {
      const { _id, contents } = cmd.call;
      const ret = this.runBrowserAction(contents);
      this.ret(_id, ret);
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
    if ("RetUndefined" in contents) {
      return resolve(undefined);
    }
    if ("RetInt" in contents) {
      return resolve(contents.RetInt.n);
    }
    if ("RetNull" in contents) {
      return resolve(null);
    }
    if ("RetError" in contents) {
      return reject(Error(contents.RetError.reason));
    }
    if ("String" in contents) {
      return resolve(contents.String.s);
    }
    if ("Float" in contents) {
      return resolve(contents.Float.f);
    }
    if ("RetBool" in contents) {
      return resolve(contents.RetBool.b);
    }
    this.log(`recvRet: unknown command: ${JSON.stringify(contents)}`);
  }

  /**
   * Implements the browser actions that can be called from the native app.
   */
  private runBrowserAction(action: Browser["Action"]): Return<void> {
    if ("alert" in action) {
      alert(action.alert.message);
      return { Void: {} };
    } else {
      return { RetError: { reason: `Unknwon browser action: ${JSON.stringify(action)}.` }}
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
    return postMessage!(JSON.stringify(cmd));
  }

  log(message: string) {
    if (remoteLog) {
      return remoteLog(message);
    }
  }
}

export const foreign: ForeignInterface = new Foreign();

  /**
   * Begin handshake with native app.
   * Will exchange and compare the version numbers.
   */
  export function hello(): Promise<number> {
    return foreign.call({ hello: { version: VERSION } });
  }

  // Supported native actions

  /**
   * Exit the app with given error code.
   */
  export function exit(code: number = 0): Promise<void> {
    return foreign.call({ exit: { code: code } });
  }

  /**
   * Print a message into native app's stdout.
   */
  export function log(message: string) {
    return foreign.log(message);
  }
