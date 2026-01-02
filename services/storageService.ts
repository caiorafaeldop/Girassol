
const STORAGE_KEYS = {
  HABITS: 'c26_habits',
  TODOS: 'c26_todos',
  JOURNAL: 'c26_journal',
  // Migrating from 'weight' to 'health_logs' for the new comprehensive structure
  HEALTH_LOGS: 'c26_health_logs',
  NEWS_CACHE: 'c26_news_cache', // Nova chave para cache de notícias
};

export const loadData = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error loading ${key}`, e);
    return fallback;
  }
};

export const saveData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key}`, e);
  }
};

export const exportAllData = (): string => {
  const data: Record<string, any> = {};
  Object.values(STORAGE_KEYS).forEach(key => {
    data[key] = loadData(key, null);
  });
  return JSON.stringify(data, null, 2);
};

export const importAllData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    let hasValidData = false;
    
    Object.keys(data).forEach(key => {
      // Basic validation: ensure key is one of our known keys
      if (Object.values(STORAGE_KEYS).includes(key)) {
        saveData(key, data[key]);
        hasValidData = true;
      }
    });
    return hasValidData;
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
};

export const clearAllData = (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
}

export const StorageService = {
  keys: STORAGE_KEYS,
  save: saveData,
  load: loadData,
  exportAll: exportAllData,
  importAll: importAllData,
  clearAll: clearAllData,
};
