import { useState, useCallback } from "react";
import { PHASES } from "../constants/phases";
import { DEMO_PLAN, emptyPhases } from "../constants/demoData";
import { generateId } from "../utils/uid";

export function usePlanVsReality() {
  const [plan, setPlan] = useState(DEMO_PLAN);
  const [execution, setExecution] = useState(emptyPhases);
  const [synced, setSynced] = useState(false);
  const [view, setView] = useState("split");

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
  };
}
