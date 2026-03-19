import { useState, useCallback, useEffect } from "react";
import { PHASES } from "../constants/phases";
import { DEMO_PLAN, emptyPhases } from "../constants/demoData";
import { generateId } from "../utils/uid";

const STORAGE_KEY = "pvr_state";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage quota exceeded or private mode — silently ignore
  }
}

export function usePlanVsReality() {
  const saved = loadFromStorage();

  const [plan, setPlan] = useState(saved?.plan ?? DEMO_PLAN);
  const [execution, setExecution] = useState(saved?.execution ?? emptyPhases());
  const [synced, setSynced] = useState(saved?.synced ?? false);
  const [view, setView] = useState(saved?.view ?? "split");

  // Auto-save on every state change
  useEffect(() => {
    saveToStorage({ plan, execution, synced, view });
  }, [plan, execution, synced, view]);

  const syncToExecution = useCallback(() => {
    const exec = {};
    PHASES.forEach((p) => {
      exec[p.id] = (plan[p.id] || []).map((t) => ({
        ...t,
        id: generateId(),
        status: "pending",
        sourcePhasId: p.id,
      }));
    });
    setExecution(exec);
    setSynced(true);
    setView("focus");
  }, [plan]);

  const addPlanTask = useCallback((phaseId) => {
    if (synced) return;
    setPlan((prev) => ({
      ...prev,
      [phaseId]: [...prev[phaseId], { id: generateId(), text: "", status: "pending" }],
    }));
  }, [synced]);

  const updatePlanTask = useCallback((phaseId, taskId, updated) => {
    if (synced) return;
    setPlan((prev) => ({
      ...prev,
      [phaseId]: prev[phaseId].map((t) => (t.id === taskId ? updated : t)),
    }));
  }, [synced]);

  const removePlanTask = useCallback((phaseId, taskId) => {
    if (synced) return;
    setPlan((prev) => ({
      ...prev,
      [phaseId]: prev[phaseId].filter((t) => t.id !== taskId),
    }));
  }, [synced]);

  const addUnplannedTask = useCallback((phaseId) => {
    setExecution((prev) => ({
      ...prev,
      [phaseId]: [...prev[phaseId], { id: generateId(), text: "", status: "unplanned" }],
    }));
  }, []);

  const updateExecTask = useCallback((phaseId, taskId, updated) => {
    setExecution((prev) => ({
      ...prev,
      [phaseId]: prev[phaseId].map((t) => (t.id === taskId ? updated : t)),
    }));
  }, []);

  const removeExecTask = useCallback((phaseId, taskId) => {
    setExecution((prev) => ({
      ...prev,
      [phaseId]: prev[phaseId].filter((t) => t.id !== taskId),
    }));
  }, []);

  const importData = useCallback((data) => {
    if (!data?.plan || !data?.execution) return false;
    setPlan(data.plan);
    setExecution(data.execution);
    setSynced(data.synced ?? false);
    setView(data.view ?? "split");
    return true;
  }, []);

  const resetToDemo = useCallback(() => {
    setPlan(DEMO_PLAN);
    setExecution(emptyPhases());
    setSynced(false);
    setView("split");
  }, []);

  const clearAll = useCallback(() => {
    setPlan(emptyPhases());
    setExecution(emptyPhases());
    setSynced(false);
    setView("split");
  }, []);

  return {
    plan,
    execution,
    synced,
    view,
    setView,
    addPlanTask,
    updatePlanTask,
    removePlanTask,
    addUnplannedTask,
    updateExecTask,
    removeExecTask,
    syncToExecution,
    importData,
    resetToDemo,
    clearAll,
  };
}
