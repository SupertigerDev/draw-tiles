import { createSignal } from "solid-js";

const StorageKeys = {
  TOKEN: "token",
};

const [items, setItems] = createSignal<Record<StorageKey, string>>({
  ...localStorage,
});
type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

const getStorageItem = <T>(key: StorageKey, defaultValue?: T) => {
  return items()[key] ?? defaultValue;
};
const setStorageItem = (key: StorageKey, value: string): void => {
  localStorage.setItem(key, value);
  setItems({ ...items(), [key]: value });
};

export const useStorage = () => {
  return {
    getItem: getStorageItem,
    setItem: setStorageItem,
  };
};
