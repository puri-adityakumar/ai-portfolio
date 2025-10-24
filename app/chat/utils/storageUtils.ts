'use client';

/**
 * Safe localStorage operations with error handling and fallbacks
 */
export class StorageUtils {
  private static isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  static getItem<T>(key: string, defaultValue: T): T {
    if (!this.isStorageAvailable()) {
      console.warn('localStorage is not available, using default value');
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Failed to get item from localStorage (key: ${key}):`, error);
      return defaultValue;
    }
  }

  static setItem<T>(key: string, value: T): boolean {
    if (!this.isStorageAvailable()) {
      console.warn('localStorage is not available, cannot save data');
      return false;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to set item in localStorage (key: ${key}):`, error);
      
      // Try to clear some space if quota exceeded
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, attempting to clear old data');
        this.clearOldData();
        
        // Try again after clearing
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (retryError) {
          console.error('Failed to save even after clearing old data:', retryError);
        }
      }
      
      return false;
    }
  }

  static removeItem(key: string): boolean {
    if (!this.isStorageAvailable()) {
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove item from localStorage (key: ${key}):`, error);
      return false;
    }
  }

  static clear(): boolean {
    if (!this.isStorageAvailable()) {
      return false;
    }

    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }

  static getStorageSize(): number {
    if (!this.isStorageAvailable()) {
      return 0;
    }

    let total = 0;
    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
    }
    return total;
  }

  static getStorageSizeFormatted(): string {
    const bytes = this.getStorageSize();
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private static clearOldData(): void {
    try {
      const keys = Object.keys(localStorage);
      const chatKeys = keys.filter(key => 
        key.startsWith('conversation_') || 
        key.startsWith('ai-portfolio-')
      );
      
      // Sort by timestamp if available, otherwise by key name
      chatKeys.sort((a, b) => {
        try {
          const aData = JSON.parse(localStorage.getItem(a) || '{}');
          const bData = JSON.parse(localStorage.getItem(b) || '{}');
          const aTime = new Date(aData.updatedAt || aData.timestamp || 0).getTime();
          const bTime = new Date(bData.updatedAt || bData.timestamp || 0).getTime();
          return aTime - bTime; // Oldest first
        } catch {
          return a.localeCompare(b);
        }
      });
      
      // Remove oldest 25% of chat data
      const toRemove = Math.ceil(chatKeys.length * 0.25);
      for (let i = 0; i < toRemove && i < chatKeys.length; i++) {
        localStorage.removeItem(chatKeys[i]);
      }
      
      console.log(`Cleared ${toRemove} old chat entries to free up space`);
    } catch (error) {
      console.error('Failed to clear old data:', error);
    }
  }

  // Utility to check if we're approaching storage limits
  static isStorageNearLimit(threshold: number = 0.8): boolean {
    try {
      const testData = 'x'.repeat(1024); // 1KB test
      const testKey = '__storage_limit_test__';
      
      let canStore = true;
      let attempts = 0;
      const maxAttempts = Math.floor((5 * 1024 * 1024) / 1024); // Test up to ~5MB
      
      while (canStore && attempts < maxAttempts) {
        try {
          localStorage.setItem(testKey + attempts, testData);
          attempts++;
        } catch {
          canStore = false;
        }
      }
      
      // Clean up test data
      for (let i = 0; i < attempts; i++) {
        localStorage.removeItem(testKey + i);
      }
      
      const estimatedLimit = attempts * 1024; // Rough estimate in bytes
      const currentSize = this.getStorageSize();
      
      return currentSize / estimatedLimit > threshold;
    } catch {
      return false;
    }
  }
}