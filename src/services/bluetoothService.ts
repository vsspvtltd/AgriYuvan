// Bluetooth Service - Web Bluetooth API integration
// For connecting to agricultural sensors and IoT devices

// Type declarations for Web Bluetooth API
declare global {
  interface Navigator {
    bluetooth?: {
      getDevices(): Promise<any[]>;
      requestDevice(options?: any): Promise<any>;
    };
  }
}

export interface BluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
  device?: any;
  server?: any;
}

export interface SensorReading {
  deviceId: string;
  timestamp: Date;
  type: 'soil_moisture' | 'temperature' | 'humidity' | 'ph' | 'nitrogen' | 'phosphorus' | 'potassium';
  value: number;
  unit: string;
}

class BluetoothService {
  private device: BluetoothDevice | null = null;
  private server: any = null;
  private characteristic: any = null;
  private listeners: Map<string, ((data: SensorReading) => void)[]> = new Map();

  // Check if Web Bluetooth API is supported
  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  // Request device connection
  async requestDevice(options?: any): Promise<BluetoothDevice> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth API is not supported in this browser');
    }

    try {
      const device = await navigator.bluetooth!.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information'],
        ...options,
      });

      return {
        id: device.id,
        name: device.name || 'Unknown Device',
        connected: false,
        device,
      };
    } catch (error) {
      console.error('Error requesting Bluetooth device:', error);
      throw new Error('Failed to request Bluetooth device');
    }
  }

  // Connect to a device
  async connect(deviceId: string): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth API is not supported in this browser');
    }

    try {
      // Get the device from the cache or request it
      const devices = await navigator.bluetooth!.getDevices();
      const device = devices.find((d: any) => d.id === deviceId);

      if (!device) {
        throw new Error('Device not found. Please request device first.');
      }

      this.server = await device.gatt?.connect();
      
      if (!this.server) {
        throw new Error('Failed to connect to GATT server');
      }

      this.device = {
        id: device.id,
        name: device.name || 'Unknown Device',
        connected: true,
        device,
        server: this.server,
      };

      // Set up disconnect listener
      device.addEventListener('gattserverdisconnected', this.handleDisconnect.bind(this));

      console.log('Connected to device:', device.name);
    } catch (error) {
      console.error('Error connecting to Bluetooth device:', error);
      throw new Error('Failed to connect to Bluetooth device');
    }
  }

  // Disconnect from device
  async disconnect(): Promise<void> {
    if (this.server && this.server.connected) {
      this.server.disconnect();
    }
    
    this.device = null;
    this.server = null;
    this.characteristic = null;
    
    console.log('Disconnected from device');
  }

  // Handle device disconnect
  private handleDisconnect(): void {
    console.log('Device disconnected');
    this.device = null;
    this.server = null;
    this.characteristic = null;
  }

  // Get connected device info
  getConnectedDevice(): BluetoothDevice | null {
    return this.device;
  }

  // Check if connected
  isConnected(): boolean {
    return this.device?.connected || false;
  }

  // Start receiving notifications from a characteristic
  async startNotifications(serviceUuid: string, characteristicUuid: string): Promise<void> {
    if (!this.server) {
      throw new Error('Not connected to any device');
    }

    try {
      const service = await this.server.getPrimaryService(serviceUuid);
      this.characteristic = await service.getCharacteristic(characteristicUuid);
      
      await this.characteristic.startNotifications();
      
      this.characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        this.handleCharacteristicValueChange(event);
      });
      
      console.log('Started notifications for characteristic:', characteristicUuid);
    } catch (error) {
      console.error('Error starting notifications:', error);
      throw new Error('Failed to start notifications');
    }
  }

  // Stop notifications
  async stopNotifications(): Promise<void> {
    if (this.characteristic) {
      try {
        await this.characteristic.stopNotifications();
        this.characteristic.removeEventListener('characteristicvaluechanged', this.handleCharacteristicValueChange);
        console.log('Stopped notifications');
      } catch (error) {
        console.error('Error stopping notifications:', error);
      }
    }
  }

  // Handle incoming data from characteristic
  private handleCharacteristicValueChange(event: any): void {
    const characteristic = event.target;
    const value = characteristic.value;
    
    if (value) {
      const data = this.parseSensorData(value);
      this.notifyListeners(data);
    }
  }

  // Parse sensor data from characteristic value
  private parseSensorData(value: DataView): SensorReading {
    // This is a simplified parser - actual implementation depends on your device protocol
    const deviceId = this.device?.id || 'unknown';
    const timestamp = new Date();
    
    // Example parsing - adjust based on your device's data format
    const type = this.determineSensorType(value);
    const sensorValue = value.getUint8(0);
    const unit = this.getUnitForType(type);
    
    return {
      deviceId,
      timestamp,
      type,
      value: sensorValue,
      unit,
    };
  }

  // Determine sensor type based on data
  private determineSensorType(value: DataView): SensorReading['type'] {
    // This is a placeholder - implement based on your device protocol
    const typeCode = value.getUint8(1);
    
    switch (typeCode) {
      case 0x01: return 'soil_moisture';
      case 0x02: return 'temperature';
      case 0x03: return 'humidity';
      case 0x04: return 'ph';
      case 0x05: return 'nitrogen';
      case 0x06: return 'phosphorus';
      case 0x07: return 'potassium';
      default: return 'temperature';
    }
  }

  // Get unit for sensor type
  private getUnitForType(type: SensorReading['type']): string {
    switch (type) {
      case 'soil_moisture': return '%';
      case 'temperature': return '°C';
      case 'humidity': return '%';
      case 'ph': return 'pH';
      case 'nitrogen':
      case 'phosphorus':
      case 'potassium': return 'mg/kg';
      default: return '';
    }
  }

  // Add listener for sensor data
  addListener(eventType: string, callback: (data: SensorReading) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  // Remove listener
  removeListener(eventType: string, callback: (data: SensorReading) => void): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify all listeners
  private notifyListeners(data: SensorReading): void {
    const callbacks = this.listeners.get('sensorData');
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Write data to characteristic
  async writeCharacteristic(serviceUuid: string, characteristicUuid: string, data: Uint8Array): Promise<void> {
    if (!this.server) {
      throw new Error('Not connected to any device');
    }

    try {
      const service = await this.server.getPrimaryService(serviceUuid);
      const characteristic = await service.getCharacteristic(characteristicUuid);
      
      await characteristic.writeValue(data);
      console.log('Data written to characteristic');
    } catch (error) {
      console.error('Error writing to characteristic:', error);
      throw new Error('Failed to write to characteristic');
    }
  }

  // Read data from characteristic
  async readCharacteristic(serviceUuid: string, characteristicUuid: string): Promise<DataView> {
    if (!this.server) {
      throw new Error('Not connected to any device');
    }

    try {
      const service = await this.server.getPrimaryService(serviceUuid);
      const characteristic = await service.getCharacteristic(characteristicUuid);
      
      const value = await characteristic.readValue();
      console.log('Data read from characteristic');
      
      return value;
    } catch (error) {
      console.error('Error reading from characteristic:', error);
      throw new Error('Failed to read from characteristic');
    }
  }

  // Get device battery level (if supported)
  async getBatteryLevel(): Promise<number> {
    if (!this.server) {
      throw new Error('Not connected to any device');
    }

    try {
      const service = await this.server.getPrimaryService('battery_service');
      const characteristic = await service.getCharacteristic('battery_level');
      
      const value = await characteristic.readValue();
      const batteryLevel = value.getUint8(0);
      
      return batteryLevel;
    } catch (error) {
      console.error('Error reading battery level:', error);
      throw new Error('Failed to read battery level');
    }
  }

  // Get device information (if supported)
  async getDeviceInfo(): Promise<{
    manufacturer?: string;
    model?: string;
    firmwareRevision?: string;
    hardwareRevision?: string;
  }> {
    if (!this.server) {
      throw new Error('Not connected to any device');
    }

    try {
      const service = await this.server.getPrimaryService('device_information');
      const info: any = {};

      try {
        const manufacturerChar = await service.getCharacteristic('manufacturer_name_string');
        const manufacturerValue = await manufacturerChar.readValue();
        info.manufacturer = new TextDecoder().decode(manufacturerValue);
      } catch (e) {
        // Manufacturer not available
      }

      try {
        const modelChar = await service.getCharacteristic('model_number_string');
        const modelValue = await modelChar.readValue();
        info.model = new TextDecoder().decode(modelValue);
      } catch (e) {
        // Model not available
      }

      try {
        const firmwareChar = await service.getCharacteristic('firmware_revision_string');
        const firmwareValue = await firmwareChar.readValue();
        info.firmwareRevision = new TextDecoder().decode(firmwareValue);
      } catch (e) {
        // Firmware not available
      }

      try {
        const hardwareChar = await service.getCharacteristic('hardware_revision_string');
        const hardwareValue = await hardwareChar.readValue();
        info.hardwareRevision = new TextDecoder().decode(hardwareValue);
      } catch (e) {
        // Hardware not available
      }

      return info;
    } catch (error) {
      console.error('Error reading device information:', error);
      throw new Error('Failed to read device information');
    }
  }
}

// Export singleton instance
export const bluetoothService = new BluetoothService();
