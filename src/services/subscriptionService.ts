import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { getFirestoreDB } from './firebase';

// Types
export interface SubscriptionPlan {
  planId: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    maxTests: number;
    maxScans: number;
    maxRecommendations: number;
    prioritySupport: boolean;
  };
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Subscription {
  id?: string;
  userId: string;
  plan: 'free' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  startDate: Timestamp;
  endDate?: Timestamp;
  autoRenew: boolean;
  paymentId?: string;
  amount?: number;
  currency?: string;
  features: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const SUBSCRIPTION_PLANS_COLLECTION = 'subscriptionPlans';
const SUBSCRIPTIONS_COLLECTION = 'subscriptions';

const db = getFirestoreDB();

// Subscription Plan Operations

export async function createSubscriptionPlan(plan: Omit<SubscriptionPlan, 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const planData = {
      ...plan,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, SUBSCRIPTION_PLANS_COLLECTION), planData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    throw new Error('Failed to create subscription plan');
  }
}

export async function getSubscriptionPlan(planId: string): Promise<SubscriptionPlan | null> {
  try {
    const docRef = doc(db, SUBSCRIPTION_PLANS_COLLECTION, planId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as SubscriptionPlan;
    }
    return null;
  } catch (error) {
    console.error('Error fetching subscription plan:', error);
    throw new Error('Failed to fetch subscription plan');
  }
}

export async function getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const q = query(
      collection(db, SUBSCRIPTION_PLANS_COLLECTION),
      where('isActive', '==', true),
      orderBy('price')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ ...doc.data() } as SubscriptionPlan));
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw new Error('Failed to fetch subscription plans');
  }
}

export async function updateSubscriptionPlan(planId: string, updates: Partial<SubscriptionPlan>): Promise<void> {
  try {
    const docRef = doc(db, SUBSCRIPTION_PLANS_COLLECTION, planId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    throw new Error('Failed to update subscription plan');
  }
}

// User Subscription Operations

export async function createSubscription(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const subscriptionData = {
      ...subscription,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, SUBSCRIPTIONS_COLLECTION), subscriptionData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw new Error('Failed to create subscription');
  }
}

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  try {
    const q = query(
      collection(db, SUBSCRIPTIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('startDate', 'desc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Subscription;
    }
    
    // Create free subscription if none exists
    const freeSubscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      plan: 'free',
      status: 'active',
      startDate: Timestamp.now(),
      autoRenew: false,
      features: ['Basic crop recommendations', 'Weather alerts', 'Community support'],
    };
    
    const subscriptionId = await createSubscription(freeSubscription);
    return await getUserSubscription(userId);
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    throw new Error('Failed to fetch user subscription');
  }
}

export async function updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<void> {
  try {
    const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw new Error('Failed to update subscription');
  }
}

export async function cancelSubscription(userId: string): Promise<void> {
  try {
    const subscription = await getUserSubscription(userId);
    if (!subscription || !subscription.id) {
      throw new Error('No active subscription found');
    }
    
    const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, subscription.id);
    await updateDoc(docRef, {
      status: 'cancelled',
      autoRenew: false,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
}

export async function upgradeSubscription(
  userId: string,
  newPlan: 'premium' | 'enterprise',
  paymentId?: string,
  amount?: number
): Promise<void> {
  try {
    const currentSubscription = await getUserSubscription(userId);
    
    if (!currentSubscription) {
      throw new Error('No existing subscription found');
    }
    
    // Get plan details
    const plan = await getSubscriptionPlan(newPlan);
    if (!plan) {
      throw new Error('Plan not found');
    }
    
    // Calculate end date based on billing cycle
    const startDate = Timestamp.now();
    const endDate = new Timestamp(
      startDate.seconds + (plan.billingCycle === 'yearly' ? 365 * 24 * 60 * 60 : 30 * 24 * 60 * 60),
      startDate.nanoseconds
    );
    
    await updateSubscription(currentSubscription.id!, {
      plan: newPlan,
      status: 'active',
      startDate,
      endDate,
      autoRenew: true,
      paymentId,
      amount,
      currency: plan.currency,
      features: plan.features,
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    throw new Error('Failed to upgrade subscription');
  }
}

export async function checkSubscriptionStatus(userId: string): Promise<{
  isActive: boolean;
  plan: string;
  features: string[];
  limits: any;
}> {
  try {
    const subscription = await getUserSubscription(userId);
    
    if (!subscription) {
      return {
        isActive: false,
        plan: 'free',
        features: [],
        limits: null,
      };
    }
    
    // Check if subscription is expired
    if (subscription.endDate && subscription.endDate.toDate() < new Date()) {
      // Mark as expired
      if (subscription.id) {
        await updateSubscription(subscription.id, { status: 'expired' });
      }
      return {
        isActive: false,
        plan: 'free',
        features: [],
        limits: null,
      };
    }
    
    // Get plan limits
    const plan = await getSubscriptionPlan(subscription.plan);
    const limits = plan?.limits || null;
    
    return {
      isActive: subscription.status === 'active',
      plan: subscription.plan,
      features: subscription.features,
      limits,
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return {
      isActive: false,
      plan: 'free',
      features: [],
      limits: null,
    };
  }
}

// Helper function to initialize default subscription plans
export async function initializeDefaultPlans(): Promise<void> {
  try {
    const existingPlans = await getAllSubscriptionPlans();
    if (existingPlans.length > 0) {
      return; // Plans already exist
    }
    
    const defaultPlans: Omit<SubscriptionPlan, 'createdAt' | 'updatedAt'>[] = [
      {
        planId: 'free',
        name: 'Free',
        price: 0,
        currency: 'INR',
        billingCycle: 'monthly',
        features: [
          'Basic crop recommendations',
          'Weather alerts',
          'Community support',
          'Up to 3 crop recommendations per month',
          'Up to 5 tester requests per month',
        ],
        limits: {
          maxTests: 5,
          maxScans: 10,
          maxRecommendations: 3,
          prioritySupport: false,
        },
        isActive: true,
      },
      {
        planId: 'premium',
        name: 'Premium',
        price: 299,
        currency: 'INR',
        billingCycle: 'monthly',
        features: [
          'All Free features',
          'Unlimited crop recommendations',
          'Unlimited tester requests',
          'Priority support',
          'Advanced analytics',
          'Soil testing integration',
        ],
        limits: {
          maxTests: 999,
          maxScans: 999,
          maxRecommendations: 999,
          prioritySupport: true,
        },
        isActive: true,
      },
      {
        planId: 'enterprise',
        name: 'Enterprise',
        price: 999,
        currency: 'INR',
        billingCycle: 'monthly',
        features: [
          'All Premium features',
          'Dedicated account manager',
          'Custom integrations',
          'API access',
          'Bulk ordering',
          'Advanced reporting',
          'Training sessions',
        ],
        limits: {
          maxTests: 9999,
          maxScans: 9999,
          maxRecommendations: 9999,
          prioritySupport: true,
        },
        isActive: true,
      },
    ];
    
    for (const plan of defaultPlans) {
      await createSubscriptionPlan(plan);
    }
  } catch (error) {
    console.error('Error initializing default plans:', error);
    throw new Error('Failed to initialize default plans');
  }
}
