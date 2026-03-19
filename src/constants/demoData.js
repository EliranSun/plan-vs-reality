import { generateId } from "../utils/uid";

export const DEMO_PLAN = {
  morning: [
    { id: generateId(), text: "Deep work: CSS quest system", status: "pending" },
    { id: generateId(), text: "Review Fibery board", status: "pending" },
  ],
  midday: [
    { id: generateId(), text: "Lunch break + walk", status: "pending" },
    { id: generateId(), text: "Reply to emails", status: "pending" },
  ],
  afternoon: [
    { id: generateId(), text: "Unity shader debugging", status: "pending" },
    { id: generateId(), text: "Write quest notification logic", status: "pending" },
  ],
  evening: [
    { id: generateId(), text: "Read game design article", status: "pending" },
  ],
};

export const emptyPhases = () => ({
  morning: [],
  midday: [],
  afternoon: [],
  evening: [],
});
