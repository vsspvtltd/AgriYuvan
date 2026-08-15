# Firestore Database Schema for AgriYuvan

## Collection Structure

### 1. users (Root Collection)
Document ID: `userId` (from Firebase Auth)

```typescript
{
  userId: string,
  email: string,
  role: 'farmer' | 'vendor' | 'trader' | 'admin',
  language: string,
  phone?: string,
  displayName?: string,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  isActive: boolean
}
```

### 2. farmers (Subcollection of users)
Document ID: Auto-generated

```typescript
{
  userId: string, // Reference to users collection
  name: string,
  phone: string,
  totalAcres: number,
  state: string,
  district?: string,
  village?: string,
  pincode?: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 3. landPlots (Subcollection of farmers)
Document ID: Auto-generated

```typescript
{
  farmerId: string, // Reference to farmers document
  area: number, // in acres
  location: string, // Village/District/State
  state: string,
  district?: string,
  soilType: string,
  phLevel?: number,
  irrigationAvailable: boolean,
  waterSource?: string,
  currentCrop?: string,
  geoLocation?: {
    latitude: number,
    longitude: number
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 4. farmerCrops (Subcollection of farmers)
Document ID: Auto-generated

```typescript
{
  farmerId: string,
  landPlotId: string, // Reference to landPlots
  cropName: string,
  variety?: string,
  area: number, // acres allocated to this crop
  season: 'Kharif' | 'Rabi' | 'Summer' | 'Zaid' | 'All Year',
  sowingDate?: Timestamp,
  expectedHarvestDate?: Timestamp,
  status: 'planned' | 'sown' | 'growing' | 'harvested',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 5. cropRecommendations (Subcollection of farmers)
Document ID: Auto-generated

```typescript
{
  farmerId: string,
  landPlotId: string,
  season: string,
  parameters: {
    state: string,
    district?: string,
    soilType?: string,
    waterAvailability: string,
    irrigationAvailable: boolean,
    landSize: number
  },
  recommendations: [
    {
      crop: string,
      suitability: 'High' | 'Medium' | 'Low',
      score: number,
      reasons: string[],
      growingSeason: string,
      soilRequirements: string,
      waterRequirement: string,
      suitableConditions: string,
      cropDuration: string,
      risks: string[],
      rotationConsiderations: string
    }
  ],
  generatedAt: Timestamp,
  selectedCrop?: string
}
```

### 6. vendors (Root Collection)
Document ID: Auto-generated

```typescript
{
  userId: string, // Reference to users collection
  name: string,
  phone: string,
  email?: string,
  location: string,
  state: string,
  district?: string,
  address?: string,
  pincode?: string,
  geoLocation?: {
    latitude: number,
    longitude: number
  },
  products: string[], // Array of product categories
  services: string[],
  requirements: string[],
  availability: string,
  rating?: number,
  totalReviews?: number,
  isActive: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 7. traders (Root Collection)
Document ID: Auto-generated

```typescript
{
  userId: string,
  name: string,
  phone: string,
  email?: string,
  location: string,
  state: string,
  district?: string,
  marketLocation: string,
  cropsOfInterest: string[],
  tradingRequirements: string,
  buyingRequirements: {
    crop: string,
    quantity: number,
    unit: string,
    priceRange?: {
      min: number,
      max: number
    }
  }[],
  rating?: number,
  isActive: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 8. seeds (Root Collection)
Document ID: Auto-generated

```typescript
{
  name: string,
  variety: string,
  crop: string,
  description: string,
  imageUrl?: string,
  price: number,
  packSize: string,
  unit: string,
  sellerId: string, // Reference to vendors collection
  sellerName: string,
  sellerPhone: string,
  location: string,
  state: string,
  district?: string,
  geoLocation?: {
    latitude: number,
    longitude: number
  },
  availability: boolean,
  stockQuantity?: number,
  suitableSeasons: string[],
  suitableSoils: string[],
  characteristics: string[],
  diseaseResistance?: string[],
  maturityDuration: string,
  yieldPotential: string,
  source: string,
  rating?: number,
  totalReviews?: number,
  isActive: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 9. seedOrders (Subcollection of users)
Document ID: Auto-generated

```typescript
{
  userId: string,
  seedId: string,
  sellerId: string,
  quantity: number,
  totalPrice: number,
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled',
  orderDate: Timestamp,
  deliveryDate?: Timestamp,
  shippingAddress: string,
  paymentStatus: 'pending' | 'paid' | 'refunded'
}
```

### 10. testers (Root Collection)
Document ID: Auto-generated

```typescript
{
  name: string,
  phone: string,
  email?: string,
  location: string,
  state: string,
  district?: string,
  specialization: string[], // e.g., ['soil', 'water', 'crop']
  services: string[],
  availability: boolean,
  rating?: number,
  totalReviews?: number,
  experience?: string,
  certifications?: string[],
  geoLocation?: {
    latitude: number,
    longitude: number
  },
  isActive: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 11. testerRequests (Subcollection of users)
Document ID: Auto-generated

```typescript
{
  userId: string,
  testerId: string,
  landPlotId?: string,
  testType: string,
  requestedDate: Timestamp,
  scheduledDate?: Timestamp,
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled',
  notes?: string,
  result?: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 12. userHistory (Subcollection of users)
Document ID: Auto-generated

```typescript
{
  userId: string,
  activityType: 'crop_selection' | 'seed_selection' | 'tester_request' | 'scan' | 'order' | 'profile_update' | 'device_connection' | 'subscription',
  description: string,
  entityId?: string, // Reference to related document
  entityType?: string,
  metadata?: {
    [key: string]: any
  },
  timestamp: Timestamp
}
```

### 13. userProgress (Subcollection of users)
Document ID: Single document per user

```typescript
{
  userId: string,
  currentStage: number,
  stages: [
    {
      id: number,
      name: string,
      completed: boolean,
      completedAt?: Timestamp
    }
  ],
  lastUpdated: Timestamp
}
```

Stage definitions:
1. Account created
2. Profile completed
3. Land added
4. Crop selected
5. Crop recommendation generated
6. Seed selected
7. Testing requested/completed
8. Recommendation received
9. Purchase/shop
10. Completed cycle

### 14. scanHistory (Subcollection of users)
Document ID: Auto-generated

```typescript
{
  userId: string,
  scanType: 'qr' | 'barcode',
  result: string,
  decodedData: string,
  timestamp: Timestamp,
  location?: {
    latitude: number,
    longitude: number
  }
}
```

### 15. devices (Subcollection of users)
Document ID: Auto-generated

```typescript
{
  userId: string,
  deviceId: string,
  deviceName: string,
  deviceType: string,
  connectionStatus: 'disconnected' | 'connecting' | 'connected',
  lastConnected?: Timestamp,
  metadata?: {
    [key: string]: any
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 16. sensorReadings (Subcollection of devices)
Document ID: Auto-generated

```typescript
{
  deviceId: string,
  readingType: string, // e.g., 'moisture', 'ph', 'temperature'
  value: number,
  unit: string,
  timestamp: Timestamp
}
```

### 17. weatherCache (Root Collection)
Document ID: `${state}_${district}` or location-based

```typescript
{
  location: string,
  state: string,
  district?: string,
  latitude?: number,
  longitude?: number,
  currentWeather: {
    temperature: number,
    condition: string,
    humidity: number,
    windSpeed?: number,
    rainfall?: number
  },
  forecast?: any[],
  alerts?: string[],
  lastUpdated: Timestamp,
  expiresAt: Timestamp // Cache for 1 hour
}
```

### 18. products (Root Collection)
Document ID: Auto-generated

```typescript
{
  name: string,
  category: 'seed' | 'fertilizer' | 'pesticide' | 'equipment' | 'other',
  description: string,
  imageUrl?: string,
  price: number,
  unit: string,
  sellerId: string,
  sellerName: string,
  location: string,
  state: string,
  availability: boolean,
  stockQuantity?: number,
  specifications?: {
    [key: string]: string
  },
  rating?: number,
  totalReviews?: number,
  isActive: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 19. subscriptions (Subcollection of users)
Document ID: Auto-generated

```typescript
{
  userId: string,
  plan: 'free' | 'premium' | 'enterprise',
  status: 'active' | 'inactive' | 'cancelled' | 'expired',
  startDate: Timestamp,
  endDate?: Timestamp,
  autoRenew: boolean,
  paymentId?: string,
  amount?: number,
  currency?: string,
  features: string[],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 20. subscriptionPlans (Root Collection)
Document ID: Plan name (free, premium, enterprise)

```typescript
{
  planId: string,
  name: string,
  price: number,
  currency: string,
  billingCycle: 'monthly' | 'yearly',
  features: string[],
  limits: {
    maxTests: number,
    maxScans: number,
    maxRecommendations: number,
    prioritySupport: boolean
  },
  isActive: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Indexes Required

### Composite Indexes

1. **seeds**
   - Fields: [state, availability, crop]
   - Order: [ASC, ASC, ASC]

2. **seeds**
   - Fields: [sellerId, isActive]
   - Order: [ASC, ASC]

3. **testers**
   - Fields: [state, isActive, availability]
   - Order: [ASC, ASC, ASC]

4. **userHistory**
   - Fields: [userId, timestamp]
   - Order: [ASC, DESC]

5. **weatherCache**
   - Fields: [state, lastUpdated]
   - Order: [ASC, DESC]

## Security Rules Summary

- Users can read/write their own data
- Vendors can read/write their own vendor profile and products
- Farmers can read all seeds, testers, vendors
- Admins can read/write all data
- Public read access for seeds, products (for browsing)
- Authenticated write access for orders, requests
