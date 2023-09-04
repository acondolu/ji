import { call, register } from "./Foreign";
import { RemotePointer } from "./Types";

/**
 * An object that scans for, discovers, connects to, and manages peripherals.
 */
export class CBCentralManager {
  #remotePtr: RemotePointer<CBCentralManager>;
  delegate?: CBCentralManagerDelegate;
  private constructor(
    remotePtr: RemotePointer<CBCentralManager>,
    delegate?: CBCentralManagerDelegate
    // queue?: DispatchQueue,
    // options?: Map<string, any>,
  ) {
    this.#remotePtr = remotePtr;
    this.delegate = delegate;
  }
  async init(
    delegate?: CBCentralManagerDelegate
    // queue?: DispatchQueue,
    // options?: Map<string, any>,
  ): Promise<CBCentralManager> {
    const remotePtr: RemotePointer<CBCentralManager> = await call({
      CoreBluetooth_CBCentralManager_new: {},
    });
    return register(remotePtr, new CBCentralManager(remotePtr, delegate));
  }

  connect(peripheral: CBPeripheral, options?: Map<string, any>) {}
  cancelPeripheralConnection(peripheral: CBPeripheral) {}

  scanForPeripherals(withServices?: [CBUUID], options?: Map<string, any>) {}

  stopScan() {}
}

export interface CBCentralManagerDelegate {
  centralManagerDidUpdateState(central: CBCentralManager): void;
}

export class CBPeer {
  get identifier(): Promise<UUID> {
    throw new Error("STUB");
  }
}
export class CBPeripheral extends CBPeer {}
export type UUID = string;
export type CBUUID = string;

type DispatchQueue = never;

export default {
  CBCentralManager: CBCentralManager,
};
