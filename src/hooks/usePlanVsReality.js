import { useState, useCallback, useEffect } from "react";
import { PHASES } from "../constants/phases";
import { DEMO_PLAN, emptyPhases } from "../constants/demoData";
import { generateId } from "../utils/uid";

const LEGACY_KEY = "pvr_state";
const CURRENT_DATE_KEY = "pvr_current_date";
const DAYS_INDEX_KEY = "pvr_days_index";
const VIEW_KEY = "pvr_view";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function dateKey(dateStr) {
  return `pvr_${dateStr}`;
}

function loadDaysIndex() {
  try {
    const raw = localStorage.getItem(DAYS_INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDaysIndex(index) {
  try {
    localStorage.setItem(DAYS_INDEX_KEY, JSON.stringify(index));
  } catch {}
}

function addToDaysIndex(dateStr) {
  const index = loadDaysIndex();
  if (!index.includes(dateStr)) {
    index.push(dateStr);
    saveDaysIndex(index);
  }
}

function loadDayFromStorage(dateStr) {
  try {
    const raw = localStorage.getItem(dateKey(dateStr));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveDayToStorage(dateStr, state) {
  try {
    localStorage.setItem(dateKey(dateStr), JSON.stringify(state));
    addToDaysIndex(dateStr);
  } catch {}
}

function migrateIfNeeded() {
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (!legacy) return;
    const parsed = JSON.parse(legacy);
    const today = todayStr();
    // Only migrate if no data exists for today yet
    if (!localStorage.getItem(dateKey(today))) {
      saveDayToStorage(today, {
        plan: parsed.plan,
        execution: parsed.execution,
        synced: parsed.synced ?? false,
      });
      if (parsed.view) {
        localStorage.setItem(VIEW_KEY, parsed.view);
      }
    }
    localStorage.removeItem(LEGACY_KEY);
  } catch {}
}

const weight = (task) => task.estimatedMinutes ?? 1;

function computeDaySummary(dateStr) {
  const data = loadDayFromStorage(dateStr);
  if (!data) return { date: dateStr, hasData: false };

  const { plan = {}, execution = {}, synced = false } = data;
  let plannedWeight = 0, completedWeight = 0, dropped = 0, unplanned = 0;

  PHASES.forEach((p) => {
    (plan[p.id] || []).forEach((t) => { plannedWeight += weight(t); });
    (execution[p.id] || []).forEach((t) => {
      if (t.status === "completed") completedWeight += weight(t);
      if (t.status === "dropped") dropped++;
      if (t.status === "unplanned") unplanned++;
    });
  });

  const hitRate = plannedWeight > 0 ? Math.round((completedWeight / plannedWeight) * 100) : 0;
  return { date: dateStr, hasData: true, synced, hitRate, dropped, unplanned };
}

function getAllDaySummaries() {
  const index = loadDaysIndex();
  return index.map(computeDaySummary);
}

export function usePlanVsReality() {
  // Run migration once on init (before first render)
  migrateIfNeeded();

  const initialDate = localStorage.getItem(CURRENT_DATE_KEY) || todayStr();
  const initialDay = loadDayFromStorage(initialDate);

  const [currentDate, setCurrentDate] = useState(initialDate);
  const [plan, setPlan] = useState(initialDay?.plan ?? DEMO_PLAN);
  const [execution, setExecution] = useState(initialDay?.execution ?? emptyPhases());
  const [synced, setSynced] = useState(initialDay?.synced ?? false);
  const [view, setView] = useState(
    localStorage.getItem(VIEW_KEY) ?? (initialDay?.synced ? "focus" : "split")
  );
  const [allDaySummaries, setAllDaySummaries] = useState(() => getAllDaySummaries());

  // Save current day on every state change
  useEffect(() => {
    saveDayToStorage(currentDate, { plan, execution, synced });
    localStorage.setItem(CURRENT_DATE_KEY, currentDate);
    // Refresh summaries after saving
    setAllDaySummaries(getAllDaySummaries());
  }, [plan, execution, synced, currentDate]);

  // Persist view preference separately
  useEffect(() => {
    localStorage.setItem(VIEW_KEY, view);
  }, [view]);

  const navigateToDate = useCallback((dateStr) => {
    // Current state already auto-saved via the effect above
    const dayData = loadDayFromStorage(dateStr);
    setPlan(dayData?.plan ?? emptyPhases());
    setExecution(dayData?.execution ?? emptyPhases());
    setSynced(dayData?.synced ?? false);
    setCurrentDate(dateStr);
    setView("split");
  }, []);

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

  const moveExecTask = useCallback((fromPhaseId, taskId, toPhaseId) => {
    setExecution((prev) => {
      const task = prev[fromPhaseId]?.find((t) => t.id === taskId);
      if (!task) return prev;
      const movedTask = {
        ...task,
        status: "moved",
        movedFrom: fromPhaseId,
      };
      return {
        ...prev,
        [fromPhaseId]: prev[fromPhaseId].filter((t) => t.id !== taskId),
        [toPhaseId]: [...(prev[toPhaseId] || []), movedTask],
      };
    });
  }, []);

  const moveExecTaskToDate = useCallback((fromPhaseId, taskId, targetDate, toPhaseId) => {
    let movedTask = null;
    setExecution((prev) => {
      const task = prev[fromPhaseId]?.find((t) => t.id === taskId);
      if (!task) return prev;
      movedTask = {
        ...task,
        status: "moved",
        movedFrom: fromPhaseId,
      };
      return {
        ...prev,
        [fromPhaseId]: prev[fromPhaseId].filter((t) => t.id !== taskId),
      };
    });

    // Save the moved task to the target day
    if (movedTask) {
      const targetDay = loadDayFromStorage(targetDate) || {
        plan: emptyPhases(),
        execution: emptyPhases(),
        synced: true,
      };
      const phaseTarget = toPhaseId || fromPhaseId;
      targetDay.execution[phaseTarget] = [
        ...(targetDay.execution[phaseTarget] || []),
        movedTask,
      ];
      saveDayToStorage(targetDate, targetDay);
    }
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
    currentDate,
    allDaySummaries,
    setView,
    navigateToDate,
    addPlanTask,
    updatePlanTask,
    removePlanTask,
    addUnplannedTask,
    updateExecTask,
    removeExecTask,
    moveExecTask,
    moveExecTaskToDate,
    syncToExecution,
    importData,
    resetToDemo,
    clearAll,
  };
}
