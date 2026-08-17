// QR/Barcode Scanning Service
// For scanning seeds, products, and other agricultural items

export interface ScanResult {
  type: 'qr' | 'barcode' | 'ean' | 'upc' | 'code128' | 'code39' | 'unknown';
  data: string;
  timestamp: Date;
  format?: string;
}

export interface ScanOptions {
  preferFrontCamera?: boolean;
  showTorchButton?: boolean;
  playSoundOnScan?: boolean;
  vibrateOnScan?: boolean;
  scanDelay?: number; // milliseconds between scans
}

class ScanService {
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private scanning: boolean = false;
  private scanInterval: number | null = null;
  private listeners: Map<string, ((result: ScanResult) => void)[]> = new Map();
  private lastScanTime: number = 0;
  private options: ScanOptions = {
    preferFrontCamera: false,
    showTorchButton: true,
    playSoundOnScan: true,
    vibrateOnScan: true,
    scanDelay: 1000,
  };

  // Check if camera access is supported
  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 
           'mediaDevices' in navigator && 
           'getUserMedia' in navigator.mediaDevices;
  }

  // Request camera permissions
  async requestCameraPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Camera access is not supported in this browser');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  }

  // Initialize camera
  async initializeCamera(videoElement: HTMLVideoElement, options?: ScanOptions): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Camera access is not supported in this browser');
    }

    this.videoElement = videoElement;
    this.options = { ...this.options, ...options };

    try {
      const constraints = {
        video: {
          facingMode: this.options.preferFrontCamera ? 'user' : 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = stream;
      
      await new Promise((resolve, reject) => {
        videoElement.onloadedmetadata = () => resolve(true);
        videoElement.onerror = reject;
      });

      await videoElement.play();
      
      // Create canvas for frame capture
      this.canvasElement = document.createElement('canvas');
      this.canvasElement.width = videoElement.videoWidth;
      this.canvasElement.height = videoElement.videoHeight;
      
      console.log('Camera initialized successfully');
    } catch (error) {
      console.error('Error initializing camera:', error);
      throw new Error('Failed to initialize camera');
    }
  }

  // Start scanning
  startScanning(): void {
    if (!this.videoElement || !this.canvasElement) {
      throw new Error('Camera not initialized. Call initializeCamera first.');
    }

    this.scanning = true;
    this.scanInterval = window.setInterval(() => {
      this.captureAndScan();
    }, 100); // Scan every 100ms
    
    console.log('Scanning started');
  }

  // Stop scanning
  stopScanning(): void {
    this.scanning = false;
    
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    
    console.log('Scanning stopped');
  }

  // Capture frame and attempt to scan
  private async captureAndScan(): Promise<void> {
    if (!this.scanning || !this.videoElement || !this.canvasElement) {
      return;
    }

    // Check scan delay
    const now = Date.now();
    if (now - this.lastScanTime < this.options.scanDelay!) {
      return;
    }

    try {
      const ctx = this.canvasElement.getContext('2d');
      if (!ctx) return;

      // Capture current frame
      ctx.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
      
      const _imageData = ctx.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
      
      // Attempt to detect barcode/QR code
      const result = this.detectBarcode(_imageData);
      
      if (result) {
        this.lastScanTime = now;
        this.handleScanResult(result);
      }
    } catch (error) {
      console.error('Error capturing frame:', error);
    }
  }

  // Simple barcode detection (placeholder - would need actual library integration)
  private detectBarcode(_imageData: ImageData): ScanResult | null {
    // This is a placeholder implementation
    // In production, you would use a library like:
    // - html5-qrcode
    // - react-qr-reader
    // - zxing-js/library
    
    // For now, return null to indicate no barcode detected
    // The actual implementation would use computer vision algorithms
    // to detect and decode QR codes and barcodes from the image data
    
    return null;
  }

  // Handle successful scan
  private handleScanResult(result: ScanResult): void {
    // Play sound if enabled
    if (this.options.playSoundOnScan) {
      this.playBeep();
    }
    
    // Vibrate if enabled
    if (this.options.vibrateOnScan && 'vibrate' in navigator) {
      navigator.vibrate(200);
    }
    
    // Notify listeners
    this.notifyListeners(result);
  }

  // Play beep sound
  private playBeep(): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.error('Error playing beep:', error);
    }
  }

  // Add listener for scan results
  addListener(eventType: string, callback: (result: ScanResult) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  // Remove listener
  removeListener(eventType: string, callback: (result: ScanResult) => void): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify all listeners
  private notifyListeners(result: ScanResult): void {
    const callbacks = this.listeners.get('scan');
    if (callbacks) {
      callbacks.forEach(callback => callback(result));
    }
  }

  // Cleanup resources
  cleanup(): void {
    this.stopScanning();
    
    if (this.videoElement && this.videoElement.srcObject) {
      const stream = this.videoElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      this.videoElement.srcObject = null;
    }
    
    this.videoElement = null;
    this.canvasElement = null;
    this.listeners.clear();
    
    console.log('Scan service cleaned up');
  }

  // Parse scan result to determine type
  parseScanResult(data: string): {
    type: 'seed' | 'product' | 'url' | 'text' | 'unknown';
    content: string;
    metadata?: any;
  } {
    // Check if it's a URL
    if (data.startsWith('http://') || data.startsWith('https://')) {
      return { type: 'url', content: data };
    }
    
    // Check if it matches seed format (example: SEED:12345)
    if (data.startsWith('SEED:')) {
      return { 
        type: 'seed', 
        content: data.substring(5),
        metadata: { format: 'internal' }
      };
    }
    
    // Check if it matches product format (example: PROD:67890)
    if (data.startsWith('PROD:')) {
      return { 
        type: 'product', 
        content: data.substring(5),
        metadata: { format: 'internal' }
      };
    }
    
    // Check if it's a numeric barcode
    if (/^\d+$/.test(data)) {
      return { 
        type: 'product', 
        content: data,
        metadata: { format: 'barcode' }
      };
    }
    
    // Default to text
    return { type: 'text', content: data };
  }

  // Generate QR code (for sharing)
  async generateQRCode(_data: string, _options?: {
    width?: number;
    height?: number;
    color?: string;
    backgroundColor?: string;
  }): Promise<string> {
    // This is a placeholder - would need a library like qrcode.react or similar
    // For now, return a placeholder URL
    console.log('QR code generation requested');
    return `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0id2hpdGUiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNCIgZmlsbD0iYmxhY2siPk5vdCBJbXBsZW1lbnRlZDwvdGV4dD48L3N2Zz4=`;
  }
}

// Export singleton instance
export const scanService = new ScanService();

// Helper function to scan from image file
export async function scanFromImage(file: File): Promise<ScanResult | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        const _imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // This would use actual barcode detection library
        // For now, return null
        resolve(null);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
