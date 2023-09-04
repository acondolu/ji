import CoreBluetooth

class MyCBCentralManager: CBCentralManager {
    public var _id: UInt64;
    public init(_id: UInt64, queue: DispatchQueue?, options: [String : Any]? = nil) {
        self._id = _id
        super.init(delegate: MyCBCentralManagerDelegate(), queue: queue, options: options)
    }
    
}

class MyCBCentralManagerDelegate: NSObject, CBCentralManagerDelegate {
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        if let manager = central as? MyCBCentralManager {
            return foreign.callback(action: .CoreBluetooth_centralManagerDidUpdateState(ptr: manager._id))
        }
    }
    
    
}
