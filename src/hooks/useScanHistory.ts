/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import type { ScanHistoryRecord, ThreatStats } from '../types';
import { 
  getScanHistory, 
  calculateThreatStats, 
  deleteScanRecord, 
  clearScanHistory, 
  HISTORY_UPDATED_EVENT 
} from '../services/scanHistoryService';

export function useScanHistory() {
  const [records, setRecords] = useState<ScanHistoryRecord[]>(() => {
    if (typeof window !== 'undefined') {
      return getScanHistory();
    }
    return [];
  });

  const [stats, setStats] = useState<ThreatStats>(() => calculateThreatStats(records));

  const refresh = useCallback(() => {
    const list = getScanHistory();
    setRecords(list);
    setStats(calculateThreatStats(list));
  }, []);

  useEffect(() => {
    // Initial load
    refresh();

    // Listen for custom history update events & storage events across tabs
    const handleUpdate = () => {
      refresh();
    };

    window.addEventListener(HISTORY_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(HISTORY_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refresh]);

  const removeRecord = useCallback((id: string) => {
    deleteScanRecord(id);
    refresh();
  }, [refresh]);

  const clearAll = useCallback(() => {
    clearScanHistory();
    refresh();
  }, [refresh]);

  return {
    records,
    stats,
    refresh,
    removeRecord,
    clearAll,
  };
}
