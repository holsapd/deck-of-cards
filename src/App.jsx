import React, { useState } from "react";
import CardFace from "./components/CardFace";
import Settings from "./components/Settings";
import LibraryTable from "./components/LibraryTable";
import History from "./components/History";
import {
  DEFAULT_CUSTOM_ENTRY,
  WORKOUT_LIBRARY_DATA,
  JOKER_LIBRARY_DATA,
  FOCUS_PLACEHOLDER_OPTIONS,
  formatFocusLabel,
  getFocusKeyFromValue,
  normalizeFocusValue,
  getAssignmentLabel,
  formatWorkoutLabel,
  parseWorkoutLabel,
  WORKOUT_MULTIPLIER_OPTIONS,
} from "./constants/libraryConfig";
import { makeDeckV2, DECK_SIZE_LIMITS } from "./utils/deck";

const APP_TABS = [
  { key: "workout", label: "Current Deck" },
  { key: "workouts", label: "Workouts" },
  { key: "jokers", label: "Jokers" },
  { key: "history", label: "History" },
  { key: "settings", label: "Settings/ My Decks" },
];
// Adjust this to change the tab text size globally
const TAB_FONT_SIZE_PX = 16;

function mergeLibrary(defaultRows, savedRows) {
  if (!Array.isArray(savedRows)) return defaultRows;

  const getNormalizedKey = (row) => {
    const parsed = parseWorkoutWithMultiplier(row?.workout);
    const baseName = (parsed.workout || row?.workout || "").trim();
    if (!baseName) return "";
    const explicitMultiplier = Number(row?.multiplier);
    const finalMultiplier = Number.isNaN(explicitMultiplier)
      ? parsed.multiplier
      : explicitMultiplier || parsed.multiplier || 1;
    return formatWorkoutLabel(baseName, finalMultiplier).toLowerCase();
  };

  const merged = [];
  const seen = new Set();

  const defaultMap = new Map();
  defaultRows.forEach((row) => {
    const key = getNormalizedKey(row);
    if (key && !defaultMap.has(key)) {
      defaultMap.set(key, row);
    }
  });

  savedRows.forEach((saved) => {
    const key = getNormalizedKey(saved);
    if (!saved || !saved.workout || !key || seen.has(key)) return;
    const match = defaultMap.get(key);
    const parsed = parseWorkoutWithMultiplier(saved.workout);
    const explicitMultiplier = Number(saved.multiplier);
    const finalMultiplier = Number.isNaN(explicitMultiplier)
      ? parsed.multiplier
      : explicitMultiplier || parsed.multiplier || 1;
    if (match) {
      merged.push({
        ...match,
        ...saved,
        include:
          typeof saved.include === "boolean" ? saved.include : match.include,
        difficulty: Number(saved.difficulty) || match.difficulty,
        focus: saved.focus || match.focus,
        weights: saved.weights || match.weights,
        multiplier: Number.isNaN(explicitMultiplier)
          ? match.multiplier
          : explicitMultiplier,
      });
    } else {
      merged.push({
        include: typeof saved.include === "boolean" ? saved.include : true,
        workout: formatWorkoutLabel(parsed.workout, finalMultiplier),
        difficulty: clampDifficulty(saved.difficulty),
        focus: saved.focus || "Full Body",
        weights: saved.weights || "No",
        multiplier: finalMultiplier,
      });
    }
    seen.add(key);
  });

  defaultRows.forEach((row) => {
    const key = getNormalizedKey(row);
    if (!key || seen.has(key)) return;
    merged.push(row);
    seen.add(key);
  });

  return merged;
}
const SUIT_KEYS = ["\u2660", "\u2665", "\u2666", "\u2663"];
const SUIT_LABELS = {
  "\u2660": "Spades",
  "\u2665": "Hearts",
  "\u2666": "Diamonds",
  "\u2663": "Clubs",
};

const BASE_WORKOUT_MAP = Object.freeze({
  "\u2660": "Push-ups",
  "\u2665": "Sit-ups",
  "\u2666": "Squats (2x)",
  "\u2663": "Pull-ups",
  JOKER: "2 min plank hold",
});

export const EX_MAP = Object.freeze(
  SUIT_KEYS.reduce((acc, key) => {
    acc[key] = BASE_WORKOUT_MAP[key];
    return acc;
  }, {})
);

const BASIC_FALLBACK_WORKOUTS = SUIT_KEYS.map((key) => BASE_WORKOUT_MAP[key]);

function normalizeAssignmentValue(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (getFocusKeyFromValue(trimmed)) return normalizeFocusValue(trimmed);
  const parsed = parseWorkoutLabel(trimmed);
  return formatWorkoutLabel(parsed.workout, parsed.multiplier);
}

function normalizeSuitAssignments(suits) {
  const normalized = {};
  SUIT_KEYS.forEach((key) => {
    const raw =
      suits && typeof suits === "object"
        ? suits[key] ?? suits[String(key)]
        : "";
    normalized[key] = normalizeAssignmentValue(raw || "");
  });
  return normalized;
}

function parseWorkoutWithMultiplier(value) {
  const parsed = parseWorkoutLabel(typeof value === "string" ? value : "");
  return {
    workout: (parsed.workout || "").trim(),
    multiplier: Number(parsed.multiplier) || 1,
  };
}

function clampDifficulty(value) {
  return Math.min(3, Math.max(1, Number(value) || 1));
}

function sanitizeWorkoutRows(rows) {
  return (rows || []).map((row) => {
    const parsed = parseWorkoutWithMultiplier(row.workout);
    const explicitMultiplier = Number(row.multiplier);
    const finalMultiplier = Number.isNaN(explicitMultiplier)
      ? parsed.multiplier
      : explicitMultiplier || parsed.multiplier || 1;
    const formatted = formatWorkoutLabel(parsed.workout, finalMultiplier);
    return {
      ...row,
      workout: formatted,
      multiplier: finalMultiplier,
      difficulty: clampDifficulty(row.difficulty),
    };
  });
}

function getWorkoutSortKey(row) {
  const parsed = parseWorkoutWithMultiplier(row.workout);
  const base = parsed.workout || row.workout || "";
  return base.trim().toLowerCase();
}

function sortRowsByLevel(rows) {
  const list = [...(rows || [])];
  return list.sort((a, b) => {
    const diff = clampDifficulty(a.difficulty) - clampDifficulty(b.difficulty);
    if (diff !== 0) return diff;
    return getWorkoutSortKey(a).localeCompare(getWorkoutSortKey(b), undefined, {
      sensitivity: "base",
    });
  });
}

function normalizeJokerRow(row) {
  if (!row) return null;
  const trimmedWorkout = (row.workout || "").trim();
  if (!trimmedWorkout) return null;
  return {
    ...row,
    workout: trimmedWorkout,
    focus: row.focus || "Full Body",
    weights: row.weights || "No",
    difficulty: clampDifficulty(row.difficulty),
    include: !!row.include,
  };
}

function normalizeJokerRows(rows) {
  return (rows || []).map((row) => normalizeJokerRow(row)).filter(Boolean);
}

function getWorkoutMetaFromAssignment(value) {
  const trimmed = (value || "").trim();
  if (!trimmed || getFocusKeyFromValue(trimmed)) {
    return { workout: "", multiplier: 1 };
  }
  return parseWorkoutWithMultiplier(trimmed);
}

function createInitialStats() {
  const suits = {};
  SUIT_KEYS.forEach((key) => {
    suits[key] = 0;
  });
  return { suits, jokers: [], performedWorkouts: [] };
}

const DEFAULT_JOKER_SLOTS = { 1: "random", 2: "none" };

const MAX_HISTORY_ENTRIES = 1000;

const STORAGE_KEYS = Object.freeze({
  deckPresets: "docw_deck_presets",
  selectedDeckId: "docw_selected_deck",
  numJokers: "docw_num_jokers",
  deckSize: "docw_deck_size",
  exMap: "docw_exercise_map",
  workoutLibrary: "docw_workout_library",
  jokerLibrary: "docw_joker_library",
  aceHigh: "docw_ace_high",
  faceCardMode: "docw_face_card_mode",
  jokerSlots: "docw_joker_slots",
  workoutHistory: "docw_workout_history",
  keepScreenAwake: "docw_keep_screen_awake",
  randomSettings: "docw_random_settings",
});

const LEGACY_STORAGE_KEY = "docw_settings";

function readStoredJSON(key) {
  if (typeof localStorage === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function usePersistedSlice(key, value, persistFn) {
  React.useEffect(() => {
    persistFn(key, value);
  }, [key, value, persistFn]);
}

const DEFAULT_DECK_PRESETS = [
  {
    id: "standard",
    name: "Standard Deck",
    suits: { ...EX_MAP },
    jokerSlots: { 1: "random", 2: "random" },
  },
  {
    id: "crush-core",
    name: "Crush the Core",
    suits: {
      "\u2660": "Leg Lifts",
      "\u2665": "Russian Twists",
      "\u2666": "Jumping Jacks",
      "\u2663": "Sit-ups",
    },
    jokerSlots: { 1: "random", 2: "random" },
  },
];

function clampJokerCount(value) {
  return Math.min(2, Math.max(0, Number(value) || 0));
}

function jokerSlotsFromCount(count) {
  const clamped = clampJokerCount(count);
  return {
    1: clamped >= 1 ? "random" : "none",
    2: clamped >= 2 ? "random" : "none",
  };
}

function normalizeJokerSlots(input) {
  if (!input || typeof input !== "object") return { ...DEFAULT_JOKER_SLOTS };
  const slotValue = (slot) => {
    const raw = input[slot] ?? input[String(slot)];
    return raw === "random" ? "random" : "none";
  };
  return {
    1: slotValue(1),
    2: slotValue(2),
  };
}

function countActiveJokers(slots) {
  if (!slots) return 0;
  return Object.values(slots).filter((mode) => mode === "random").length;
}

function cloneDeckPreset(deck) {
  return {
    ...deck,
    suits: normalizeSuitAssignments(deck.suits),
    jokerSlots: { ...deck.jokerSlots },
  };
}

function getDefaultDeckPresets() {
  return DEFAULT_DECK_PRESETS.map(cloneDeckPreset);
}

function normalizeDeckPreset(entry, fallbackId) {
  if (!entry) return null;
  const id =
    typeof entry.id === "string" && entry.id.trim()
      ? entry.id.trim()
      : fallbackId;
  if (!id) return null;
  const name =
    typeof entry.name === "string" && entry.name.trim()
      ? entry.name.trim()
      : "Custom Deck";
  const suits = {};
  SUIT_KEYS.forEach((key) => {
    const value =
      entry.suits && typeof entry.suits === "object"
        ? entry.suits[key] ?? entry.suits[String(key)]
        : "";
    const trimmed = typeof value === "string" ? value.trim() : "";
    const fallback = (EX_MAP[key] || "").trim();
    suits[key] = normalizeAssignmentValue(trimmed || fallback || "");
  });
  const jokerSlots = normalizeJokerSlots(entry.jokerSlots);
  return { id, name, suits, jokerSlots };
}

function mergeDeckPresets(saved) {
  if (!Array.isArray(saved) || !saved.length) return getDefaultDeckPresets();
  const merged = [];
  const seen = new Set();
  saved.forEach((entry, idx) => {
    const normalized = normalizeDeckPreset(entry, `custom-${idx}`);
    if (!normalized || seen.has(normalized.id)) return;
    merged.push(normalized);
    seen.add(normalized.id);
  });
  DEFAULT_DECK_PRESETS.forEach((preset) => {
    if (!seen.has(preset.id)) {
      merged.push(cloneDeckPreset(preset));
      seen.add(preset.id);
    }
  });
  return merged;
}

function getCustomDeckTemplate() {
  return {
    name: "",
    suits: normalizeSuitAssignments(EX_MAP),
    jokerSlots: { ...DEFAULT_JOKER_SLOTS },
  };
}

function getDefaultRandomSettings() {
  return {
    levels: { 1: true, 2: true, 3: false },
    gymAccess: "no",
    deckSize: "full",
    aceHigh: false,
    faceCardMode: "progressive",
    numJokers: 2,
    includeFocus: true,
  };
}

function mergeRandomSettings(stored) {
  const defaults = getDefaultRandomSettings();
  if (!stored || typeof stored !== "object") return defaults;
  const mergedLevels = { ...defaults.levels };
  if (stored.levels && typeof stored.levels === "object") {
    Object.entries(stored.levels).forEach(([level, value]) => {
      if (mergedLevels[level] !== undefined) {
        mergedLevels[level] = !!value;
      }
    });
  }
  const normalizedDeckSize =
    typeof stored.deckSize === "string" &&
    DECK_SIZE_LIMITS[stored.deckSize] !== undefined
      ? stored.deckSize
      : defaults.deckSize;
  const normalizedFaceCardMode =
    stored.faceCardMode === "ten" || stored.faceCardMode === "progressive"
      ? stored.faceCardMode
      : defaults.faceCardMode;
  const normalizedGymAccess =
    stored.gymAccess === "yes" || stored.gymAccess === "no"
      ? stored.gymAccess
      : defaults.gymAccess;
  return {
    ...defaults,
    ...stored,
    levels: mergedLevels,
    gymAccess: normalizedGymAccess,
    deckSize: normalizedDeckSize,
    aceHigh:
      typeof stored.aceHigh === "boolean" ? stored.aceHigh : defaults.aceHigh,
    faceCardMode: normalizedFaceCardMode,
    numJokers: clampJokerCount(stored.numJokers),
    includeFocus:
      typeof stored.includeFocus === "boolean"
        ? stored.includeFocus
        : defaults.includeFocus,
  };
}

export default function DeckOfCardsWorkout() {
  const defaultStandardPreset = DEFAULT_DECK_PRESETS[0];
  const initialJokerSlots =
    (defaultStandardPreset && defaultStandardPreset.jokerSlots) ||
    DEFAULT_JOKER_SLOTS;
  const initialNumJokers = countActiveJokers(initialJokerSlots) || 1;
  const initialDeck = React.useMemo(
    () => makeDeckV2(initialNumJokers, "full"),
    [initialNumJokers]
  );
  const [deckPresets, setDeckPresets] = useState(getDefaultDeckPresets());
  const [selectedDeckId, setSelectedDeckId] = useState("standard");
  const [customDeckDraft, setCustomDeckDraft] = useState(null);
  const [numJokers, setNumJokers] = useState(initialNumJokers);
  const [jokerSlots, setJokerSlots] = useState({ ...initialJokerSlots });
  const [deckSize, setDeckSize] = useState("full");
  const [deck, setDeck] = useState(initialDeck);
  const [totalCards, setTotalCards] = useState(initialDeck.length);
  const [drawHistory, setDrawHistory] = useState([]);
  const [current, setCurrent] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [exMap, setExMap] = useState(() => normalizeSuitAssignments(EX_MAP));
  const [workoutLibrary, setWorkoutLibrary] = useState(() =>
    sortRowsByLevel(sanitizeWorkoutRows(WORKOUT_LIBRARY_DATA))
  );
  const [jokerLibrary, setJokerLibrary] = useState(() =>
    sortRowsByLevel(normalizeJokerRows(JOKER_LIBRARY_DATA))
  );
  const [newWorkoutEntry, setNewWorkoutEntry] = useState({
    ...DEFAULT_CUSTOM_ENTRY,
  });
  const [newJokerEntry, setNewJokerEntry] = useState({
    ...DEFAULT_CUSTOM_ENTRY,
  });
  const [randomJokerList, setRandomJokerList] = useState(null);
  const [activeTab, setActiveTab] = useState("workout");
  const [hasStarted, setHasStarted] = useState(false);
  const [aceHigh, setAceHigh] = useState(false);
  const [faceCardMode, setFaceCardMode] = useState("progressive");
  const [randomSettings, setRandomSettings] = useState(() =>
    getDefaultRandomSettings()
  );
  const [workoutStats, setWorkoutStats] = useState(() => createInitialStats());
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [currentWorkoutName, setCurrentWorkoutName] = useState("Standard Deck");
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [keepScreenAwake, setKeepScreenAwake] = useState(false);
  const [isEditingWorkouts, setIsEditingWorkouts] = useState(false);
  const [editableWorkoutRows, setEditableWorkoutRows] = useState(null);
  const [isEditingJokers, setIsEditingJokers] = useState(false);
  const [editableJokerRows, setEditableJokerRows] = useState(null);
  const wakeLockRef = React.useRef(null);
  const persistQueueRef = React.useRef({});
  const persistTimerRef = React.useRef(null);

  const flushPersistQueue = React.useCallback(() => {
    const entries = Object.entries(persistQueueRef.current);
    persistQueueRef.current = {};
    persistTimerRef.current = null;
    if (!entries.length || typeof localStorage === "undefined") return;
    entries.forEach(([stateKey, value]) => {
      const storageKey = STORAGE_KEYS[stateKey];
      if (!storageKey) return;
      try {
        localStorage.setItem(storageKey, JSON.stringify(value));
      } catch {}
    });
  }, []);

  const enqueuePersist = React.useCallback(
    (stateKey, value) => {
      if (!STORAGE_KEYS[stateKey]) return;
      persistQueueRef.current[stateKey] = value;
      if (persistTimerRef.current !== null) return;
      const timerFn =
        typeof window !== "undefined" && typeof window.setTimeout === "function"
          ? window.setTimeout
          : setTimeout;
      persistTimerRef.current = timerFn(() => {
        flushPersistQueue();
      }, 400);
    },
    [flushPersistQueue]
  );

  React.useEffect(() => {
    return () => {
      if (persistTimerRef.current !== null) {
        const clear =
          typeof window !== "undefined" &&
          typeof window.clearTimeout === "function"
            ? window.clearTimeout
            : clearTimeout;
        clear(persistTimerRef.current);
      }
    };
  }, []);

  usePersistedSlice("deckPresets", deckPresets, enqueuePersist);
  usePersistedSlice("selectedDeckId", selectedDeckId, enqueuePersist);
  usePersistedSlice("numJokers", numJokers, enqueuePersist);
  usePersistedSlice("deckSize", deckSize, enqueuePersist);
  usePersistedSlice("exMap", exMap, enqueuePersist);
  usePersistedSlice("workoutLibrary", workoutLibrary, enqueuePersist);
  usePersistedSlice("jokerLibrary", jokerLibrary, enqueuePersist);
  usePersistedSlice("aceHigh", aceHigh, enqueuePersist);
  usePersistedSlice("faceCardMode", faceCardMode, enqueuePersist);
  usePersistedSlice("jokerSlots", jokerSlots, enqueuePersist);
  usePersistedSlice("workoutHistory", workoutHistory, enqueuePersist);
  usePersistedSlice("keepScreenAwake", keepScreenAwake, enqueuePersist);
  usePersistedSlice("randomSettings", randomSettings, enqueuePersist);

  const availableJokerWorkouts = React.useMemo(() => {
    if (randomJokerList && randomJokerList.length) return randomJokerList;
    return (jokerLibrary || [])
      .filter((row) => row.include)
      .map((row) => (row.workout || "").trim())
      .filter(Boolean);
  }, [jokerLibrary, randomJokerList]);

  const focusWorkoutPools = React.useMemo(() => {
    const pools = {};
    const addRows = (rows) => {
      (rows || []).forEach((row) => {
        const focus = (row.focus || "").trim();
        const workoutName = (row.workout || "").trim();
        if (!focus || !workoutName) return;
        if (!pools[focus]) pools[focus] = new Set();
        pools[focus].add(normalizeAssignmentValue(workoutName));
      });
    };
    addRows(workoutLibrary);
    addRows(WORKOUT_LIBRARY_DATA);
    const result = {};
    Object.entries(pools).forEach(([focus, map]) => {
      result[focus] = Array.from(map.values());
    });
    return result;
  }, [workoutLibrary]);

  const getRandomWorkoutForFocus = React.useCallback(
    (focusName) => {
      const pool = focusWorkoutPools[focusName] || [];
      if (!pool.length) return "";
      return pool[Math.floor(Math.random() * pool.length)];
    },
    [focusWorkoutPools]
  );

  const workoutOptions = React.useMemo(() => {
    const optionMap = new Map();
    const addOption = (raw) => {
      const trimmed = (raw || "").trim();
      if (!trimmed || getFocusKeyFromValue(trimmed)) return;
      const normalized = normalizeAssignmentValue(trimmed);
      if (!normalized) return;
      if (!optionMap.has(normalized)) {
        optionMap.set(normalized, {
          value: normalized,
          label: normalized,
        });
      }
    };
    (workoutLibrary || []).forEach((row) => addOption(row.workout));
    deckPresets.forEach((deckPreset) => {
      Object.values(deckPreset.suits || {}).forEach((assignment) =>
        addOption(assignment)
      );
    });
    if (!optionMap.size) {
      BASIC_FALLBACK_WORKOUTS.forEach((fallback) => addOption(fallback));
    }
    const workoutEntries = Array.from(optionMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
    );
    return [...FOCUS_PLACEHOLDER_OPTIONS, ...workoutEntries];
  }, [deckPresets, workoutLibrary]);

  const syncDeckSelection = React.useCallback(
    (targetId) => {
      const deckId = targetId || selectedDeckId;
      const preset =
        deckPresets.find((d) => d.id === deckId) || deckPresets[0] || null;
      if (!preset) return;
      setExMap(normalizeSuitAssignments(preset.suits));
      const slots = { ...preset.jokerSlots };
      setJokerSlots(slots);
      setNumJokers(countActiveJokers(slots));
      setRandomJokerList(null);
      setCurrentWorkoutName(preset.name || "Custom Deck");
    },
    [deckPresets, selectedDeckId]
  );

  // Load settings from localStorage
  React.useEffect(() => {
    try {
      if (typeof localStorage === "undefined") return;
      const sliceData = {};
      let hasSliceData = false;
      Object.entries(STORAGE_KEYS).forEach(([stateKey, storageKey]) => {
        const value = readStoredJSON(storageKey);
        if (value !== undefined) {
          sliceData[stateKey] = value;
          hasSliceData = true;
        }
      });
      const legacyData = hasSliceData
        ? null
        : readStoredJSON(LEGACY_STORAGE_KEY);
      const source = hasSliceData ? sliceData : legacyData;
      if (!source || typeof source !== "object") return;

      if (Array.isArray(source.deckPresets)) {
        const merged = mergeDeckPresets(source.deckPresets);
        setDeckPresets(merged);
        const fallbackDeck = merged[0];
        const nextDeckId =
          typeof source.selectedDeckId === "string"
            ? source.selectedDeckId
            : fallbackDeck?.id;
        if (nextDeckId) {
          setSelectedDeckId(nextDeckId);
          const preset =
            merged.find((d) => d.id === nextDeckId) || fallbackDeck;
          if (preset) {
            setExMap(normalizeSuitAssignments(preset.suits));
            const slots = normalizeJokerSlots(preset.jokerSlots);
            setJokerSlots(slots);
            setNumJokers(countActiveJokers(slots));
            setCurrentWorkoutName(preset.name || "Custom Deck");
          }
        }
      } else {
        if (typeof source.selectedDeckId === "string") {
          setSelectedDeckId(source.selectedDeckId);
        }
        if (source.exMap && typeof source.exMap === "object")
          setExMap(normalizeSuitAssignments(source.exMap));
        if (source.jokerSlots && typeof source.jokerSlots === "object") {
          const slots = normalizeJokerSlots(source.jokerSlots);
          setJokerSlots(slots);
          setNumJokers(countActiveJokers(slots));
        } else if (typeof source.numJokers === "number") {
          const clamped = clampJokerCount(source.numJokers);
          setNumJokers(clamped);
          setJokerSlots(jokerSlotsFromCount(clamped));
        }
      }

      if (
        typeof source.deckSize === "string" &&
        DECK_SIZE_LIMITS[source.deckSize] !== undefined
      )
        setDeckSize(source.deckSize);
      if (Array.isArray(source.workoutLibrary))
        setWorkoutLibrary(
          sortRowsByLevel(
            sanitizeWorkoutRows(
              mergeLibrary(WORKOUT_LIBRARY_DATA, source.workoutLibrary)
            )
          )
        );
      if (Array.isArray(source.jokerLibrary))
        setJokerLibrary(
          sortRowsByLevel(
            normalizeJokerRows(
              mergeLibrary(JOKER_LIBRARY_DATA, source.jokerLibrary)
            )
          )
        );
      if (typeof source.aceHigh === "boolean") setAceHigh(source.aceHigh);
      if (
        typeof source.faceCardMode === "string" &&
        ["ten", "progressive"].includes(source.faceCardMode)
      )
        setFaceCardMode(source.faceCardMode);
      if (typeof source.keepScreenAwake === "boolean")
        setKeepScreenAwake(source.keepScreenAwake);
      if (source.randomSettings && typeof source.randomSettings === "object")
        setRandomSettings(mergeRandomSettings(source.randomSettings));
      if (Array.isArray(source.workoutHistory))
        setWorkoutHistory(source.workoutHistory.slice(0, MAX_HISTORY_ENTRIES));
    } catch {}
  }, []);

  React.useEffect(() => {
    syncDeckSelection();
  }, [syncDeckSelection]);

  React.useEffect(() => {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    let cancelled = false;

    const releaseCurrent = () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };

    const requestWakeLock = async () => {
      if (!keepScreenAwake || cancelled) {
        releaseCurrent();
        return;
      }
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          lock.release().catch(() => {});
          return;
        }
        wakeLockRef.current = lock;
        lock.addEventListener("release", () => {
          wakeLockRef.current = null;
          if (!cancelled && keepScreenAwake) {
            requestWakeLock();
          }
        });
      } catch (err) {
        console.warn("Wake lock request failed", err);
      }
    };

    requestWakeLock();

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && keepScreenAwake) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      releaseCurrent();
    };
  }, [keepScreenAwake]);

  // Persist settings to localStorage
  const resetDeck = React.useCallback(
    (options) => {
      const jokerCount =
        options && typeof options.numJokers === "number"
          ? options.numJokers
          : numJokers;
      const size =
        options && typeof options.deckSize === "string"
          ? options.deckSize
          : deckSize;
      const fresh = makeDeckV2(jokerCount, size);
      setDeck(fresh);
      setTotalCards(fresh.length);
      setCurrent(null);
      setFlipped(false);
      setHasStarted(false);
      setWorkoutStats(createInitialStats());
      setDrawHistory([]);
      setWorkoutCompleted(false);
    },
    [numJokers, deckSize]
  );

  React.useEffect(() => {
    resetDeck();
  }, [resetDeck]);

  function drawCard() {
    if (deck.length === 0) {
      setCurrent({ rank: "BACK", suit: "", id: "end" });
      return;
    }
    const next = { ...deck[0] };
    let delta = null;
    if (next.rank === "Joker") {
      let picked = next.jokerWorkoutPick;
      if (!picked) {
        const choices = availableJokerWorkouts;
        picked = choices.length
          ? choices[Math.floor(Math.random() * choices.length)]
          : "Wildcard (Joker Workout)";
      }
      next.jokerWorkoutPick = picked;
      delta = { type: "joker", jokerWorkout: picked };
      setWorkoutStats((prev) => ({
        suits: { ...prev.suits },
        jokers: [...prev.jokers, picked],
        performedWorkouts: [...(prev.performedWorkouts || [])],
      }));
    } else {
      const assignedValue = exMap[next.suit];
      const focusName = getFocusKeyFromValue(assignedValue);
      if (!next.focusWorkoutPick && focusName) {
        const pick = getRandomWorkoutForFocus(focusName);
        if (pick) {
          next.focusWorkoutPick = pick;
        } else {
          next.focusWorkoutPick = formatFocusLabel(focusName);
        }
      }
      const repsValue = repsFor(next);
      const resolvedWorkoutLabel =
        (next.focusWorkoutPick ||
          getAssignmentLabel(exMap[next.suit]) ||
          "Workout") + "";
      const normalizedLabel = resolvedWorkoutLabel.trim() || "Workout";
      delta = {
        type: "suit",
        suit: next.suit,
        reps: repsValue,
        workoutLabel: normalizedLabel,
      };
      setWorkoutStats((prev) => {
        const suits = { ...prev.suits };
        suits[next.suit] = (suits[next.suit] || 0) + repsValue;
        const performedWorkouts = [
          ...(prev.performedWorkouts || []),
          {
            workout: normalizedLabel,
            reps: repsValue,
          },
        ];
        return {
          suits,
          jokers: prev.jokers,
          performedWorkouts,
        };
      });
    }
    setDeck((d) => d.slice(1));
    setCurrent(next);
    if (delta) {
      setDrawHistory((history) => [...history, { card: next, delta }]);
    }
  }

  const revertStatsForEntry = React.useCallback((historyEntry) => {
    if (!historyEntry) return;
    setWorkoutStats((prev) => {
      const suits = { ...prev.suits };
      const jokers = [...(prev.jokers || [])];
      let performedWorkouts = [...(prev.performedWorkouts || [])];
      if (historyEntry.delta?.type === "joker") {
        jokers.pop();
      } else if (historyEntry.delta?.type === "suit") {
        if (historyEntry.delta.suit) {
          const updatedValue =
            (suits[historyEntry.delta.suit] || 0) -
            (historyEntry.delta.reps || 0);
          suits[historyEntry.delta.suit] = updatedValue > 0 ? updatedValue : 0;
        }
        if (performedWorkouts.length) {
          performedWorkouts = performedWorkouts.slice(0, -1);
        }
      }
      return {
        suits,
        jokers,
        performedWorkouts,
      };
    });
  }, []);

  function handleCardClick() {
    setHasStarted(true);
    setFlipped(true);
    setTimeout(() => {
      setFlipped(false);
      drawCard();
    }, 200);
  }

  const handlePreviousCard = () => {
    if (flipped || !current || current.id === "end") return;
    if (!drawHistory || drawHistory.length < 2) return;
    const lastEntry = drawHistory[drawHistory.length - 1];
    const newHistory = drawHistory.slice(0, -1);
    const previousEntry = newHistory[newHistory.length - 1] || null;
    revertStatsForEntry(lastEntry);
    setDeck((prevDeck) => [lastEntry.card, ...prevDeck]);
    setCurrent(previousEntry ? previousEntry.card : null);
    setDrawHistory(newHistory);
  };

  const getCardMultiplier = (card) => {
    if (!card || card.rank === "Joker" || card.rank === "BACK") return 1;
    if (card.focusWorkoutPick) {
      return parseWorkoutWithMultiplier(card.focusWorkoutPick).multiplier || 1;
    }
    const assignmentValue = exMap[card.suit];
    if (getFocusKeyFromValue(assignmentValue)) return 1;
    const meta = getWorkoutMetaFromAssignment(assignmentValue);
    return meta.multiplier || 1;
  };

  const repsFor = (card) => {
    if (!card || card.rank === "Joker" || card.rank === "BACK") return 0;
    const faceValues =
      faceCardMode === "ten"
        ? { J: 10, Q: 10, K: 10 }
        : { J: 11, Q: 12, K: 13 };
    const base = isNaN(card.rank)
      ? { A: aceHigh ? 14 : 1, ...faceValues }[card.rank]
      : Number(card.rank);
    const multiplier = getCardMultiplier(card);
    const total = Math.ceil((base || 0) * multiplier);
    return total > 0 ? total : 0;
  };

  const exerciseFor = (card) => {
    if (!card) return "";
    if (card.rank === "Joker")
      return card.jokerWorkoutPick || "Wildcard (Joker Workout)";
    if (card.focusWorkoutPick) return card.focusWorkoutPick;
    return getAssignmentLabel(exMap[card.suit]) || "";
  };
  const showBack = !current || current.rank === "BACK";
  const preWorkoutOverlay = React.useMemo(() => {
    if (current) return null;
    const exercises = SUIT_KEYS.map((key, idx) => {
      const name = (getAssignmentLabel(exMap[key]) || "").trim();
      if (name) return name;
      return BASIC_FALLBACK_WORKOUTS[idx] || BASIC_FALLBACK_WORKOUTS[0];
    }).filter(Boolean);
    const jokerCountLabel = `${numJokers || 0} ${
      numJokers === 1 ? "Joker" : "Jokers"
    }`;
    if (!exercises.length && !numJokers) return null;
    return {
      exercises,
      jokerLabel: jokerCountLabel,
    };
  }, [current, exMap, numJokers]);
  const progressIndex = Math.min(
    totalCards,
    Math.max(0, totalCards - deck.length)
  );
  const currentCardId = current?.id;
  const canGoToPreviousCard =
    drawHistory.length >= 2 && current && currentCardId !== "end";
  const totalRepsCompleted = SUIT_KEYS.reduce(
    (sum, key) => sum + (workoutStats.suits[key] || 0),
    0
  );

  React.useEffect(() => {
    if (currentCardId !== "end" || workoutCompleted) return;
    const suitDetails = SUIT_KEYS.map((key) => ({
      key,
      suit: SUIT_LABELS[key],
      workout: getAssignmentLabel(exMap[key]) || "",
      reps: workoutStats.suits[key] || 0,
    }));
    const totalReps = suitDetails.reduce((sum, item) => sum + item.reps, 0);
    const entryId = Date.now();
    const performedWorkouts = (workoutStats.performedWorkouts || []).map(
      (item, index) => ({
        id: `${entryId}-${index}`,
        workout: item.workout,
        reps: item.reps,
      })
    );
    const cardsCompleted =
      performedWorkouts.length + workoutStats.jokers.length;
    const entry = {
      id: entryId,
      completedAt: new Date().toISOString(),
      workoutName: currentWorkoutName || "Custom Deck",
      suits: suitDetails,
      totalReps,
      jokers: [...workoutStats.jokers],
      performedWorkouts,
      cardsCompleted,
    };
    setWorkoutHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY_ENTRIES));
    setWorkoutCompleted(true);
  }, [
    currentCardId,
    workoutCompleted,
    workoutStats,
    exMap,
    currentWorkoutName,
  ]);

  const handleNewEntryChange = (type, field, value) => {
    const setter = type === "workouts" ? setNewWorkoutEntry : setNewJokerEntry;
    setter((prev) => ({ ...prev, [field]: value }));
  };

  const toggleIncludeRow = (type, index) => {
    if (type === "workouts") {
      setWorkoutLibrary((rows) =>
        rows.map((row, i) =>
          i === index ? { ...row, include: !row.include } : row
        )
      );
    } else if (type === "jokers") {
      setJokerLibrary((rows) =>
        rows.map((row, i) =>
          i === index ? { ...row, include: !row.include } : row
        )
      );
    }
  };

  const addCustomEntry = (type) => {
    const entry = type === "workouts" ? newWorkoutEntry : newJokerEntry;
    const resetSetter =
      type === "workouts" ? setNewWorkoutEntry : setNewJokerEntry;

    const trimmedWorkout = (entry.workout || "").trim();
    if (!trimmedWorkout) return;

    const numericMultiplier =
      type === "workouts" ? Number(entry.multiplier) || 1 : 1;
    const difficultyValue = clampDifficulty(entry.difficulty);

    if (type === "workouts") {
      const editableRow = {
        include: true,
        workout: trimmedWorkout,
        difficulty: difficultyValue,
        focus: entry.focus || "Full Body",
        weights: entry.weights || "No",
        multiplier: numericMultiplier,
      };
      if (isEditingWorkouts) {
        setEditableWorkoutRows((rows) =>
          sortRowsByLevel([...(rows || []), editableRow])
        );
      } else {
        const formattedRow = {
          ...editableRow,
          workout: formatWorkoutLabel(trimmedWorkout, numericMultiplier),
        };
        setWorkoutLibrary((rows) =>
          sortRowsByLevel([...(rows || []), formattedRow])
        );
      }
    } else {
      const newRow = normalizeJokerRow({
        include: true,
        workout: trimmedWorkout,
        difficulty: difficultyValue,
        focus: entry.focus || "Full Body",
        weights: entry.weights || "No",
      });
      if (!newRow) return;
      if (isEditingJokers) {
        setEditableJokerRows((rows) =>
          sortRowsByLevel([...(rows || []), newRow])
        );
      } else {
        setJokerLibrary((rows) => sortRowsByLevel([...(rows || []), newRow]));
      }
    }
    resetSetter({ ...DEFAULT_CUSTOM_ENTRY });
  };

  const startEditingWorkoutLibrary = () => {
    if (isEditingWorkouts) return;
    const snapshot = sortRowsByLevel(
      (workoutLibrary || []).map((row, idx) => {
        const parsed = parseWorkoutWithMultiplier(row.workout);
        return {
          ...row,
          _editId: idx,
          workout: parsed.workout,
          multiplier: row.multiplier || parsed.multiplier || 1,
          difficulty: clampDifficulty(row.difficulty),
        };
      })
    );
    setEditableWorkoutRows(snapshot);
    setIsEditingWorkouts(true);
  };

  const cancelWorkoutLibraryEdits = () => {
    setEditableWorkoutRows(null);
    setIsEditingWorkouts(false);
  };

  const handleEditWorkoutChange = (index, field, value) => {
    setEditableWorkoutRows((rows) => {
      if (!Array.isArray(rows)) return rows;
      return rows.map((row, idx) => {
        if (idx !== index) return row;
        if (field === "difficulty") {
          return { ...row, difficulty: clampDifficulty(value) };
        }
        if (field === "multiplier") {
          return { ...row, multiplier: Number(value) || 1 };
        }
        if (field === "include") {
          return { ...row, include: !!value };
        }
        return { ...row, [field]: value };
      });
    });
  };

  const handleDeleteEditableWorkout = (index) => {
    setEditableWorkoutRows((rows) => {
      if (!Array.isArray(rows)) return rows;
      return rows.filter((_, idx) => idx !== index);
    });
  };

  const handleSaveWorkoutEdits = () => {
    if (!isEditingWorkouts || !Array.isArray(editableWorkoutRows)) return;
    const cleaned = editableWorkoutRows
      .map((row) => {
        const trimmedName = (row.workout || "").trim();
        if (!trimmedName) return null;
        const { _editId, ...rest } = row;
        return {
          ...rest,
          workout: trimmedName,
          focus: row.focus || "Full Body",
          weights: row.weights || "No",
          difficulty: clampDifficulty(row.difficulty),
          multiplier: Number(row.multiplier) || 1,
          include: !!row.include,
        };
      })
      .filter(Boolean);
    const sanitized = sortRowsByLevel(sanitizeWorkoutRows(cleaned));
    setWorkoutLibrary(sanitized);
    setEditableWorkoutRows(null);
    setIsEditingWorkouts(false);
  };

  const startEditingJokerLibrary = () => {
    if (isEditingJokers) return;
    const snapshot = sortRowsByLevel(
      normalizeJokerRows(jokerLibrary).map((row, idx) => ({
        ...row,
        _editId: idx,
      }))
    );
    setEditableJokerRows(snapshot);
    setIsEditingJokers(true);
  };

  const cancelJokerLibraryEdits = () => {
    setEditableJokerRows(null);
    setIsEditingJokers(false);
  };

  const handleEditJokerChange = (index, field, value) => {
    setEditableJokerRows((rows) => {
      if (!Array.isArray(rows)) return rows;
      return rows.map((row, idx) => {
        if (idx !== index) return row;
        if (field === "difficulty") {
          return { ...row, difficulty: clampDifficulty(value) };
        }
        if (field === "include") {
          return { ...row, include: !!value };
        }
        return { ...row, [field]: value };
      });
    });
  };

  const handleDeleteEditableJoker = (index) => {
    setEditableJokerRows((rows) => {
      if (!Array.isArray(rows)) return rows;
      return rows.filter((_, idx) => idx !== index);
    });
  };

  const handleSaveJokerEdits = () => {
    if (!isEditingJokers || !Array.isArray(editableJokerRows)) return;
    const normalized = sortRowsByLevel(
      normalizeJokerRows(
        editableJokerRows.map(({ _editId, ...rest }) => rest)
      )
    );
    setJokerLibrary(normalized);
    setEditableJokerRows(null);
    setIsEditingJokers(false);
  };

  const handleDeleteHistoryEntries = React.useCallback((idsToDelete) => {
    if (!Array.isArray(idsToDelete) || !idsToDelete.length) return;
    const idSet = new Set(idsToDelete);
    setWorkoutHistory((prev) =>
      prev.filter((entry) => entry && !idSet.has(entry.id))
    );
  }, []);

  const shuffleList = (list) => {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const startRandomWorkout = () => {
    const enabledLevels = Object.entries(randomSettings.levels)
      .filter(([, checked]) => checked)
      .map(([lvl]) => Number(lvl));
    if (!enabledLevels.length) return;
    setCurrentWorkoutName("Random Workout");
    setWorkoutStats(createInitialStats());
    setWorkoutCompleted(false);
    const hasWeights = randomSettings.gymAccess === "yes";
    const workoutPool = (workoutLibrary || []).filter((row) => {
      const requiresWeights = (row.weights || "").toLowerCase() === "yes";
      return (
        row.include &&
        enabledLevels.includes(Number(row.difficulty)) &&
        (hasWeights || !requiresWeights)
      );
    });
    const fallbackWorkoutPool = (workoutLibrary || []).filter(
      (row) => row.include
    );
    const finalWorkoutPool =
      workoutPool.length > 0
        ? workoutPool
        : fallbackWorkoutPool.length > 0
        ? fallbackWorkoutPool
        : WORKOUT_LIBRARY_DATA;
    const suitKeys = SUIT_KEYS;
    const uniqueWorkoutPool = [];
    const usedLabels = new Set();
    const addWorkoutLabel = (label) => {
      const normalized = normalizeAssignmentValue(label || "");
      if (!normalized || usedLabels.has(normalized)) return;
      usedLabels.add(normalized);
      uniqueWorkoutPool.push(normalized);
    };
    finalWorkoutPool.forEach((row) => {
      const base = (row.workout || "").trim();
      if (!base) return;
      const parsed = parseWorkoutWithMultiplier(base);
      const multiplier = Number(row.multiplier) || parsed.multiplier || 1;
      const label = formatWorkoutLabel(parsed.workout, multiplier);
      addWorkoutLabel(label);
    });
    if (randomSettings.includeFocus) {
      FOCUS_PLACEHOLDER_OPTIONS.forEach((option) => {
        addWorkoutLabel(option.label);
      });
    }
    if (uniqueWorkoutPool.length < suitKeys.length) {
      BASIC_FALLBACK_WORKOUTS.forEach((name) => {
        if (uniqueWorkoutPool.length >= suitKeys.length) return;
        addWorkoutLabel(name);
      });
    }
    if (!uniqueWorkoutPool.length) {
      addWorkoutLabel("Wildcard Workout");
    }
    const shuffledUniquePool = shuffleList(uniqueWorkoutPool);
    while (shuffledUniquePool.length < suitKeys.length) {
      shuffledUniquePool.push(
        shuffledUniquePool[
          Math.floor(Math.random() * shuffledUniquePool.length)
        ]
      );
    }
    const workoutOverride = {};
    suitKeys.forEach((key, idx) => {
      const pick = shuffledUniquePool[idx];
      const normalizedPick = normalizeAssignmentValue(
        pick || EX_MAP[key] || ""
      );
      workoutOverride[key] =
        normalizedPick || normalizeAssignmentValue(EX_MAP[key]);
    });

    const jokerPool = (jokerLibrary || []).filter((row) => {
      const requiresWeights = (row.weights || "").toLowerCase() === "yes";
      return (
        row.include &&
        enabledLevels.includes(Number(row.difficulty)) &&
        (hasWeights || !requiresWeights)
      );
    });
    const fallbackJokers = (jokerLibrary || []).filter((row) => row.include);
    const finalJokers = jokerPool.length ? jokerPool : fallbackJokers;
    const jokerChoices = finalJokers
      .map((row) => (row.workout || "").trim())
      .filter(Boolean);

    setExMap(normalizeSuitAssignments(workoutOverride));
    setRandomJokerList(
      jokerChoices.length ? jokerChoices : ["Wildcard (Joker Workout)"]
    );
    setDeckSize(randomSettings.deckSize);
    setNumJokers(randomSettings.numJokers);
    setJokerSlots(jokerSlotsFromCount(randomSettings.numJokers));
    setAceHigh(!!randomSettings.aceHigh);
    setFaceCardMode(randomSettings.faceCardMode);
    resetDeck({
      numJokers: randomSettings.numJokers,
      deckSize: randomSettings.deckSize,
    });
    setActiveTab("workout");
  };

  const toggleRandomLevel = (level) => {
    setRandomSettings((prev) => ({
      ...prev,
      levels: { ...prev.levels, [level]: !prev.levels[level] },
    }));
  };

  const handleRandomOptionChange = (field, value) => {
    setRandomSettings((prev) => {
      if (field === "numJokers") {
        return { ...prev, numJokers: clampJokerCount(Number(value)) };
      }
      if (field === "includeFocus") {
        return { ...prev, includeFocus: value === "yes" };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleDeckSelectionChange = (deckId) => {
    setSelectedDeckId(deckId);
  };

  const handleDeckSuitChange = (deckId, suitKey, value) => {
    const normalizedValue = normalizeAssignmentValue(
      typeof value === "string" ? value.trim() : ""
    );
    setDeckPresets((prev) =>
      prev.map((deckPreset) =>
        deckPreset.id === deckId
          ? {
              ...deckPreset,
              suits: { ...deckPreset.suits, [suitKey]: normalizedValue },
            }
          : deckPreset
      )
    );
  };

  const handleDeckJokerModeChange = (deckId, slot, mode) => {
    const normalizedMode = mode === "random" ? "random" : "none";
    setDeckPresets((prev) =>
      prev.map((deckPreset) =>
        deckPreset.id === deckId
          ? {
              ...deckPreset,
              jokerSlots: { ...deckPreset.jokerSlots, [slot]: normalizedMode },
            }
          : deckPreset
      )
    );
  };

  const startCustomDeck = () => {
    setCustomDeckDraft(getCustomDeckTemplate());
  };

  const updateCustomDeckField = (field, value) => {
    setCustomDeckDraft((prev) => ({
      ...(prev || getCustomDeckTemplate()),
      [field]: value,
    }));
  };

  const updateCustomDeckSuit = (suitKey, value) => {
    const normalizedValue = normalizeAssignmentValue(
      typeof value === "string" ? value.trim() : ""
    );
    setCustomDeckDraft((prev) => ({
      ...(prev || getCustomDeckTemplate()),
      suits: {
        ...(prev?.suits || normalizeSuitAssignments(EX_MAP)),
        [suitKey]: normalizedValue,
      },
    }));
  };

  const updateCustomDeckJoker = (slot, mode) => {
    setCustomDeckDraft((prev) => ({
      ...(prev || getCustomDeckTemplate()),
      jokerSlots: {
        ...(prev?.jokerSlots || DEFAULT_JOKER_SLOTS),
        [slot]: mode === "random" ? "random" : "none",
      },
    }));
  };

  const saveCustomDeck = () => {
    if (!customDeckDraft) return;
    const trimmedName = (customDeckDraft.name || "").trim();
    if (!trimmedName) return;
    const baseSlug =
      trimmedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "custom";
    let slug = baseSlug;
    let counter = 1;
    while (deckPresets.some((deckPreset) => deckPreset.id === slug)) {
      slug = `${baseSlug}-${counter++}`;
    }
    const newDeck = {
      id: slug,
      name: trimmedName,
      suits: { ...(customDeckDraft.suits || normalizeSuitAssignments(EX_MAP)) },
      jokerSlots: normalizeJokerSlots(customDeckDraft.jokerSlots),
    };
    setDeckPresets((prev) => [...prev, newDeck]);
    setCustomDeckDraft(null);
    setSelectedDeckId(slug);
  };

  const deckOptions = deckPresets.map((deckPreset) => ({
    value: deckPreset.id,
    label: deckPreset.name,
  }));
  const isEndOfDeck = current?.id === "end";
  const [isScrolledToTop, setIsScrolledToTop] = useState(true);
  const disableScrollDuringWorkout =
    activeTab === "workout" && hasStarted && !isEndOfDeck;
  const shouldLockScroll = disableScrollDuringWorkout && isScrolledToTop;
  const CARD_ASPECT_RATIO = 2.5 / 3.5;
  const CARD_HEIGHT_CUSHION_PX = 240;
  const cardMaxHeight = `calc(100vh - ${CARD_HEIGHT_CUSHION_PX}px)`;
  const cardMaxWidth = `min(720px, calc((100vh - ${CARD_HEIGHT_CUSHION_PX}px) * ${CARD_ASPECT_RATIO.toFixed(
    4
  )}))`;

  React.useEffect(() => {
    if (!disableScrollDuringWorkout) {
      setIsScrolledToTop(true);
      return;
    }
    const handleScroll = () => {
      const y = typeof window !== "undefined" ? window.scrollY || 0 : 0;
      setIsScrolledToTop(y <= 0);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [disableScrollDuringWorkout]);

  React.useEffect(() => {
    if (shouldLockScroll && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [shouldLockScroll]);

  // Lock body scroll during active workouts to avoid stray page scrolling
  React.useEffect(() => {
    if (shouldLockScroll && typeof document !== "undefined") {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow =
        typeof document !== "undefined"
          ? document.documentElement.style.overflow
          : "";
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
    return undefined;
  }, [disableScrollDuringWorkout]);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-start bg-gray-900 text-white p-4 ${
        shouldLockScroll ? "overflow-hidden" : ""
      }`}
      style={shouldLockScroll ? { overflowY: "hidden" } : {}}
    >
      <div className="w-full max-w-3xl flex flex-col items-center gap-6">
        <div className="w-full flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div
              className="flex w-full sm:w-auto rounded-full p-1 border"
              style={{
                backgroundColor: "#08112A",
                borderColor: "rgba(255,255,255,0.35)",
              }}
            >
              {APP_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-5 py-2 rounded-full border font-semibold tracking-wide transition-all ${
                    activeTab === tab.key ? "shadow-lg" : "hover:opacity-90"
                  }`}
                  style={
                    activeTab === tab.key
                      ? {
                          backgroundColor: "#1d3a8a",
                          borderColor: "#ffffff",
                          color: "#ffffff",
                          fontSize: `${TAB_FONT_SIZE_PX}px`,
                        }
                      : {
                          backgroundColor: "#0b1f49",
                          borderColor: "rgba(255,255,255,0.6)",
                          color: "#ffffff",
                          fontSize: `${TAB_FONT_SIZE_PX}px`,
                        }
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col items-center">
          {activeTab === "settings" && (
            <Settings
              deckSize={deckSize}
              setDeckSize={setDeckSize}
              aceHigh={aceHigh}
              setAceHigh={setAceHigh}
              faceCardMode={faceCardMode}
              setFaceCardMode={setFaceCardMode}
              keepScreenAwake={keepScreenAwake}
              setKeepScreenAwake={setKeepScreenAwake}
              resetDeck={resetDeck}
              deckPresets={deckPresets}
              workoutOptions={workoutOptions}
              onDeckSuitChange={handleDeckSuitChange}
              onDeckJokerChange={handleDeckJokerModeChange}
              onDeleteDeck={(id) => {
                setDeckPresets((prev) => prev.filter((deck) => deck.id !== id));
                setSelectedDeckId((prevId) =>
                  prevId === id ? "standard" : prevId
                );
              }}
              onStartAddCustomDeck={startCustomDeck}
              customDeckDraft={customDeckDraft}
              onCustomDeckFieldChange={updateCustomDeckField}
              onCustomDeckSuitChange={updateCustomDeckSuit}
              onCustomDeckJokerChange={updateCustomDeckJoker}
              onSaveCustomDeck={saveCustomDeck}
              onCancelCustomDeck={() => setCustomDeckDraft(null)}
            />
          )}

          {activeTab === "workouts" && (
            <>
              <LibraryTable
                rows={workoutLibrary}
                onToggleInclude={(idx) => toggleIncludeRow("workouts", idx)}
                newEntry={newWorkoutEntry}
                onNewEntryChange={(field, value) =>
                  handleNewEntryChange("workouts", field, value)
                }
                onAddEntry={() => addCustomEntry("workouts")}
                addLabel="Add Workout"
                showMultiplierSelect
                multiplierOptions={WORKOUT_MULTIPLIER_OPTIONS}
                isEditing={isEditingWorkouts}
                editRows={editableWorkoutRows}
                onEditRowChange={handleEditWorkoutChange}
                onDeleteRow={handleDeleteEditableWorkout}
              />
              <div className="w-full flex flex-wrap justify-end gap-3 mt-4">
                {isEditingWorkouts ? (
                  <>
                    <button
                      type="button"
                      onClick={cancelWorkoutLibraryEdits}
                      className="px-5 py-2 rounded-lg border border-white/40 text-white font-semibold text-sm hover:bg-white/10"
                    >
                      Cancel Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveWorkoutEdits}
                      className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-500"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={startEditingWorkoutLibrary}
                    className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500"
                  >
                    Edit Workouts
                  </button>
                )}
              </div>
            </>
          )}
          {activeTab === "jokers" && (
            <>
              <LibraryTable
                rows={jokerLibrary}
                onToggleInclude={(idx) => toggleIncludeRow("jokers", idx)}
                newEntry={newJokerEntry}
                onNewEntryChange={(field, value) =>
                  handleNewEntryChange("jokers", field, value)
                }
                onAddEntry={() => addCustomEntry("jokers")}
                addLabel="Add Joker Workout"
                isEditing={isEditingJokers}
                editRows={editableJokerRows}
                onEditRowChange={handleEditJokerChange}
                onDeleteRow={handleDeleteEditableJoker}
              />
              <div className="w-full flex flex-wrap justify-end gap-3 mt-4">
                {isEditingJokers ? (
                  <>
                    <button
                      type="button"
                      onClick={cancelJokerLibraryEdits}
                      className="px-5 py-2 rounded-lg border border-white/40 text-white font-semibold text-sm hover:bg-white/10"
                    >
                      Cancel Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveJokerEdits}
                      className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-500"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={startEditingJokerLibrary}
                    className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500"
                  >
                    Edit Jokers
                  </button>
                )}
              </div>
            </>
          )}

          {activeTab === "history" && (
            <History
              entries={workoutHistory}
              onDeleteEntries={handleDeleteHistoryEntries}
            />
          )}

          {activeTab === "workout" && (
            <>
              {!hasStarted && (
                <p
                  className="mb-4 text-center text-base"
                  style={{ color: "#ffffff" }}
                >
                  Tap the card to start your selected deck or randomize a
                  workout below.
                </p>
              )}

              {!hasStarted && (
                <div className="w-full max-w-md mb-4 flex items-center gap-3">
                  <label
                    className="text-sm font-semibold whitespace-nowrap"
                    style={{ color: "#ffffff" }}
                  >
                    Your Selected Deck
                  </label>
                  <select
                    className="flex-1 border rounded-lg p-2 bg-white text-black"
                    value={selectedDeckId}
                    onChange={(e) => handleDeckSelectionChange(e.target.value)}
                  >
                    {deckOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div
                onClick={handleCardClick}
                className={`w-full transition-transform duration-200 ease-in-out ${
                  flipped ? "scale-90 opacity-0" : "scale-100 opacity-100"
                }`}
                style={{
                  maxHeight: cardMaxHeight,
                  maxWidth: cardMaxWidth,
                  width: "100%",
                  margin: "0 auto",
                }}
              >
                <CardFace
                  card={current}
                  reps={repsFor(current)}
                  workout={exerciseFor(current)}
                  showBack={showBack}
                  preWorkoutOverlay={preWorkoutOverlay}
                  maxHeight={cardMaxHeight}
                  maxWidth={cardMaxWidth}
                  isFlipped={!!current}
                />
              </div>

              <button
                type="button"
                onClick={handlePreviousCard}
                disabled={!canGoToPreviousCard}
                className="mt-3 self-start px-4 py-2 rounded-lg border border-white/30 bg-white/10 text-white text-sm font-semibold hover:bg-white/20 disabled:cursor-not-allowed inline-flex"
                style={{
                  opacity: canGoToPreviousCard ? 1 : 0,
                  backgroundColor: canGoToPreviousCard
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                  color: canGoToPreviousCard ? "#ffffff" : "transparent",
                  borderColor: canGoToPreviousCard
                    ? "rgba(255,255,255,0.3)"
                    : "transparent",
                }}
              >
                Previous Card
              </button>

              {isEndOfDeck && (
                <>
                  <div
                    className="mt-4 w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-4 text-sm"
                    style={{ color: "#ffffff" }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {SUIT_KEYS.map((key) => (
                        <div key={`summary-${key}`} className="flex flex-col">
                          <span className="text-sm font-semibold">
                            {getAssignmentLabel(exMap[key]) || "Workout"} -{" "}
                            {workoutStats.suits[key] || 0} reps
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 font-semibold">
                      Total Reps: {totalRepsCompleted}
                    </div>
                    <div className="mt-2 text-sm text-white/80">
                      <span className="font-semibold text-white">Jokers:</span>{" "}
                      {workoutStats.jokers.length
                        ? workoutStats.jokers.join(", ")
                        : "No Jokers Drawn"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => resetDeck()}
                    className="mt-4 w-full max-w-md px-4 py-2 bg-blue-600 rounded-lg text-white text-sm font-semibold hover:bg-blue-500"
                  >
                    Reset Deck
                  </button>
                </>
              )}

              <div
                className="mt-8 text-xs text-white text-center"
                style={{ color: "#ffffff" }}
              >{`${progressIndex}/${totalCards}`}</div>

              {!hasStarted && (
                <div className="w-full mt-8 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-5">
                  <div>
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: "#ffffff" }}
                    >
                      Random Workout Settings
                    </h3>
                  </div>

                  <div>
                    <div className="flex flex-col gap-3 mt-2">
                      {[1, 2, 3].map((level) => (
                        <label
                          key={level}
                          className="flex items-center gap-2 text-sm"
                          style={{ color: "#ffffff" }}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-blue-500"
                            checked={!!randomSettings.levels[level]}
                            onChange={() => toggleRandomLevel(level)}
                          />
                          <span>{`Include Level ${level}`}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className="w-48 text-right font-semibold"
                      style={{ color: "#ffffff" }}
                    >
                      Do you have gym/weights access?
                    </span>
                    <select
                      className="flex-1 min-w-[160px] border p-2 rounded bg-white text-black"
                      value={randomSettings.gymAccess}
                      onChange={(e) =>
                        handleRandomOptionChange("gymAccess", e.target.value)
                      }
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className="w-48 text-right font-semibold"
                      style={{ color: "#ffffff" }}
                    >
                      Include "Focus" areas in random draw?
                    </span>
                    <select
                      className="flex-1 min-w-[160px] border p-2 rounded bg-white text-black"
                      value={randomSettings.includeFocus ? "yes" : "no"}
                      onChange={(e) =>
                        handleRandomOptionChange("includeFocus", e.target.value)
                      }
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className="w-48 text-right font-semibold"
                        style={{ color: "#ffffff" }}
                      >
                        Deck Size
                      </span>
                      <select
                        className="flex-1 min-w-[160px] border p-2 rounded bg-white text-black"
                        value={randomSettings.deckSize}
                        onChange={(e) =>
                          handleRandomOptionChange("deckSize", e.target.value)
                        }
                      >
                        <option value="quarter">Quarter</option>
                        <option value="half">Half</option>
                        <option value="threequarters">Three Quarters</option>
                        <option value="full">Full</option>
                      </select>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className="w-48 text-right font-semibold"
                        style={{ color: "#ffffff" }}
                      >
                        Ace Value (reps)
                      </span>
                      <select
                        className="flex-1 min-w-[160px] border p-2 rounded bg-white text-black"
                        value={randomSettings.aceHigh ? "14" : "1"}
                        onChange={(e) =>
                          handleRandomOptionChange(
                            "aceHigh",
                            e.target.value === "14"
                          )
                        }
                      >
                        <option value="1">Ace = 1</option>
                        <option value="14">Ace = 14</option>
                      </select>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className="w-48 text-right font-semibold"
                        style={{ color: "#ffffff" }}
                      >
                        Face Card Value
                      </span>
                      <select
                        className="flex-1 min-w-[160px] border p-2 rounded bg-white text-black"
                        value={randomSettings.faceCardMode}
                        onChange={(e) =>
                          handleRandomOptionChange(
                            "faceCardMode",
                            e.target.value
                          )
                        }
                      >
                        <option value="ten">J/Q/K = 10</option>
                        <option value="progressive">J/Q/K = 11/12/13</option>
                      </select>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className="w-48 text-right font-semibold"
                        style={{ color: "#ffffff" }}
                      >
                        Number of Jokers
                      </span>
                      <select
                        className="flex-1 min-w-[160px] border p-2 rounded bg-white text-black"
                        value={randomSettings.numJokers}
                        onChange={(e) =>
                          handleRandomOptionChange(
                            "numJokers",
                            Number(e.target.value)
                          )
                        }
                      >
                        {[0, 1, 2].map((i) => (
                          <option key={i} value={i}>
                            {i} {i === 1 ? "Joker" : "Jokers"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={startRandomWorkout}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500"
                  >
                    Randomize Workout
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
