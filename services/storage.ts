import AsyncStorage from '@react-native-async-storage/async-storage';

interface StorageKeys {
  AUTH_TOKEN: 'auth_token';
  USER_PROFILE: 'user_profile';
  SESSION_CACHE: 'session_cache';
  SETTINGS: 'app_settings';
  ONBOARDING_DATA: 'onboarding_data';
  OFFLINE_SESSIONS: 'offline_sessions';
}

const STORAGE_KEYS: StorageKeys = {
  AUTH_TOKEN: 'auth_token',
  USER_PROFILE: 'user_profile',
  SESSION_CACHE: 'session_cache',
  SETTINGS: 'app_settings',
  ONBOARDING_DATA: 'onboarding_data',
  OFFLINE_SESSIONS: 'offline_sessions',
};

class StorageService {
  // Generic storage methods
  async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error(`Failed to store ${key}:`, error);
      return false;
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Failed to retrieve ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
      return false;
    }
  }

  async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  // Authentication
  async setAuthToken(token: string): Promise<boolean> {
    return this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  async getAuthToken(): Promise<string | null> {
    return this.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  }

  async removeAuthToken(): Promise<boolean> {
    return this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  // User Profile
  async setUserProfile(profile: any): Promise<boolean> {
    return this.setItem(STORAGE_KEYS.USER_PROFILE, profile);
  }

  async getUserProfile(): Promise<any | null> {
    return this.getItem(STORAGE_KEYS.USER_PROFILE);
  }

  async updateUserProfile(updates: Partial<any>): Promise<boolean> {
    try {
      const currentProfile = await this.getUserProfile();
      if (currentProfile) {
        const updatedProfile = { ...currentProfile, ...updates };
        return this.setUserProfile(updatedProfile);
      }
      return false;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      return false;
    }
  }

  // App Settings
  async setSettings(settings: any): Promise<boolean> {
    return this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  async getSettings(): Promise<any | null> {
    return this.getItem(STORAGE_KEYS.SETTINGS);
  }

  async updateSettings(updates: Partial<any>): Promise<boolean> {
    try {
      const currentSettings = await this.getSettings() || {};
      const updatedSettings = { ...currentSettings, ...updates };
      return this.setSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
      return false;
    }
  }

  // Session Cache
  async cacheSession(sessionId: string, sessionData: any): Promise<boolean> {
    try {
      const cache = await this.getItem<Record<string, any>>(STORAGE_KEYS.SESSION_CACHE) || {};
      cache[sessionId] = {
        ...sessionData,
        cachedAt: Date.now(),
      };
      return this.setItem(STORAGE_KEYS.SESSION_CACHE, cache);
    } catch (error) {
      console.error('Failed to cache session:', error);
      return false;
    }
  }

  async getCachedSession(sessionId: string): Promise<any | null> {
    try {
      const cache = await this.getItem<Record<string, any>>(STORAGE_KEYS.SESSION_CACHE);
      return cache?.[sessionId] || null;
    } catch (error) {
      console.error('Failed to get cached session:', error);
      return null;
    }
  }

  async clearSessionCache(): Promise<boolean> {
    return this.removeItem(STORAGE_KEYS.SESSION_CACHE);
  }

  // Onboarding Data
  async setOnboardingData(data: any): Promise<boolean> {
    return this.setItem(STORAGE_KEYS.ONBOARDING_DATA, data);
  }

  async getOnboardingData(): Promise<any | null> {
    return this.getItem(STORAGE_KEYS.ONBOARDING_DATA);
  }

  async clearOnboardingData(): Promise<boolean> {
    return this.removeItem(STORAGE_KEYS.ONBOARDING_DATA);
  }

  // Offline Sessions (for when network is unavailable)
  async saveOfflineSession(sessionData: any): Promise<boolean> {
    try {
      const offlineSessions = await this.getItem<any[]>(STORAGE_KEYS.OFFLINE_SESSIONS) || [];
      offlineSessions.push({
        ...sessionData,
        id: Date.now().toString(),
        createdAt: Date.now(),
        synced: false,
      });
      return this.setItem(STORAGE_KEYS.OFFLINE_SESSIONS, offlineSessions);
    } catch (error) {
      console.error('Failed to save offline session:', error);
      return false;
    }
  }

  async getOfflineSessions(): Promise<any[]> {
    const sessions = await this.getItem<any[]>(STORAGE_KEYS.OFFLINE_SESSIONS);
    return sessions !== null ? sessions : [];
  }

  async markOfflineSessionSynced(sessionId: string): Promise<boolean> {
    try {
      const offlineSessions = await this.getOfflineSessions();
      const updatedSessions = offlineSessions.map(session => 
        session.id === sessionId ? { ...session, synced: true } : session
      );
      return this.setItem(STORAGE_KEYS.OFFLINE_SESSIONS, updatedSessions);
    } catch (error) {
      console.error('Failed to mark offline session as synced:', error);
      return false;
    }
  }

  async clearSyncedOfflineSessions(): Promise<boolean> {
    try {
      const offlineSessions = await this.getOfflineSessions();
      const unsyncedSessions = offlineSessions.filter(session => !session.synced);
      return this.setItem(STORAGE_KEYS.OFFLINE_SESSIONS, unsyncedSessions);
    } catch (error) {
      console.error('Failed to clear synced offline sessions:', error);
      return false;
    }
  }

  // Utility methods
  async getStorageSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
      return 0;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return Array.from(await AsyncStorage.getAllKeys());
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }
}

export const storageService = new StorageService();
export default storageService;