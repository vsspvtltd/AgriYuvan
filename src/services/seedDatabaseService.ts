import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  QueryConstraint,
  Timestamp 
} from 'firebase/firestore';
import { getFirestoreDB } from './firebase';

// Types
export interface Seed {
  id?: string;
  name: string;
  variety: string;
  crop: string;
  description: string;
  imageUrl?: string;
  price: number;
  packSize: string;
  unit: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  location: string;
  state: string;
  district?: string;
  geoLocation?: {
    latitude: number;
    longitude: number;
  };
  availability: boolean;
  stockQuantity?: number;
  suitableSeasons: string[];
  suitableSoils: string[];
  characteristics: string[];
  diseaseResistance?: string[];
  maturityDuration: string;
  yieldPotential: string;
  source: string;
  rating?: number;
  totalReviews?: number;
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface SeedFilter {
  crop?: string;
  state?: string;
  district?: string;
  availability?: boolean;
  minPrice?: number;
  maxPrice?: number;
  season?: string;
  soilType?: string;
}

export interface SeedSeller {
  id: string;
  name: string;
  phone: string;
  email?: string;
  location: string;
  state: string;
  district?: string;
  address?: string;
  geoLocation?: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  totalReviews?: number;
  isActive: boolean;
}

const SEEDS_COLLECTION = 'seeds';
const VENDORS_COLLECTION = 'vendors';

const db = getFirestoreDB();

// CRUD Operations

export async function createSeed(seed: Omit<Seed, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const seedData = {
      ...seed,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, SEEDS_COLLECTION), seedData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating seed:', error);
    throw new Error('Failed to create seed');
  }
}

export async function getSeed(seedId: string): Promise<Seed | null> {
  try {
    const docRef = doc(db, SEEDS_COLLECTION, seedId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Seed;
    }
    return null;
  } catch (error) {
    console.error('Error fetching seed:', error);
    throw new Error('Failed to fetch seed');
  }
}

export async function updateSeed(seedId: string, updates: Partial<Seed>): Promise<void> {
  try {
    const docRef = doc(db, SEEDS_COLLECTION, seedId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating seed:', error);
    throw new Error('Failed to update seed');
  }
}

export async function deleteSeed(seedId: string): Promise<void> {
  try {
    const docRef = doc(db, SEEDS_COLLECTION, seedId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting seed:', error);
    throw new Error('Failed to delete seed');
  }
}

// Query Operations

export async function getAllSeeds(limitCount: number = 50): Promise<Seed[]> {
  try {
    const q = query(
      collection(db, SEEDS_COLLECTION),
      where('isActive', '==', true),
      orderBy('name'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Seed));
  } catch (error) {
    console.error('Error fetching seeds:', error);
    throw new Error('Failed to fetch seeds');
  }
}

export async function getSeedsByCrop(crop: string): Promise<Seed[]> {
  try {
    const q = query(
      collection(db, SEEDS_COLLECTION),
      where('crop', '==', crop),
      where('isActive', '==', true),
      where('availability', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Seed));
  } catch (error) {
    console.error('Error fetching seeds by crop:', error);
    throw new Error('Failed to fetch seeds by crop');
  }
}

export async function getSeedsByState(state: string): Promise<Seed[]> {
  try {
    const q = query(
      collection(db, SEEDS_COLLECTION),
      where('state', '==', state),
      where('isActive', '==', true),
      where('availability', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Seed));
  } catch (error) {
    console.error('Error fetching seeds by state:', error);
    throw new Error('Failed to fetch seeds by state');
  }
}

export async function filterSeeds(filters: SeedFilter): Promise<Seed[]> {
  try {
    const constraints: QueryConstraint[] = [];
    
    if (filters.crop) {
      constraints.push(where('crop', '==', filters.crop));
    }
    if (filters.state) {
      constraints.push(where('state', '==', filters.state));
    }
    if (filters.district) {
      constraints.push(where('district', '==', filters.district));
    }
    if (filters.availability !== undefined) {
      constraints.push(where('availability', '==', filters.availability));
    }
    constraints.push(where('isActive', '==', true));
    
    const q = query(collection(db, SEEDS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    
    let seeds = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Seed));
    
    // Client-side filtering for price range
    if (filters.minPrice !== undefined) {
      seeds = seeds.filter(seed => seed.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      seeds = seeds.filter(seed => seed.price <= filters.maxPrice!);
    }
    
    // Filter by season compatibility
    if (filters.season) {
      seeds = seeds.filter(seed => seed.suitableSeasons.includes(filters.season!));
    }
    
    // Filter by soil compatibility
    if (filters.soilType) {
      seeds = seeds.filter(seed => 
        seed.suitableSoils.some(soil => 
          soil.toLowerCase().includes(filters.soilType!.toLowerCase())
        )
      );
    }
    
    return seeds;
  } catch (error) {
    console.error('Error filtering seeds:', error);
    throw new Error('Failed to filter seeds');
  }
}

// Recommendation System

export async function getRecommendedSeeds(
  crop: string, 
  state: string, 
  season?: string,
  soilType?: string
): Promise<Seed[]> {
  try {
    const constraints: QueryConstraint[] = [
      where('crop', '==', crop),
      where('state', '==', state),
      where('isActive', '==', true),
      where('availability', '==', true),
    ];
    
    const q = query(collection(db, SEEDS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    
    let seeds = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Seed));
    
    // Score seeds based on compatibility
    const scoredSeeds = seeds.map(seed => {
      let score = 0;
      
      // Season match
      if (season && seed.suitableSeasons.includes(season)) {
        score += 30;
      }
      
      // Soil match
      if (soilType && seed.suitableSoils.some(soil => 
        soil.toLowerCase().includes(soilType.toLowerCase())
      )) {
        score += 25;
      }
      
      // Availability and stock
      if (seed.stockQuantity && seed.stockQuantity > 0) {
        score += 15;
      }
      
      // Rating
      if (seed.rating) {
        score += seed.rating * 2;
      }
      
      // Price consideration (lower price gets slight advantage)
      if (seed.price < 1000) {
        score += 10;
      }
      
      return { seed, score };
    });
    
    // Sort by score and return top recommendations
    scoredSeeds.sort((a, b) => b.score - a.score);
    
    return scoredSeeds.slice(0, 10).map(item => item.seed);
  } catch (error) {
    console.error('Error getting recommended seeds:', error);
    throw new Error('Failed to get recommended seeds');
  }
}

// Nearby Sellers

export async function getNearbySeedSellers(
  userLatitude: number,
  userLongitude: number,
  radiusKm: number = 50,
  state?: string
): Promise<SeedSeller[]> {
  try {
    const constraints: QueryConstraint[] = [
      where('isActive', '==', true),
    ];
    
    if (state) {
      constraints.push(where('state', '==', state));
    }
    
    const q = query(collection(db, VENDORS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const sellers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SeedSeller));
    
    // Filter by distance using Haversine formula
    const sellersWithDistance = sellers
      .map(seller => {
        if (!seller.geoLocation) {
          return { seller, distance: Infinity };
        }
        
        const distance = calculateDistance(
          userLatitude,
          userLongitude,
          seller.geoLocation.latitude,
          seller.geoLocation.longitude
        );
        
        return { seller, distance };
      })
      .filter(item => item.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
    
    return sellersWithDistance.map(item => item.seller);
  } catch (error) {
    console.error('Error getting nearby seed sellers:', error);
    throw new Error('Failed to get nearby seed sellers');
  }
}

export async function getSeedsBySeller(sellerId: string): Promise<Seed[]> {
  try {
    const q = query(
      collection(db, SEEDS_COLLECTION),
      where('sellerId', '==', sellerId),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Seed));
  } catch (error) {
    console.error('Error fetching seeds by seller:', error);
    throw new Error('Failed to fetch seeds by seller');
  }
}

// Price Comparison

export async function compareSeedsByPrice(crop: string, state: string): Promise<Seed[]> {
  try {
    const q = query(
      collection(db, SEEDS_COLLECTION),
      where('crop', '==', crop),
      where('state', '==', state),
      where('isActive', '==', true),
      where('availability', '==', true),
      orderBy('price')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Seed));
  } catch (error) {
    console.error('Error comparing seeds by price:', error);
    throw new Error('Failed to compare seeds by price');
  }
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Vendor Operations

export async function createVendor(vendor: Omit<SeedSeller, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, VENDORS_COLLECTION), vendor);
    return docRef.id;
  } catch (error) {
    console.error('Error creating vendor:', error);
    throw new Error('Failed to create vendor');
  }
}

export async function getVendor(vendorId: string): Promise<SeedSeller | null> {
  try {
    const docRef = doc(db, VENDORS_COLLECTION, vendorId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as SeedSeller;
    }
    return null;
  } catch (error) {
    console.error('Error fetching vendor:', error);
    throw new Error('Failed to fetch vendor');
  }
}

export async function getAllVendors(state?: string): Promise<SeedSeller[]> {
  try {
    const constraints: QueryConstraint[] = [
      where('isActive', '==', true),
    ];
    
    if (state) {
      constraints.push(where('state', '==', state));
    }
    
    const q = query(collection(db, VENDORS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SeedSeller));
  } catch (error) {
    console.error('Error fetching vendors:', error);
    throw new Error('Failed to fetch vendors');
  }
}
