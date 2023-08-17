import Foundation
import SwiftUI
import Combine

let VERSION: Int64 = 0;

public class Foreign {
    public var send: ((Command<Browser>) -> ())? = nil;
    // Table storing the references to native objects that have crossed the boundary
    var refTable: [UInt64: Any] = [:]
    // Table storing the pending browser-side computations
    var pending: [UInt64: (Result<Any?, BrowserError>) -> Void] = [:];
    var n: Int64 = 0;
    
    public init() {}
    
    func sendCommand(cmd: Command<Browser>) {
        if let send = send {
            DispatchQueue.main.async {
                send(cmd)
            }
        }
    }
    
    public func recvCommand(command: Command<Native>) {
        switch command {
        case .call(let _id, let contents) :
            let ret = runNativeAction(action: contents)
            sendCommand(cmd: .ret(_id: _id, contents: ret))
        case .ret(let _id, let contents):
            if let promise = self.pending.removeValue(forKey: _id) {
                switch contents {
                case .Void: promise(.success(()))
                case .Null: promise(.success(nil))
                case .RetInt(n: let n): promise(.success(n))
                case .RetBool(b: let b): promise(.success(b))
                case .String(s: let string): promise(.success(string))
                case .Float(f: let float): promise(.success(float))
                case .Error(reason: let reason): promise(.failure(BrowserError(reason: reason)))
                }
            }
        }
    }
    
    func call<T>(action: Browser.Action) async throws -> T {
        let _id = UInt64(OSAtomicIncrement64(&n))
        let future = Future<T, BrowserError> { promise in
            self.pending[_id] = { result in
                switch result {
                case .success(let success):
                    if let x = success as? T {
                        return promise(.success(x))
                    } else {
                        return promise(.failure(BrowserError(reason: "BUT: Cannot convert type")))
                    }
                case .failure(let failure): return promise(.failure(failure))
                }
            }
            self.sendCommand(cmd: .call(_id: _id, contents: action));
        };
        return try await future.value
    }
    
    // TODO: should probably also return any object to allocate in the table
    func runNativeAction(action: Native.Action) -> Return<MyVoid> {
        switch action {
        case .exit(let code):
            exit(code)
        case .free(let n):
            refTable.removeValue(forKey: n)
            return .Void
        case .hello(let version):
            if version == VERSION {
                return .RetInt(n: VERSION)
            } else {
                return .Error(reason: "Incompatible client version: \(version) vs \(VERSION)")
            }
        case .UIKit_UIDevice_current_model_get:
            return .String(s: UIDevice.current.model)
        case .UIKit_UIDevice_current_batteryLevel_get:
            return .Float(f: UIDevice.current.batteryLevel)
        case .UIKit_UIDevice_current_isBatteryMonitoringEnabled_set(value: let value):
            UIDevice.current.isBatteryMonitoringEnabled = value;
            return .RetBool(b: UIDevice.current.isBatteryMonitoringEnabled)
        }
    }
    
    public func alert(message: String) async throws -> Void {
        return try await call(action: .alert(message: message));
    }

}

public let foreign = Foreign()

public func encodeOr(command: Command<Browser>) -> String {
    if let res = try? JSONEncoder().encode(command) {
        return String(decoding: res, as: UTF8.self)
    } else {
        let obj: Command<Browser> = .ret(_id: 0, contents: .Error(reason: "BUG: Could not encode the response to JSON."));
        // TODO: new "system announcements" constructor instead of using ".ret(_id: 0, ..."
        if let res = try? JSONEncoder().encode(obj) {
            return String(decoding: res, as: UTF8.self)
        } else {
            exit(1)
        }
    }
}

