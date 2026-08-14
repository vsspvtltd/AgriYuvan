import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export type UserRole = 'farmer' | 'vendor' | 'trader';

export interface LandPlot {
  id: string;
  area: string;
  location: string;
  soilType: string;
  crop: string;
}

export interface CropInfo {
  id: string;
  cropName: string;
  area: string;
  season: string;
  sowingDate: string;
}

export interface Requirement {
  id: string;
  description: string;
}

export interface FarmerProfile {
  name: string;
  phone: string;
  totalAcres: string;
  landPlots: LandPlot[];
  crops: CropInfo[];
}

export interface VendorProfile {
  name: string;
  phone: string;
  requirements: Requirement[];
}

export interface TraderProfile {
  name: string;
  phone: string;
  tradingRequirements: string;
  cropsOfInterest: string;
  marketLocation: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  role: UserRole;
  language: string;
  farmerProfile?: FarmerProfile;
  vendorProfile?: VendorProfile;
  traderProfile?: TraderProfile;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = 'userProfiles';

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        userId: data.userId,
        email: data.email,
        role: data.role,
        language: data.language,
        farmerProfile: data.farmerProfile,
        vendorProfile: data.vendorProfile,
        traderProfile: data.traderProfile,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, profile.userId);
    await setDoc(docRef, {
      ...profile,
      createdAt: profile.createdAt,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
}

export async function saveFarmerProfile(userId: string, email: string, farmerData: FarmerProfile, language: string): Promise<void> {
  const existingProfile = await getUserProfile(userId);
  const profile: UserProfile = {
    userId,
    email,
    role: 'farmer',
    language,
    farmerProfile: farmerData,
    createdAt: existingProfile?.createdAt || new Date(),
    updatedAt: new Date(),
  };
  
  if (existingProfile) {
    await updateUserProfile(userId, profile);
  } else {
    await createUserProfile(profile);
  }
}

export async function saveVendorProfile(userId: string, email: string, vendorData: VendorProfile, language: string): Promise<void> {
  const existingProfile = await getUserProfile(userId);
  const profile: UserProfile = {
    userId,
    email,
    role: 'vendor',
    language,
    vendorProfile: vendorData,
    createdAt: existingProfile?.createdAt || new Date(),
    updatedAt: new Date(),
  };
  
  if (existingProfile) {
    await updateUserProfile(userId, profile);
  } else {
    await createUserProfile(profile);
  }
}

export async function saveTraderProfile(userId: string, email: string, traderData: TraderProfile, language: string): Promise<void> {
  const existingProfile = await getUserProfile(userId);
  const profile: UserProfile = {
    userId,
    email,
    role: 'trader',
    language,
    traderProfile: traderData,
    createdAt: existingProfile?.createdAt || new Date(),
    updatedAt: new Date(),
  };
  
  if (existingProfile) {
    await updateUserProfile(userId, profile);
  } else {
    await createUserProfile(profile);
  }
}
