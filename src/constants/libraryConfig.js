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

export const WEIGHT_OPTIONS = [
  { value: "No", label: "No" },
  { value: "Yes", label: "Yes" },
];

export const DEFAULT_CUSTOM_ENTRY = {
  workout: "",
  difficulty: 1,
  focus: "Full Body",
  weights: "No",
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
    workout: "Hanging Leg Raise",
    difficulty: 3,
    focus: "Core",
    weights: "Yes",
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
