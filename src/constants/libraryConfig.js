// Shared column definitions for the workouts and jokers tables
export const TABLE_COLUMNS = [
  { key: "include", label: "Include in Random Draw?" },
  { key: "workout", label: "Workout" },
  { key: "focus", label: "Focus" },
  { key: "weights", label: "Gym/ Weights Req'd" },
];

export const COLUMN_STYLES = {
  include: { width: "65px", minWidth: "55px", textAlign: "center" },
  workout: { width: "55%", minWidth: "200px" },
  focus: { width: "80px", minWidth: "70px" },
  weights: { width: "80px", minWidth: "70px", textAlign: "center" },
};

export const LEVEL_OPTIONS = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
];

export const FOCUS_OPTIONS = ["Full Body", "Upper Body", "Lower Body", "Core"];
export const FOCUS_VALUE_PREFIX = "__focus__:";
export const FOCUS_LABEL_PREFIX = "Focus: ";

export function focusValueFor(focus) {
  return `${FOCUS_VALUE_PREFIX}${focus}`;
}

export function formatFocusLabel(focus) {
  return `${FOCUS_LABEL_PREFIX}${focus}`;
}

export function getFocusKeyFromValue(value) {
  if (typeof value !== "string") return null;
  if (value.startsWith(FOCUS_VALUE_PREFIX)) {
    return value.slice(FOCUS_VALUE_PREFIX.length);
  }
  if (value.startsWith(FOCUS_LABEL_PREFIX)) {
    return value.slice(FOCUS_LABEL_PREFIX.length);
  }
  return null;
}

export function normalizeFocusValue(value) {
  const focus = getFocusKeyFromValue(value);
  if (!focus) {
    return typeof value === "string" ? value : "";
  }
  return focusValueFor(focus);
}

export const FOCUS_PLACEHOLDER_OPTIONS = FOCUS_OPTIONS.map((focus) => ({
  focus,
  value: focusValueFor(focus),
  label: formatFocusLabel(focus),
}));

export const WORKOUT_MULTIPLIER_OPTIONS = [0.5, 1, 1.5, 2, 3];

export function formatWorkoutLabel(name, multiplier = 1) {
  const trimmed = (name || "").trim();
  if (!trimmed) return "";
  const numericMultiplier = Number(multiplier) || 1;
  return numericMultiplier === 1
    ? trimmed
    : `${trimmed} (${numericMultiplier}x)`;
}

export function parseWorkoutLabel(value) {
  const trimmed = (value || "").trim();
  if (!trimmed) {
    return { workout: "", multiplier: 1 };
  }
  const match = trimmed.match(/^(.*)\((\d+(?:\.\d+)?)x\)\s*$/i);
  if (match) {
    return {
      workout: match[1].trim(),
      multiplier: Number(match[2]) || 1,
    };
  }
  return { workout: trimmed, multiplier: 1 };
}

export function getAssignmentLabel(value) {
  const focus = getFocusKeyFromValue(value);
  if (focus) return formatFocusLabel(focus);
  return (value || "").trim();
}

export const WEIGHT_OPTIONS = [
  { value: "No", label: "No" },
  { value: "Yes", label: "Yes" },
];

export const DEFAULT_CUSTOM_ENTRY = {
  workout: "",
  difficulty: 1,
  focus: "Full Body",
  weights: "No",
  multiplier: 1,
};

export const WORKOUT_LIBRARY_DATA = [
  {
    include: false,
    workout: "Calf Raises",
    difficulty: 1,
    focus: "Lower Body",
    weights: "No",
  },
  {
    include: true,
    workout: "Jumping Jacks",
    difficulty: 1,
    focus: "Full Body",
    weights: "No",
  },
  {
    include: true,
    workout: "Leg Lifts",
    difficulty: 1,
    focus: "Core",
    weights: "No",
  },
  {
    include: true,
    workout: "Lunges",
    difficulty: 1,
    focus: "Lower Body",
    weights: "No",
  },
  {
    include: true,
    workout: "Push-ups",
    difficulty: 1,
    focus: "Upper Body",
    weights: "No",
  },
  {
    include: true,
    workout: "Sit-ups",
    difficulty: 1,
    focus: "Core",
    weights: "No",
  },
  {
    include: true,
    workout: "Squats",
    difficulty: 1,
    focus: "Lower Body",
    weights: "No",
  },
  {
    include: false,
    workout: "Jump Squats",
    difficulty: 2,
    focus: "Lower Body",
    weights: "No",
  },
  {
    include: false,
    workout: "Kettle Bell Swings",
    difficulty: 2,
    focus: "Full Body",
    weights: "Yes",
  },
  {
    include: true,
    workout: "Russian Twists",
    difficulty: 2,
    focus: "Core",
    weights: "No",
  },
  {
    include: true,
    workout: "Scissor Kicks",
    difficulty: 2,
    focus: "Core",
    weights: "No",
  },
  {
    include: false,
    workout: "Weighted Lunges",
    difficulty: 2,
    focus: "Lower Body",
    weights: "Yes",
  },
  {
    include: false,
    workout: "Squats (2x)",
    difficulty: 2,
    focus: "Lower Body",
    weights: "No",
    multiplier: 2,
  },
  {
    include: false,
    workout: "Box Jumps",
    difficulty: 3,
    focus: "Lower Body",
    weights: "Yes",
  },
  {
    include: true,
    workout: "Burpees",
    difficulty: 3,
    focus: "Full Body",
    weights: "No",
  },
  {
    include: false,
    workout: "Deadlifts",
    difficulty: 3,
    focus: "Full Body",
    weights: "Yes",
  },
  {
    include: false,
    workout: "Dips",
    difficulty: 3,
    focus: "Upper Body",
    weights: "Yes",
  },
  {
    include: false,
    workout: "Hand Release Push-ups",
    difficulty: 3,
    focus: "Upper Body",
    weights: "No",
  },
  {
    include: false,
    workout: "Hanging Leg Raise (0.5x)",
    difficulty: 3,
    focus: "Core",
    weights: "Yes",
    multiplier: 0.5,
  },
  {
    include: false,
    workout: "Mountain Climbers",
    difficulty: 3,
    focus: "Full Body",
    weights: "No",
  },
  {
    include: false,
    workout: "Pullups",
    difficulty: 3,
    focus: "Upper Body",
    weights: "Yes",
  },
];

export const JOKER_LIBRARY_DATA = [
  {
    include: false,
    workout: "1 min Farmer Carry",
    difficulty: 1,
    focus: "Full Body",
    weights: "Yes",
  },
  {
    include: false,
    workout: "1 min High Knees",
    difficulty: 1,
    focus: "Full Body",
    weights: "No",
  },
  {
    include: true,
    workout: "1 min Plank Hold",
    difficulty: 1,
    focus: "Full Body",
    weights: "No",
  },
  {
    include: true,
    workout: "10 Close Grip Push-ups",
    difficulty: 1,
    focus: "Upper Body",
    weights: "No",
  },
  {
    include: false,
    workout: "10 Wide Grip Push-ups",
    difficulty: 1,
    focus: "Upper Body",
    weights: "No",
  },
  {
    include: false,
    workout: "2 min Rest",
    difficulty: 1,
    focus: "Full Body",
    weights: "No",
  },
  {
    include: true,
    workout: "5 Burpees",
    difficulty: 1,
    focus: "Full Body",
    weights: "No",
  },
  {
    include: true,
    workout: "Side Planks (30s each side)",
    difficulty: 1,
    focus: "Full Body",
    weights: "No",
  },
  {
    include: true,
    workout: "2 min Plank Hold",
    difficulty: 2,
    focus: "Full Body",
    weights: "No",
  },
  {
    include: true,
    workout: "20 Close Grip Push-ups",
    difficulty: 2,
    focus: "Upper Body",
    weights: "No",
  },
  {
    include: false,
    workout: "40 Wide Grip Push-ups",
    difficulty: 2,
    focus: "Upper Body",
    weights: "No",
  },
  {
    include: false,
    workout: "500m Row",
    difficulty: 2,
    focus: "Full Body",
    weights: "Yes",
  },
  {
    include: true,
    workout: "Side Planks (60s each side)",
    difficulty: 2,
    focus: "Full Body",
    weights: "No",
  },
  {
    include: false,
    workout: "1 mi run",
    difficulty: 3,
    focus: "Full Body",
    weights: "No",
  },
  {
    include: true,
    workout: "20 burpees",
    difficulty: 3,
    focus: "Full Body",
    weights: "No",
  },
  {
    include: false,
    workout: "3 min farmer carry",
    difficulty: 3,
    focus: "Full Body",
    weights: "Yes",
  },
  {
    include: true,
    workout: "3 min plank hold",
    difficulty: 3,
    focus: "Full Body",
    weights: "No",
  },
  {
    include: true,
    workout: "Side planks (90s each side)",
    difficulty: 3,
    focus: "Full Body",
    weights: "No",
  },
  {
    include: false,
    workout: "Sled Push",
    difficulty: 3,
    focus: "Full Body",
    weights: "Yes",
  },
];
