public protocol Party {
    associatedtype Action
    associatedtype Object
}

public enum Command<T: Party> {
    case ret(_id: UInt64, contents: Return<T.Object>);
    case call(_id: UInt64, contents: T.Action);
}

extension Command: Encodable where T.Action: Encodable, T.Object: Encodable {}

extension Command: Decodable where T.Action: Decodable, T.Object: Decodable {}

public struct Native: Party {
    public typealias Action = NativeAction
    public typealias Object = MyVoid
}

public struct Browser: Party {
    public typealias Action = BrowserAction
    public typealias Object = MyVoid
}

public enum MyVoid: Encodable, Decodable {
    case stub;
}

public enum NativeAction: Decodable {
    case exit(code: Int32);
    case free(id: UInt64);
    case hello(version: Int64);
    case UIKit_UIDevice_current_model_get;
    case UIKit_UIDevice_current_batteryLevel_get;
    case UIKit_UIDevice_current_isBatteryMonitoringEnabled_set(value: Bool);
    case CoreBluetooth_CBCentralManager_new;
}

public enum BrowserAction: Encodable {
    case alert(message: String);
    case CoreBluetooth_centralManagerDidUpdateState(ptr: UInt64);
}

struct BrowserError: Error {
    var reason: String;
}

public typealias ForeignPointer<T> = UInt64;

public enum Return<T> {
    case Void;
    case Null;
    case RetInt(n: Int64);
    case Float(f: Float);
    case RetBool(b: Bool);
    case String(s: String);
    case Pointer(ptr: ForeignPointer<Any>);
    case Error(reason: String);
//    case complex(T);
}

extension Return: Encodable where T: Encodable {}

extension Return: Decodable where T: Decodable {}
