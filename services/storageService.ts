import { DailyLog, Product, RoutineSettings } from '../types';
import { INITIAL_PRODUCTS, DEFAULT_ROUTINE_SETTINGS } from '../constants';

const STORAGE_KEY_LOGS = 'skincycling_logs';
const STORAGE_KEY_PRODUCTS = 'skincycling_products';
const STORAGE_KEY_START_DATE = 'skincycling_start_date';
const STORAGE_KEY_SETTINGS = 'skincycling_settings';

export const getLogs = (): Record<string, DailyLog> => {
  const stored = localStorage.getItem(STORAGE_KEY_LOGS);
  return stored ? JSON.parse(stored) : {};
};

export const saveLog = (log: DailyLog) => {
  const logs = getLogs();
  logs[log.date] = log;
  localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
};

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(STORAGE_KEY_PRODUCTS);
  // Return stored products, or INITIAL if empty. 
  // Logic in views handles merging image URLs if missing from local storage.
  return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
};

export const saveProduct = (product: Product) => {
  const products = getProducts();
  const newProducts = [...products, product];
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(newProducts));
};

export const getStartDate = (): string => {
  let stored = localStorage.getItem(STORAGE_KEY_START_DATE);
  if (!stored) {
    const today = new Date();
    stored = today.toISOString().split('T')[0];
    localStorage.setItem(STORAGE_KEY_START_DATE, stored);
  }
  return stored;
};

export const setStartDate = (date: string) => {
  localStorage.setItem(STORAGE_KEY_START_DATE, date);
};

export const getRoutineSettings = (): RoutineSettings => {
  const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
  return stored ? JSON.parse(stored) : DEFAULT_ROUTINE_SETTINGS;
};

export const saveRoutineSettings = (settings: RoutineSettings) => {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
};