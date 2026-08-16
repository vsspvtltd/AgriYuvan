import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  Timestamp 
} from 'firebase/firestore';
import { getFirestoreDB } from './firebase';

// Types
export interface ProgressStage {
  id: number;
  name: string;
  completed: boolean;
  completedAt?: Timestamp;
}

export interface UserProgress {
  userId: string;
  currentStage: number;
  stages: ProgressStage[];
  lastUpdated: Timestamp;
}

const USER_PROGRESS_COLLECTION = 'userProgress';

const db = getFirestoreDB();

// Stage definitions
export const PROGRESS_STAGES: Omit<ProgressStage, 'completed' | 'completedAt'>[] = [
  { id: 1, name: 'Account created' },
  { id: 2, name: 'Profile completed' },
  { id: 3, name: 'Land added' },
  { id: 4, name: 'Crop selected' },
  { id: 5, name: 'Crop recommendation generated' },
  { id: 6, name: 'Seed selected' },
  { id: 7, name: 'Testing requested/completed' },
  { id: 8, name: 'Recommendation received' },
  { id: 9, name: 'Purchase/shop' },
  { id: 10, name: 'Completed cycle' },
];

// Progress Operations

export async function initializeUserProgress(userId: string): Promise<void> {
  try {
    const progressRef = doc(db, USER_PROGRESS_COLLECTION, userId);
    const initialProgress: UserProgress = {
      userId,
      currentStage: 1,
      stages: PROGRESS_STAGES.map(stage => ({
        ...stage,
        completed: stage.id === 1, // Account created is completed by default
        completedAt: stage.id === 1 ? Timestamp.now() : undefined,
      })),
      lastUpdated: Timestamp.now(),
    };
    
    await setDoc(progressRef, initialProgress);
  } catch (error) {
    console.error('Error initializing user progress:', error);
    throw new Error('Failed to initialize user progress');
  }
}

export async function getUserProgress(userId: string): Promise<UserProgress | null> {
  try {
    const progressRef = doc(db, USER_PROGRESS_COLLECTION, userId);
    const docSnap = await getDoc(progressRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProgress;
    }
    
    // Initialize if doesn't exist
    await initializeUserProgress(userId);
    return await getUserProgress(userId);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw new Error('Failed to fetch user progress');
  }
}

export async function updateProgressStage(
  userId: string,
  stageId: number,
  completed: boolean
): Promise<void> {
  try {
    const progressRef = doc(db, USER_PROGRESS_COLLECTION, userId);
    const progress = await getUserProgress(userId);
    
    if (!progress) {
      await initializeUserProgress(userId);
      return updateProgressStage(userId, stageId, completed);
    }
    
    const updatedStages = progress.stages.map(stage => {
      if (stage.id === stageId) {
        return {
          ...stage,
          completed,
          completedAt: completed ? Timestamp.now() : undefined,
        };
      }
      return stage;
    });
    
    // Calculate new current stage
    let newCurrentStage = progress.currentStage;
    if (completed && stageId === progress.currentStage) {
      // Move to next stage if current stage is completed
      const nextStage = updatedStages.find(s => s.id > stageId && !s.completed);
      if (nextStage) {
        newCurrentStage = nextStage.id;
      } else {
        newCurrentStage = stageId + 1;
      }
    }
    
    await updateDoc(progressRef, {
      stages: updatedStages,
      currentStage: newCurrentStage,
      lastUpdated: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating progress stage:', error);
    throw new Error('Failed to update progress stage');
  }
}

export async function completeStage(userId: string, stageId: number): Promise<void> {
  return updateProgressStage(userId, stageId, true);
}

export async function getProgressPercentage(userId: string): Promise<number> {
  try {
    const progress = await getUserProgress(userId);
    if (!progress) return 0;
    
    const completedStages = progress.stages.filter(s => s.completed).length;
    const totalStages = progress.stages.length;
    
    return Math.round((completedStages / totalStages) * 100);
  } catch (error) {
    console.error('Error calculating progress percentage:', error);
    return 0;
  }
}

// Helper functions to update specific stages

export async function markProfileCompleted(userId: string): Promise<void> {
  return completeStage(userId, 2);
}

export async function markLandAdded(userId: string): Promise<void> {
  return completeStage(userId, 3);
}

export async function markCropSelected(userId: string): Promise<void> {
  return completeStage(userId, 4);
}

export async function markRecommendationGenerated(userId: string): Promise<void> {
  return completeStage(userId, 5);
}

export async function markSeedSelected(userId: string): Promise<void> {
  return completeStage(userId, 6);
}

export async function markTestingCompleted(userId: string): Promise<void> {
  return completeStage(userId, 7);
}

export async function markRecommendationReceived(userId: string): Promise<void> {
  return completeStage(userId, 8);
}

export async function markPurchaseCompleted(userId: string): Promise<void> {
  return completeStage(userId, 9);
}

export async function markCycleCompleted(userId: string): Promise<void> {
  return completeStage(userId, 10);
}

// Reset progress for a new cycle
export async function resetProgressForNewCycle(userId: string): Promise<void> {
  try {
    const progressRef = doc(db, USER_PROGRESS_COLLECTION, userId);
    const progress = await getUserProgress(userId);
    
    if (!progress) {
      await initializeUserProgress(userId);
      return;
    }
    
    // Keep stages 1-2 completed, reset others
    const resetStages = progress.stages.map(stage => {
      if (stage.id <= 2) {
        return stage; // Keep account and profile completed
      }
      return {
        ...stage,
        completed: false,
        completedAt: undefined,
      };
    });
    
    await updateDoc(progressRef, {
      stages: resetStages,
      currentStage: 3,
      lastUpdated: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error resetting progress:', error);
    throw new Error('Failed to reset progress');
  }
}
