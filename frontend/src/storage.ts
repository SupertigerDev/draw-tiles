const StorageKeys = {
  TOKEN: 'token',
}

type StorageKey = typeof StorageKeys[keyof typeof StorageKeys];

export const getStorageItem = <T>(key: StorageKey, defaultValue?: T) => {
    return localStorage.getItem(key) || defaultValue;
}
export const setStorageItem = (key: StorageKey, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting item ${key} in localStorage`, error);
  }
};