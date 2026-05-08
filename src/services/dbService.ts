/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, addDoc, getDocs, query, where, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db as firestore } from "./firebaseConfig";

export interface SavedSearch {
  id: string;
  userId: string;
  query: string;
  createdAt: string;
}

export interface FavoriteProduct {
  id: string;
  userId: string;
  productData: any;
  savedAt: string;
}

class DatabaseService {
  async saveSearch(userId: string, queryText: string): Promise<SavedSearch> {
    try {
      const searchData = {
        userId,
        query: queryText,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(firestore, "searches"), searchData);
      return { id: docRef.id, ...searchData };
    } catch (error) {
      console.error("[DB] Error saving search:", error);
      throw error;
    }
  }

  async saveFavorite(userId: string, productData: any): Promise<FavoriteProduct> {
    try {
      const favoriteId = `${userId}_${productData.id}`;
      const favoriteData = {
        id: productData.id,
        userId,
        productData,
        savedAt: new Date().toISOString()
      };
      await setDoc(doc(firestore, "favorites", favoriteId), favoriteData);
      return favoriteData;
    } catch (error) {
      console.error("[DB] Error saving favorite:", error);
      throw error;
    }
  }

  async removeFavorite(userId: string, productId: string): Promise<void> {
    try {
      const favoriteId = `${userId}_${productId}`;
      await deleteDoc(doc(firestore, "favorites", favoriteId));
    } catch (error) {
      console.error("[DB] Error removing favorite:", error);
      throw error;
    }
  }

  async getUserFavorites(userId: string): Promise<FavoriteProduct[]> {
    try {
      const q = query(collection(firestore, "favorites"), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as FavoriteProduct);
    } catch (error) {
      console.error("[DB] Error getting favorites:", error);
      return [];
    }
  }

  async getUserSearches(userId: string): Promise<SavedSearch[]> {
    try {
      const q = query(collection(firestore, "searches"), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedSearch));
    } catch (error) {
      console.error("[DB] Error getting searches:", error);
      return [];
    }
  }
}

export const db = new DatabaseService();
