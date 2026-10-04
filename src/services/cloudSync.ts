import { DrawResult } from '../types';

export const syncFetchFromCloud = async (): Promise<Record<string, DrawResult[]> | null> => {
  try {
    const res = await fetch('/api/draws');
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.datasets && Object.keys(json.datasets).length > 0) {
      return json.datasets;
    }
  } catch (err) {
    // Cloud sync endpoint unavailable (local dev or KV binding not configured yet)
  }
  return null;
};

export const syncSaveToCloud = async (key: string, data: DrawResult[]): Promise<boolean> => {
  try {
    const res = await fetch('/api/draws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, data })
    });
    if (!res.ok) return false;
    const json = await res.json();
    return json.success;
  } catch (err) {
    return false;
  }
};
