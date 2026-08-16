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
  Timestamp 
} from 'firebase/firestore';
import { getFirestoreDB } from './firebase';

// Types
export interface Tester {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  location: string;
  state: string;
  district?: string;
  specialization: string[];
  services: string[];
  availability: boolean;
  rating?: number;
  totalReviews?: number;
  experience?: string;
  certifications?: string[];
  geoLocation?: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface TesterRequest {
  id?: string;
  userId: string;
  testerId: string;
  landPlotId?: string;
  testType: string;
  requestedDate: Timestamp;
  scheduledDate?: Timestamp;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  result?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const TESTERS_COLLECTION = 'testers';
const TESTER_REQUESTS_COLLECTION = 'testerRequests';

const db = getFirestoreDB();

// Tester CRUD Operations

export async function createTester(tester: Omit<Tester, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const testerData = {
      ...tester,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, TESTERS_COLLECTION), testerData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating tester:', error);
    throw new Error('Failed to create tester');
  }
}

export async function getTester(testerId: string): Promise<Tester | null> {
  try {
    const docRef = doc(db, TESTERS_COLLECTION, testerId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Tester;
    }
    return null;
  } catch (error) {
    console.error('Error fetching tester:', error);
    throw new Error('Failed to fetch tester');
  }
}

export async function updateTester(testerId: string, updates: Partial<Tester>): Promise<void> {
  try {
    const docRef = doc(db, TESTERS_COLLECTION, testerId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating tester:', error);
    throw new Error('Failed to update tester');
  }
}

export async function deleteTester(testerId: string): Promise<void> {
  try {
    const docRef = doc(db, TESTERS_COLLECTION, testerId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting tester:', error);
    throw new Error('Failed to delete tester');
  }
}

// Query Operations

export async function getAllTesters(limitCount: number = 50): Promise<Tester[]> {
  try {
    const q = query(
      collection(db, TESTERS_COLLECTION),
      where('isActive', '==', true),
      orderBy('name'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tester));
  } catch (error) {
    console.error('Error fetching testers:', error);
    throw new Error('Failed to fetch testers');
  }
}

export async function getTestersByState(state: string): Promise<Tester[]> {
  try {
    const q = query(
      collection(db, TESTERS_COLLECTION),
      where('state', '==', state),
      where('isActive', '==', true),
      where('availability', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tester));
  } catch (error) {
    console.error('Error fetching testers by state:', error);
    throw new Error('Failed to fetch testers by state');
  }
}

export async function getTestersBySpecialization(specialization: string, state?: string): Promise<Tester[]> {
  try {
    const constraints: any[] = [
      where('isActive', '==', true),
      where('specialization', 'array-contains', specialization),
    ];
    
    if (state) {
      constraints.push(where('state', '==', state));
    }
    
    const q = query(collection(db, TESTERS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tester));
  } catch (error) {
    console.error('Error fetching testers by specialization:', error);
    throw new Error('Failed to fetch testers by specialization');
  }
}

export async function getAvailableTesters(state?: string): Promise<Tester[]> {
  try {
    const constraints: any[] = [
      where('isActive', '==', true),
      where('availability', '==', true),
    ];
    
    if (state) {
      constraints.push(where('state', '==', state));
    }
    
    const q = query(collection(db, TESTERS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tester));
  } catch (error) {
    console.error('Error fetching available testers:', error);
    throw new Error('Failed to fetch available testers');
  }
}

// Tester Request Operations

export async function createTesterRequest(request: Omit<TesterRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const requestData = {
      ...request,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, TESTER_REQUESTS_COLLECTION), requestData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating tester request:', error);
    throw new Error('Failed to create tester request');
  }
}

export async function getTesterRequest(requestId: string): Promise<TesterRequest | null> {
  try {
    const docRef = doc(db, TESTER_REQUESTS_COLLECTION, requestId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as TesterRequest;
    }
    return null;
  } catch (error) {
    console.error('Error fetching tester request:', error);
    throw new Error('Failed to fetch tester request');
  }
}

export async function updateTesterRequest(requestId: string, updates: Partial<TesterRequest>): Promise<void> {
  try {
    const docRef = doc(db, TESTER_REQUESTS_COLLECTION, requestId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating tester request:', error);
    throw new Error('Failed to update tester request');
  }
}

export async function getUserTesterRequests(userId: string): Promise<TesterRequest[]> {
  try {
    const q = query(
      collection(db, TESTER_REQUESTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('requestedDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TesterRequest));
  } catch (error) {
    console.error('Error fetching user tester requests:', error);
    throw new Error('Failed to fetch user tester requests');
  }
}

export async function getTesterRequestsByStatus(status: string): Promise<TesterRequest[]> {
  try {
    const q = query(
      collection(db, TESTER_REQUESTS_COLLECTION),
      where('status', '==', status),
      orderBy('requestedDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TesterRequest));
  } catch (error) {
    console.error('Error fetching tester requests by status:', error);
    throw new Error('Failed to fetch tester requests by status');
  }
}

// Nearby Testers (using geolocation)

export async function getNearbyTesters(
  userLatitude: number,
  userLongitude: number,
  radiusKm: number = 50,
  state?: string
): Promise<Tester[]> {
  try {
    const constraints: any[] = [
      where('isActive', '==', true),
      where('availability', '==', true),
    ];
    
    if (state) {
      constraints.push(where('state', '==', state));
    }
    
    const q = query(collection(db, TESTERS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const testers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tester));
    
    // Filter by distance using Haversine formula
    const testersWithDistance = testers
      .map(tester => {
        if (!tester.geoLocation) {
          return { tester, distance: Infinity };
        }
        
        const distance = calculateDistance(
          userLatitude,
          userLongitude,
          tester.geoLocation.latitude,
          tester.geoLocation.longitude
        );
        
        return { tester, distance };
      })
      .filter(item => item.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
    
    return testersWithDistance.map(item => item.tester);
  } catch (error) {
    console.error('Error getting nearby testers:', error);
    throw new Error('Failed to get nearby testers');
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
