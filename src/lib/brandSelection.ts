// Utility to persist brand selection across page navigation

const BRAND_SELECTION_KEY = 'scoreboards_selected_brand_id';

export function getSelectedBrandId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(BRAND_SELECTION_KEY);
  } catch {
    return null;
  }
}

export function setSelectedBrandId(brandId: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (brandId) {
      localStorage.setItem(BRAND_SELECTION_KEY, brandId);
    } else {
      localStorage.removeItem(BRAND_SELECTION_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
}


