// Firestore Seed Script
// This script populates the Firestore database with realistic sample data for testing
// Run with: npx tsx scripts/seedFirestore.ts

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
  Timestamp 
} from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Seed Data
const seeds = [
  {
    name: 'Paddy - Swarna Sub-1',
    variety: 'Swarna Sub-1',
    crop: 'Rice',
    category: 'Cereal',
    price: 850,
    packSize: '5kg',
    location: 'Pune',
    state: 'Maharashtra',
    sellerId: 'seller1',
    sellerName: 'Agri Seeds Pvt Ltd',
    description: 'High-yielding paddy variety suitable for irrigated areas. Resistant to major diseases.',
    maturityDuration: '120-130 days',
    yieldPotential: '5.5-6.0 t/ha',
    suitableSeasons: ['Kharif', 'Rabi'],
    suitableSoils: ['Clay', 'Loam', 'Sandy Loam'],
    rating: 4.5,
    totalReviews: 128,
    stockQuantity: 500,
    availability: true,
    isActive: true,
    tags: ['high-yield', 'disease-resistant'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    name: 'Wheat - Lokwan',
    variety: 'Lokwan',
    crop: 'Wheat',
    category: 'Cereal',
    price: 1200,
    packSize: '5kg',
    location: 'Nagpur',
    state: 'Maharashtra',
    sellerId: 'seller2',
    sellerName: 'Maharashtra Agro Seeds',
    description: 'Premium wheat variety with excellent grain quality. Suitable for irrigated and rainfed conditions.',
    maturityDuration: '100-110 days',
    yieldPotential: '4.5-5.0 t/ha',
    suitableSeasons: ['Rabi'],
    suitableSoils: ['Loam', 'Clay Loam', 'Sandy Loam'],
    rating: 4.7,
    totalReviews: 95,
    stockQuantity: 350,
    availability: true,
    isActive: true,
    tags: ['premium', 'high-quality'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    name: 'Cotton - Bunny',
    variety: 'Bunny',
    crop: 'Cotton',
    category: 'Fiber',
    price: 1800,
    packSize: '450g',
    location: 'Akola',
    state: 'Maharashtra',
    sellerId: 'seller3',
    sellerName: 'Cotton Seeds Corporation',
    description: 'Bt cotton hybrid with high boll weight and good fiber quality. Resistant to bollworm.',
    maturityDuration: '160-170 days',
    yieldPotential: '15-18 quintals/ha',
    suitableSeasons: ['Kharif'],
    suitableSoils: ['Black Soil', 'Clay', 'Loam'],
    rating: 4.3,
    totalReviews: 76,
    stockQuantity: 200,
    availability: true,
    isActive: true,
    tags: ['bt-cotton', 'hybrid'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    name: 'Soybean - JS 9560',
    variety: 'JS 9560',
    crop: 'Soybean',
    category: 'Oilseed',
    price: 950,
    packSize: '5kg',
    location: 'Latur',
    state: 'Maharashtra',
    sellerId: 'seller1',
    sellerName: 'Agri Seeds Pvt Ltd',
    description: 'High-yielding soybean variety with good oil content. Suitable for Maharashtra conditions.',
    maturityDuration: '90-95 days',
    yieldPotential: '2.5-3.0 t/ha',
    suitableSeasons: ['Kharif'],
    suitableSoils: ['Black Soil', 'Clay Loam'],
    rating: 4.6,
    totalReviews: 112,
    stockQuantity: 400,
    availability: true,
    isActive: true,
    tags: ['high-yield', 'oil-rich'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    name: 'Maize - NK 6240',
    variety: 'NK 6240',
    crop: 'Maize',
    category: 'Cereal',
    price: 1500,
    packSize: '5kg',
    location: 'Nashik',
    state: 'Maharashtra',
    sellerId: 'seller4',
    sellerName: 'NK Seeds India',
    description: 'Hybrid maize with high yield potential and good standability. Suitable for silage and grain.',
    maturityDuration: '95-100 days',
    yieldPotential: '8-10 t/ha',
    suitableSeasons: ['Kharif', 'Rabi'],
    suitableSoils: ['Loam', 'Sandy Loam', 'Clay'],
    rating: 4.4,
    totalReviews: 88,
    stockQuantity: 300,
    availability: true,
    isActive: true,
    tags: ['hybrid', 'dual-purpose'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    name: 'Groundnut - TG 37A',
    variety: 'TG 37A',
    crop: 'Groundnut',
    category: 'Oilseed',
    price: 1100,
    packSize: '5kg',
    location: 'Solapur',
    state: 'Maharashtra',
    sellerId: 'seller2',
    sellerName: 'Maharashtra Agro Seeds',
    description: 'High-yielding groundnut variety with good oil content. Drought tolerant.',
    maturityDuration: '100-110 days',
    yieldPotential: '2.0-2.5 t/ha',
    suitableSeasons: ['Kharif'],
    suitableSoils: ['Sandy Loam', 'Loam'],
    rating: 4.2,
    totalReviews: 65,
    stockQuantity: 250,
    availability: true,
    isActive: true,
    tags: ['drought-tolerant', 'oil-rich'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    name: 'Chickpea - Vishal',
    variety: 'Vishal',
    crop: 'Chickpea',
    category: 'Pulse',
    price: 1300,
    packSize: '5kg',
    location: 'Aurangabad',
    state: 'Maharashtra',
    sellerId: 'seller5',
    sellerName: 'Pulse Seeds Ltd',
    description: 'Bold-seeded chickpea variety with high yield. Resistant to wilt disease.',
    maturityDuration: '95-100 days',
    yieldPotential: '2.5-3.0 t/ha',
    suitableSeasons: ['Rabi'],
    suitableSoils: ['Loam', 'Clay Loam', 'Sandy Loam'],
    rating: 4.5,
    totalReviews: 92,
    stockQuantity: 280,
    availability: true,
    isActive: true,
    tags: ['disease-resistant', 'high-yield'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    name: 'Tur - Pusa 2002',
    variety: 'Pusa 2002',
    crop: 'Pigeon Pea',
    category: 'Pulse',
    price: 1450,
    packSize: '5kg',
    location: 'Kolhapur',
    state: 'Maharashtra',
    sellerId: 'seller5',
    sellerName: 'Pulse Seeds Ltd',
    description: 'Medium duration pigeon pea variety with good yield. Suitable for intercropping.',
    maturityDuration: '140-150 days',
    yieldPotential: '2.0-2.5 t/ha',
    suitableSeasons: ['Kharif'],
    suitableSoils: ['Black Soil', 'Clay Loam'],
    rating: 4.3,
    totalReviews: 78,
    stockQuantity: 220,
    availability: true,
    isActive: true,
    tags: ['intercropping', 'medium-duration'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

const seedSellers = [
  {
    name: 'Agri Seeds Pvt Ltd',
    phone: '+91 98765 43210',
    email: 'info@agriseeds.com',
    location: 'Pune',
    state: 'Maharashtra',
    district: 'Pune',
    address: '123 Agricultural Market, Pune, Maharashtra 411001',
    rating: 4.5,
    totalReviews: 234,
    experience: '15 years',
    certifications: ['ISO 9001:2015', 'Seed Certification'],
    geoLocation: { latitude: 18.5204, longitude: 73.8567 },
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    name: 'Maharashtra Agro Seeds',
    phone: '+91 98765 43211',
    email: 'sales@magroseeds.com',
    location: 'Nagpur',
    state: 'Maharashtra',
    district: 'Nagpur',
    address: '456 Seed Market, Nagpur, Maharashtra 440001',
    rating: 4.3,
    totalReviews: 189,
    experience: '12 years',
    certifications: ['Seed Certification', 'Quality Assurance'],
    geoLocation: { latitude: 21.1458, longitude: 79.0882 },
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    name: 'Cotton Seeds Corporation',
    phone: '+91 98765 43212',
    email: 'cotton@cottonseeds.com',
    location: 'Akola',
    state: 'Maharashtra',
    district: 'Akola',
    address: '789 Cotton Market, Akola, Maharashtra 444001',
    rating: 4.6,
    totalReviews: 156,
    experience: '20 years',
    certifications: ['ISO 9001:2015', 'Bt Cotton Certified'],
    geoLocation: { latitude: 20.7002, longitude: 77.0082 },
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    name: 'NK Seeds India',
    phone: '+91 98765 43213',
    email: 'info@nkseeds.com',
    location: 'Nashik',
    state: 'Maharashtra',
    district: 'Nashik',
    address: '321 Agro Center, Nashik, Maharashtra 422001',
    rating: 4.4,
    totalReviews: 145,
    experience: '18 years',
    certifications: ['Seed Certification', 'Quality Assurance'],
    geoLocation: { latitude: 19.9975, longitude: 73.7898 },
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    name: 'Pulse Seeds Ltd',
    phone: '+91 98765 43214',
    email: 'pulses@pulseseeds.com',
    location: 'Aurangabad',
    state: 'Maharashtra',
    district: 'Aurangabad',
    address: '654 Pulse Market, Aurangabad, Maharashtra 431001',
    rating: 4.2,
    totalReviews: 134,
    experience: '10 years',
    certifications: ['Seed Certification'],
    geoLocation: { latitude: 19.8762, longitude: 75.3433 },
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

const testers = [
  {
    name: 'Dr. Rajesh Kumar',
    phone: '+91 98765 54321',
    email: 'rajesh.kumar@soiltest.com',
    location: 'Pune',
    state: 'Maharashtra',
    district: 'Pune',
    specialization: ['Soil Testing', 'Water Testing', 'Nutrient Analysis'],
    services: ['Soil pH Testing', 'NPK Analysis', 'Micronutrient Testing'],
    availability: true,
    rating: 4.7,
    totalReviews: 89,
    experience: '12 years',
    certifications: ['ISO 17025', 'NABL Accredited'],
    geoLocation: { latitude: 18.5204, longitude: 73.8567 },
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    name: 'Dr. Sunita Sharma',
    phone: '+91 98765 54322',
    email: 'sunita.sharma@agritech.com',
    location: 'Nagpur',
    state: 'Maharashtra',
    district: 'Nagpur',
    specialization: ['Crop Disease', 'Pest Analysis'],
    services: ['Disease Diagnosis', 'Pest Identification', 'Treatment Recommendations'],
    availability: true,
    rating: 4.5,
    totalReviews: 67,
    experience: '8 years',
    certifications: ['Plant Pathology Certified', 'ICAR Approved'],
    geoLocation: { latitude: 21.1458, longitude: 79.0882 },
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    name: 'Mr. Amit Patel',
    phone: '+91 98765 54323',
    email: 'amit.patel@soilcare.com',
    location: 'Akola',
    state: 'Maharashtra',
    district: 'Akola',
    specialization: ['Soil Testing', 'Nutrient Analysis'],
    services: ['Soil Testing', 'Fertilizer Recommendations', 'Irrigation Water Testing'],
    availability: true,
    rating: 4.3,
    totalReviews: 54,
    experience: '6 years',
    certifications: ['Soil Science Certified'],
    geoLocation: { latitude: 20.7002, longitude: 77.0082 },
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

const products = [
  {
    name: 'NPK 19:19:19 Fertilizer',
    category: 'Fertilizer',
    description: 'Balanced NPK fertilizer for all crops. Water-soluble.',
    price: 450,
    packSize: '1kg',
    sellerId: 'seller1',
    sellerName: 'Agri Seeds Pvt Ltd',
    location: 'Pune',
    state: 'Maharashtra',
    stockQuantity: 1000,
    rating: 4.4,
    totalReviews: 156,
    isActive: true,
    tags: ['fertilizer', 'npk', 'water-soluble'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    name: 'Urea 46% Nitrogen',
    category: 'Fertilizer',
    description: 'High nitrogen content fertilizer for vegetative growth.',
    price: 270,
    packSize: '45kg',
    sellerId: 'seller2',
    sellerName: 'Maharashtra Agro Seeds',
    location: 'Nagpur',
    state: 'Maharashtra',
    stockQuantity: 500,
    rating: 4.2,
    totalReviews: 234,
    isActive: true,
    tags: ['fertilizer', 'nitrogen', 'urea'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    name: 'DAP 18:46:0',
    category: 'Fertilizer',
    description: 'Di-ammonium phosphate for root development and flowering.',
    price: 1350,
    packSize: '50kg',
    sellerId: 'seller1',
    sellerName: 'Agri Seeds Pvt Ltd',
    location: 'Pune',
    state: 'Maharashtra',
    stockQuantity: 750,
    rating: 4.5,
    totalReviews: 189,
    isActive: true,
    tags: ['fertilizer', 'phosphorus', 'dap'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    name: 'Neem Oil Pesticide',
    category: 'Pesticide',
    description: 'Organic neem oil based pesticide for pest control.',
    price: 550,
    packSize: '1L',
    sellerId: 'seller3',
    sellerName: 'Cotton Seeds Corporation',
    location: 'Akola',
    state: 'Maharashtra',
    stockQuantity: 300,
    rating: 4.3,
    totalReviews: 98,
    isActive: true,
    tags: ['pesticide', 'organic', 'neem'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    name: 'Sprinkler Irrigation Kit',
    category: 'Irrigation',
    description: 'Complete sprinkler irrigation system for 1 acre.',
    price: 8500,
    packSize: 'Set',
    sellerId: 'seller4',
    sellerName: 'NK Seeds India',
    location: 'Nashik',
    state: 'Maharashtra',
    stockQuantity: 50,
    rating: 4.6,
    totalReviews: 67,
    isActive: true,
    tags: ['irrigation', 'sprinkler', 'water-saving'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

const subscriptionPlans = [
  {
    name: 'Basic',
    description: 'Essential features for small farmers',
    price: 0,
    currency: 'INR',
    billingCycle: 'monthly',
    features: [
      '5 soil tests per month',
      'Basic weather alerts',
      'Crop recommendations',
      'Community support',
    ],
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    name: 'Premium',
    description: 'Advanced features for progressive farmers',
    price: 299,
    currency: 'INR',
    billingCycle: 'monthly',
    features: [
      'Unlimited soil tests',
      'Advanced weather forecasts',
      'Personalized crop recommendations',
      'Priority tester access',
      'Expert consultation (2 hours/month)',
      'Market price alerts',
    ],
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    name: 'Enterprise',
    description: 'Complete solution for large farms and cooperatives',
    price: 999,
    currency: 'INR',
    billingCycle: 'monthly',
    features: [
      'All Premium features',
      'Unlimited expert consultation',
      'Custom reports',
      'API access',
      'Multi-user support',
      'Dedicated account manager',
    ],
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

// Seed Functions
async function seedSeeds() {
  console.log('Seeding seeds collection...');
  const seedsCollection = collection(db, 'seeds');
  
  for (const seed of seeds) {
    try {
      await addDoc(seedsCollection, seed);
      console.log(`Added seed: ${seed.name}`);
    } catch (error) {
      console.error(`Error adding seed ${seed.name}:`, error);
    }
  }
  
  console.log('Seeds collection seeded successfully!');
}

async function seedSellers() {
  console.log('Seeding seedSellers collection...');
  const sellersCollection = collection(db, 'seedSellers');
  
  for (const seller of seedSellers) {
    try {
      await addDoc(sellersCollection, seller);
      console.log(`Added seller: ${seller.name}`);
    } catch (error) {
      console.error(`Error adding seller ${seller.name}:`, error);
    }
  }
  
  console.log('SeedSellers collection seeded successfully!');
}

async function seedTesters() {
  console.log('Seeding testers collection...');
  const testersCollection = collection(db, 'testers');
  
  for (const tester of testers) {
    try {
      await addDoc(testersCollection, tester);
      console.log(`Added tester: ${tester.name}`);
    } catch (error) {
      console.error(`Error adding tester ${tester.name}:`, error);
    }
  }
  
  console.log('Testers collection seeded successfully!');
}

async function seedProducts() {
  console.log('Seeding products collection...');
  const productsCollection = collection(db, 'products');
  
  for (const product of products) {
    try {
      await addDoc(productsCollection, product);
      console.log(`Added product: ${product.name}`);
    } catch (error) {
      console.error(`Error adding product ${product.name}:`, error);
    }
  }
  
  console.log('Products collection seeded successfully!');
}

async function seedSubscriptionPlans() {
  console.log('Seeding subscriptionPlans collection...');
  const plansCollection = collection(db, 'subscriptionPlans');
  
  for (const plan of subscriptionPlans) {
    try {
      // Use a fixed document ID for plans to avoid duplicates
      const planId = plan.name.toLowerCase().replace(/\s+/g, '-');
      await setDoc(doc(plansCollection, planId), plan);
      console.log(`Added subscription plan: ${plan.name}`);
    } catch (error) {
      console.error(`Error adding subscription plan ${plan.name}:`, error);
    }
  }
  
  console.log('SubscriptionPlans collection seeded successfully!');
}

// Main seeding function
async function seedDatabase() {
  console.log('Starting database seeding...');
  console.log('Firebase project:', firebaseConfig.projectId);
  
  try {
    await seedSeeds();
    await seedSellers();
    await seedTesters();
    await seedProducts();
    await seedSubscriptionPlans();
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
