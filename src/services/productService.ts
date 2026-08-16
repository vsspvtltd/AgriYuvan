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
export interface Product {
  id?: string;
  name: string;
  category: 'seed' | 'fertilizer' | 'pesticide' | 'equipment' | 'other';
  description: string;
  imageUrl?: string;
  price: number;
  unit: string;
  sellerId: string;
  sellerName: string;
  location: string;
  state: string;
  availability: boolean;
  stockQuantity?: number;
  specifications?: {
    [key: string]: string;
  };
  rating?: number;
  totalReviews?: number;
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ProductFilter {
  category?: Product['category'];
  state?: string;
  availability?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  searchQuery?: string;
}

const PRODUCTS_COLLECTION = 'products';

const db = getFirestoreDB();

// CRUD Operations

export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const productData = {
      ...product,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Failed to create product');
  }
}

export async function getProduct(productId: string): Promise<Product | null> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error('Failed to fetch product');
  }
}

export async function updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
}

// Query Operations

export async function getAllProducts(limitCount: number = 50): Promise<Product[]> {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('isActive', '==', true),
      orderBy('name'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
}

export async function getProductsByCategory(category: Product['category']): Promise<Product[]> {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('category', '==', category),
      where('isActive', '==', true),
      where('availability', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw new Error('Failed to fetch products by category');
  }
}

export async function getProductsByState(state: string): Promise<Product[]> {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('state', '==', state),
      where('isActive', '==', true),
      where('availability', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error('Error fetching products by state:', error);
    throw new Error('Failed to fetch products by state');
  }
}

export async function getProductsBySeller(sellerId: string): Promise<Product[]> {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('sellerId', '==', sellerId),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error('Error fetching products by seller:', error);
    throw new Error('Failed to fetch products by seller');
  }
}

export async function filterProducts(filters: ProductFilter): Promise<Product[]> {
  try {
    const constraints: any[] = [
      where('isActive', '==', true),
    ];
    
    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }
    if (filters.state) {
      constraints.push(where('state', '==', filters.state));
    }
    if (filters.availability !== undefined) {
      constraints.push(where('availability', '==', filters.availability));
    }
    if (filters.sellerId) {
      constraints.push(where('sellerId', '==', filters.sellerId));
    }
    
    const q = query(collection(db, PRODUCTS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    
    let products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    
    // Client-side filtering for price range
    if (filters.minPrice !== undefined) {
      products = products.filter(product => product.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      products = products.filter(product => product.price <= filters.maxPrice!);
    }
    
    // Search query filtering
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }
    
    return products;
  } catch (error) {
    console.error('Error filtering products:', error);
    throw new Error('Failed to filter products');
  }
}

export async function searchProducts(searchQuery: string, limitCount: number = 20): Promise<Product[]> {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('isActive', '==', true),
      where('availability', '==', true),
      orderBy('name'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    
    const searchLower = searchQuery.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Error searching products:', error);
    throw new Error('Failed to search products');
  }
}

// Price comparison

export async function compareProductsByPrice(category?: Product['category'], state?: string): Promise<Product[]> {
  try {
    const constraints: any[] = [
      where('isActive', '==', true),
      where('availability', '==', true),
    ];
    
    if (category) {
      constraints.push(where('category', '==', category));
    }
    if (state) {
      constraints.push(where('state', '==', state));
    }
    
    const q = query(collection(db, PRODUCTS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    
    // Sort by price
    return products.sort((a, b) => a.price - b.price);
  } catch (error) {
    console.error('Error comparing products by price:', error);
    throw new Error('Failed to compare products by price');
  }
}

// Stock management

export async function updateStock(productId: string, quantity: number, operation: 'add' | 'subtract' | 'set'): Promise<void> {
  try {
    const product = await getProduct(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    let newQuantity: number;
    if (operation === 'set') {
      newQuantity = quantity;
    } else if (operation === 'add') {
      newQuantity = (product.stockQuantity || 0) + quantity;
    } else {
      newQuantity = Math.max(0, (product.stockQuantity || 0) - quantity);
    }
    
    await updateProduct(productId, {
      stockQuantity: newQuantity,
      availability: newQuantity > 0,
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    throw new Error('Failed to update stock');
  }
}
