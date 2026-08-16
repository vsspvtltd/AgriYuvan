import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { getFirestoreDB } from './firebase';

// Types
export interface UserHistory {
  id?: string;
  userId: string;
  activityType: 'crop_selection' | 'seed_selection' | 'tester_request' | 'scan' | 'order' | 'profile_update' | 'device_connection' | 'subscription' | 'land_added' | 'crop_added' | 'recommendation_generated';
  description: string;
  entityId?: string;
  entityType?: string;
  metadata?: {
    [key: string]: any;
  };
  timestamp: Timestamp;
}

const USER_HISTORY_COLLECTION = 'userHistory';

const db = getFirestoreDB();

// History Operations

export async function addHistoryEntry(history: Omit<UserHistory, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, USER_HISTORY_COLLECTION), history);
    return docRef.id;
  } catch (error) {
    console.error('Error adding history entry:', error);
    throw new Error('Failed to add history entry');
  }
}

export async function getUserHistory(userId: string, limitCount: number = 50): Promise<UserHistory[]> {
  try {
    const q = query(
      collection(db, USER_HISTORY_COLLECTION),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserHistory));
  } catch (error) {
    console.error('Error fetching user history:', error);
    throw new Error('Failed to fetch user history');
  }
}

export async function getUserHistoryByType(
  userId: string, 
  activityType: UserHistory['activityType'],
  limitCount: number = 20
): Promise<UserHistory[]> {
  try {
    const q = query(
      collection(db, USER_HISTORY_COLLECTION),
      where('userId', '==', userId),
      where('activityType', '==', activityType),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserHistory));
  } catch (error) {
    console.error('Error fetching user history by type:', error);
    throw new Error('Failed to fetch user history by type');
  }
}

export async function getHistoryByEntity(userId: string, entityId: string): Promise<UserHistory[]> {
  try {
    const q = query(
      collection(db, USER_HISTORY_COLLECTION),
      where('userId', '==', userId),
      where('entityId', '==', entityId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserHistory));
  } catch (error) {
    console.error('Error fetching history by entity:', error);
    throw new Error('Failed to fetch history by entity');
  }
}

// Helper function to create history entries for common activities

export async function logCropSelection(
  userId: string,
  cropName: string,
  landPlotId: string,
  metadata?: any
): Promise<string> {
  return addHistoryEntry({
    userId,
    activityType: 'crop_selection',
    description: `Selected crop: ${cropName}`,
    entityId: landPlotId,
    entityType: 'landPlot',
    metadata: { cropName, ...metadata },
    timestamp: Timestamp.now(),
  });
}

export async function logSeedSelection(
  userId: string,
  seedName: string,
  seedId: string,
  metadata?: any
): Promise<string> {
  return addHistoryEntry({
    userId,
    activityType: 'seed_selection',
    description: `Selected seed: ${seedName}`,
    entityId: seedId,
    entityType: 'seed',
    metadata: { seedName, ...metadata },
    timestamp: Timestamp.now(),
  });
}

export async function logTesterRequest(
  userId: string,
  testerName: string,
  testType: string,
  requestId: string
): Promise<string> {
  return addHistoryEntry({
    userId,
    activityType: 'tester_request',
    description: `Requested ${testType} test from ${testerName}`,
    entityId: requestId,
    entityType: 'testerRequest',
    metadata: { testerName, testType },
    timestamp: Timestamp.now(),
  });
}

export async function logScan(
  userId: string,
  scanType: 'qr' | 'barcode',
  result: string,
  metadata?: any
): Promise<string> {
  return addHistoryEntry({
    userId,
    activityType: 'scan',
    description: `Scanned ${scanType}: ${result.substring(0, 50)}...`,
    metadata: { scanType, result, ...metadata },
    timestamp: Timestamp.now(),
  });
}

export async function logProfileUpdate(
  userId: string,
  updateType: string,
  metadata?: any
): Promise<string> {
  return addHistoryEntry({
    userId,
    activityType: 'profile_update',
    description: `Updated profile: ${updateType}`,
    metadata: { updateType, ...metadata },
    timestamp: Timestamp.now(),
  });
}

export async function logDeviceConnection(
  userId: string,
  deviceName: string,
  deviceId: string,
  status: 'connected' | 'disconnected'
): Promise<string> {
  return addHistoryEntry({
    userId,
    activityType: 'device_connection',
    description: `${status === 'connected' ? 'Connected to' : 'Disconnected from'} device: ${deviceName}`,
    entityId: deviceId,
    entityType: 'device',
    metadata: { deviceName, status },
    timestamp: Timestamp.now(),
  });
}

export async function logLandAdded(
  userId: string,
  landLocation: string,
  landId: string
): Promise<string> {
  return addHistoryEntry({
    userId,
    activityType: 'land_added',
    description: `Added land plot at ${landLocation}`,
    entityId: landId,
    entityType: 'landPlot',
    metadata: { location: landLocation },
    timestamp: Timestamp.now(),
  });
}

export async function logCropAdded(
  userId: string,
  cropName: string,
  cropId: string
): Promise<string> {
  return addHistoryEntry({
    userId,
    activityType: 'crop_added',
    description: `Added crop: ${cropName}`,
    entityId: cropId,
    entityType: 'farmerCrop',
    metadata: { cropName },
    timestamp: Timestamp.now(),
  });
}

export async function logRecommendationGenerated(
  userId: string,
  cropName: string,
  recommendationId: string
): Promise<string> {
  return addHistoryEntry({
    userId,
    activityType: 'recommendation_generated',
    description: `Generated crop recommendations for ${cropName}`,
    entityId: recommendationId,
    entityType: 'cropRecommendation',
    metadata: { cropName },
    timestamp: Timestamp.now(),
  });
}

export async function logSubscription(
  userId: string,
  plan: string,
  action: 'subscribed' | 'upgraded' | 'cancelled'
): Promise<string> {
  return addHistoryEntry({
    userId,
    activityType: 'subscription',
    description: `${action.charAt(0).toUpperCase() + action.slice(1)} to ${plan} plan`,
    metadata: { plan, action },
    timestamp: Timestamp.now(),
  });
}
