import SwiftUI
import CoreBluetooth

final class ContentView: NSObject, View {
    @State private var peripheralManager: CBPeripheralManager!
    @State private var characteristic: CBMutableCharacteristic!
    @State private var centralManager: CBCentralManager!
    @State private var connectedPeripheral: CBPeripheral?
    
    @State private var sendData: String = ""
    @State private var sentData: String = ""
    
    let serviceUUID = CBUUID(string: "YOUR_SERVICE_UUID")
    let characteristicUUID = CBUUID(string: "YOUR_CHARACTERISTIC_UUID")
    
    @State private var discoveredPeripheral: CBPeripheral?
    @State private var discoveredCharacteristic: CBCharacteristic?
    
    var body: some View {
        VStack {
            Text("Bluetooth LE Data Sender")
                .font(.title)
                .padding()
            
            TextField("Enter data to send", text: $sendData)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .padding()
            
            Button("Send Data") {
                self.sendDataToPeripheral()
            }
            .padding()
            
            Text("Sent Data: \(sentData)")
                .padding()
        }
        .onAppear {
            self.peripheralManager = CBPeripheralManager(delegate: self, queue: nil)
            self.centralManager = CBCentralManager(delegate: self, queue: nil)
        }
    }
    func sendDataToPeripheral() {
        guard let data = sendData.data(using: .utf8), let peripheral = connectedPeripheral else {
            return
        }
        
        peripheral.writeValue(data, for: characteristic, type: .withoutResponse)
        sentData = sendData
    }
    
    func startScanning() {
        centralManager.scanForPeripherals(withServices: [serviceUUID], options: nil)
    }
    
    func stopScanning() {
        centralManager.stopScan()
    }
    
    func createServiceAndCharacteristic() {
        let characteristic = CBMutableCharacteristic(type: characteristicUUID, properties: [.writeWithoutResponse], value: nil, permissions: [.writeable])
        let service = CBMutableService(type: serviceUUID, primary: true)
        service.characteristics = [characteristic]
        peripheralManager.add(service)
        self.characteristic = characteristic
    }
}

extension ContentView: CBPeripheralManagerDelegate {
    func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
        if peripheral.state == .poweredOn {
            createServiceAndCharacteristic()
        }
    }
}

extension ContentView: CBCentralManagerDelegate {
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        if central.state == .poweredOn {
            startScanning()
        } else {
            stopScanning()
        }
    }
    
    func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
        if discoveredPeripheral == nil {
            discoveredPeripheral = peripheral
            central.connect(peripheral, options: nil)
        }
    }
    
    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        peripheral.delegate = self
        peripheral.discoverServices([serviceUUID])
    }
}

extension ContentView: CBPeripheralDelegate {
    func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        if let service = peripheral.services?.first(where: { $0.uuid == serviceUUID }) {
            peripheral.discoverCharacteristics([characteristicUUID], for: service)
        }
    }
    
    func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
        if let characteristic = service.characteristics?.first(where: { $0.uuid == characteristicUUID }) {
            discoveredCharacteristic = characteristic
        }
    }
}
