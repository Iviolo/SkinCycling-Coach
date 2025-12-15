import { DailyLog, Product, RoutineSettings, RoutineStep } from '../types';
import { INITIAL_PRODUCTS, DEFAULT_ROUTINE_SETTINGS } from '../constants';

const STORAGE_KEY_LOGS = 'skincycling_logs';
const STORAGE_KEY_PRODUCTS = 'skincycling_products';
const STORAGE_KEY_START_DATE = 'skincycling_start_date';
const STORAGE_KEY_SETTINGS = 'skincycling_settings';
const STORAGE_KEY_USERNAME = 'skincycling_username';

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

// Function to overwrite the entire product list (used for deletion)
export const saveProducts = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
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

export const getUserName = (): string => {
  return localStorage.getItem(STORAGE_KEY_USERNAME) || 'Iviolo';
};

export const saveUserName = (name: string) => {
  localStorage.setItem(STORAGE_KEY_USERNAME, name);
};

export const resetAppData = () => {
    // FORCE FULL CLEAR to ensure nothing remains
    localStorage.clear();
};

// Automatically adds a product to the active routine settings based on its configuration
export const addProductToRoutine = (product: Product) => {
  const settings = getRoutineSettings();
  let changed = false;

  // Add to AM Routine if selected
  if (product.usedIn.includes('AM')) {
    const newStep: RoutineStep = {
      id: `am_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      label: product.category, // Use category as step name default (e.g. "Siero")
      productName: product.name
    };
    settings.amRoutine.push(newStep);
    changed = true;
  }

  // Add to PM Cycle if selected
  if (product.usedIn.includes('PM')) {
    // If specific nights are defined, use them. Otherwise default to all (though UI should handle this).
    const nights = product.cycleNights && product.cycleNights.length > 0 
      ? product.cycleNights 
      : [1, 2, 3, 4];

    nights.forEach(nightNum => {
      // nightNum is 1-based (1,2,3,4), array index is 0-based
      const nightIndex = nightNum - 1;
      if (settings.pmCycle[nightIndex]) {
        const newStep: RoutineStep = {
          id: `pm_${nightNum}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          label: product.category,
          productName: product.name
        };
        settings.pmCycle[nightIndex].steps.push(newStep);
        changed = true;
      }
    });
  }

  if (changed) {
    saveRoutineSettings(settings);
  }
};

// Removes a product reference from all routine steps by DELETING the step entirely
export const removeProductFromRoutine = (productName: string) => {
  const settings = getRoutineSettings();
  let changed = false;

  // Remove steps from AM Routine that use this product
  const originalAmCount = settings.amRoutine.length;
  settings.amRoutine = settings.amRoutine.filter(step => step.productName !== productName);
  if (settings.amRoutine.length !== originalAmCount) changed = true;

  // Remove steps from PM Cycles that use this product
  settings.pmCycle.forEach(night => {
      const originalPmCount = night.steps.length;
      night.steps = night.steps.filter(step => step.productName !== productName);
      if (night.steps.length !== originalPmCount) changed = true;
  });

  if (changed) {
    saveRoutineSettings(settings);
  }
};