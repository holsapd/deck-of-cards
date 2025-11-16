import React, { useState } from "react";
import CardFace from "./components/CardFace";
import Settings from "./components/Settings";
import LibraryTable from "./components/LibraryTable";
import History from "./components/History";
import {
  DEFAULT_CUSTOM_ENTRY,
  WORKOUT_LIBRARY_DATA,
  JOKER_LIBRARY_DATA,
} from "./constants/libraryConfig";
import { makeDeckV2, DECK_SIZE_LIMITS } from "./utils/deck";

const APP_TABS = [
  { key: "workout", label: "Current Deck" },
  { key: "workouts", label: "Workouts" },
  { key: "jokers", label: "Jokers" },
  { key: "history", label: "History" },
  { key: "settings", label: "Settings" },
];

function mergeLibrary(defaultRows, savedRows) {
  if (!Array.isArray(savedRows)) return defaultRows;
  const merged = [];
  const seen = new Set();

  savedRows.forEach((saved) => {
    if (!saved || !saved.workout) return;
    const match = defaultRows.find((row) => row.workout === saved.workout);
    if (match) {
      merged.push({
        ...match,
        ...saved,
        include:
          typeof saved.include === "boolean" ? saved.include : match.include,
        difficulty: Number(saved.difficulty) || match.difficulty,
        focus: saved.focus || match.focus,
        weights: saved.weights || match.weights,
      });
    } else {
      merged.push({
        include: typeof saved.include === "boolean" ? saved.include : true,
        workout: saved.workout,
        difficulty: Number(saved.difficulty) || 1,
        focus: saved.focus || "Full Body",
        weights: saved.weights || "No",
      });
    }
    seen.add(saved.workout);
  });

  defaultRows.forEach((row) => {
    if (!seen.has(row.workout)) merged.push(row);
  });

  return merged;
}
// Top-level exercise map keyed by Unicode escapes
export const EX_MAP = {
  "\u2660": "Lunges",
  "\u2665": "Squats",
  "\u2666": "Push-ups",
  "\u2663": "Sit-ups",
};

const DEFAULT_EXERCISES = {
  "\u2660": "Lunges",
  "\u2665": "Squats",
  "\u2666": "Push-ups",
  "\u2663": "Sit-ups",
  JOKER: "2 min plank hold",
};

// Normalized exercise map keyed by Unicode suits
const EXERCISES = {
  "\u2660": "Lunges",
  "\u2665": "Squats",
  "\u2666": "Push-ups",
  "\u2663": "Sit-ups",
};

const BASIC_FALLBACK_WORKOUTS = ["Push-ups", "Sit-ups", "Squats", "Lunges"];
const SUIT_KEYS = ["\u2660", "\u2665", "\u2666", "\u2663"];
const SUIT_LABELS = {
  "\u2660": "Spades",
  "\u2665": "Hearts",
  "\u2666": "Diamonds",
  "\u2663": "Clubs",
};

function createInitialStats() {
  const suits = {};
  SUIT_KEYS.forEach((key) => {
    suits[key] = 0;
  });
  return { suits, jokers: [] };
}

const DEFAULT_JOKER_SLOTS = { 1: "random", 2: "none" };

const DEFAULT_DECK_PRESETS = [
  {
    id: "standard",
    name: "Standard Deck",
    suits: { ...DEFAULT_EXERCISES },
    jokerSlots: { 1: "random", 2: "none" },
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
    suits: { ...deck.suits },
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
        ? entry.suits[key] || entry.suits[String(key)]
        : "";
    suits[key] = value || DEFAULT_EXERCISES[key] || "";
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
    suits: { ...DEFAULT_EXERCISES },
    jokerSlots: { ...DEFAULT_JOKER_SLOTS },
  };
}

export default function DeckOfCardsWorkout() {
  const initialDeck = React.useMemo(() => makeDeckV2(1, "full"), []);
  const [deckPresets, setDeckPresets] = useState(getDefaultDeckPresets());
  const [selectedDeckId, setSelectedDeckId] = useState("standard");
  const [customDeckDraft, setCustomDeckDraft] = useState(null);
  const [numJokers, setNumJokers] = useState(1);
  const [jokerSlots, setJokerSlots] = useState({ ...DEFAULT_JOKER_SLOTS });
  const [deckSize, setDeckSize] = useState("full");
  const [deck, setDeck] = useState(initialDeck);
  const [totalCards, setTotalCards] = useState(initialDeck.length);
  const [current, setCurrent] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [exMap, setExMap] = useState(EX_MAP);
  const [workoutLibrary, setWorkoutLibrary] = useState(WORKOUT_LIBRARY_DATA);
  const [jokerLibrary, setJokerLibrary] = useState(JOKER_LIBRARY_DATA);
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
  const [randomSettings, setRandomSettings] = useState({
    levels: { 1: true, 2: false, 3: false },
    gymAccess: "no",
    deckSize: "full",
    aceHigh: false,
    faceCardMode: "progressive",
    numJokers: 1,
  });
  const [workoutStats, setWorkoutStats] = useState(() => createInitialStats());
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [currentWorkoutName, setCurrentWorkoutName] = useState("Standard Deck");
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [keepScreenAwake, setKeepScreenAwake] = useState(false);
  const wakeLockRef = React.useRef(null);

  const availableJokerWorkouts = React.useMemo(() => {
    if (randomJokerList && randomJokerList.length) return randomJokerList;
    return (jokerLibrary || [])
      .filter((row) => row.include)
      .map((row) => (row.workout || "").trim())
      .filter(Boolean);
  }, [jokerLibrary, randomJokerList]);

  const workoutOptions = React.useMemo(() => {
    const names = new Set();
    (workoutLibrary || []).forEach((row) => {
      const name = (row.workout || "").trim();
      if (name) names.add(name);
    });
    deckPresets.forEach((deckPreset) => {
      Object.values(deckPreset.suits || {}).forEach((name) => {
        const trimmed = (name || "").trim();
        if (trimmed) names.add(trimmed);
      });
    });
    if (!names.size) {
      BASIC_FALLBACK_WORKOUTS.forEach((fallback) => names.add(fallback));
    }
    return Array.from(names).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
  }, [deckPresets, workoutLibrary]);

  const syncDeckSelection = React.useCallback(
    (targetId) => {
      const deckId = targetId || selectedDeckId;
      const preset =
        deckPresets.find((d) => d.id === deckId) || deckPresets[0] || null;
      if (!preset) return;
      setExMap({ ...preset.suits });
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
      const raw = localStorage.getItem("docw_settings");
      if (!raw) return;
      const s = JSON.parse(raw);
      if (Array.isArray(s.deckPresets)) {
        const merged = mergeDeckPresets(s.deckPresets);
        setDeckPresets(merged);
        if (typeof s.selectedDeckId === "string") {
          setSelectedDeckId(s.selectedDeckId);
          const preset =
            merged.find((d) => d.id === s.selectedDeckId) || merged[0];
          if (preset) {
            setExMap({ ...preset.suits });
            const slots = { ...preset.jokerSlots };
            setJokerSlots(slots);
            setNumJokers(countActiveJokers(slots));
            setCurrentWorkoutName(preset.name || "Custom Deck");
          }
        }
      } else {
        if (typeof s.numJokers === "number") {
          const clamped = clampJokerCount(s.numJokers);
          setNumJokers(clamped);
          setJokerSlots(jokerSlotsFromCount(clamped));
        }
      }
      if (
        typeof s.deckSize === "string" &&
        DECK_SIZE_LIMITS[s.deckSize] !== undefined
      )
        setDeckSize(s.deckSize);
      if (s.exMap && typeof s.exMap === "object") setExMap(s.exMap);
      if (Array.isArray(s.workoutLibrary))
        setWorkoutLibrary(mergeLibrary(WORKOUT_LIBRARY_DATA, s.workoutLibrary));
      if (Array.isArray(s.jokerLibrary))
        setJokerLibrary(mergeLibrary(JOKER_LIBRARY_DATA, s.jokerLibrary));
      if (typeof s.aceHigh === "boolean") setAceHigh(s.aceHigh);
      if (
        typeof s.faceCardMode === "string" &&
        ["ten", "progressive"].includes(s.faceCardMode)
      )
        setFaceCardMode(s.faceCardMode);
      if (typeof s.keepScreenAwake === "boolean")
        setKeepScreenAwake(s.keepScreenAwake);
      if (typeof s.selectedDeckId === "string") {
        setSelectedDeckId(s.selectedDeckId);
      }
      if (Array.isArray(s.workoutHistory)) setWorkoutHistory(s.workoutHistory);
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
  React.useEffect(() => {
    try {
      const data = {
        deckPresets,
        selectedDeckId,
        numJokers,
        deckSize,
        exMap,
        workoutLibrary,
        jokerLibrary,
        aceHigh,
        faceCardMode,
        jokerSlots,
        workoutHistory,
        keepScreenAwake,
      };
      localStorage.setItem("docw_settings", JSON.stringify(data));
    } catch {}
  }, [
    deckPresets,
    selectedDeckId,
    numJokers,
    deckSize,
    exMap,
    workoutLibrary,
    jokerLibrary,
    aceHigh,
    faceCardMode,
    jokerSlots,
    workoutHistory,
    keepScreenAwake,
  ]);

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
    if (next.rank === "Joker") {
      const choices = availableJokerWorkouts;
      const picked = choices.length
        ? choices[Math.floor(Math.random() * choices.length)]
        : "Wildcard (Joker Workout)";
      next.jokerWorkoutPick = picked;
      setWorkoutStats((prev) => ({
        suits: { ...prev.suits },
        jokers: [...prev.jokers, picked],
      }));
    } else {
      const repsValue = repsFor(next);
      setWorkoutStats((prev) => {
        const suits = { ...prev.suits };
        suits[next.suit] = (suits[next.suit] || 0) + repsValue;
        return { suits, jokers: prev.jokers };
      });
    }
    setDeck((d) => d.slice(1));
    setCurrent(next);
  }

  function handleCardClick() {
    setHasStarted(true);
    setFlipped(true);
    setTimeout(() => {
      setFlipped(false);
      drawCard();
    }, 200);
  }

  const repsFor = (card) => {
    if (!card || card.rank === "Joker" || card.rank === "BACK") return 0;
    const faceValues =
      faceCardMode === "ten"
        ? { J: 10, Q: 10, K: 10 }
        : { J: 11, Q: 12, K: 13 };
    const base = isNaN(card.rank)
      ? { A: aceHigh ? 14 : 1, ...faceValues }[card.rank]
      : Number(card.rank);
    return base || 0;
  };

  const exerciseFor = (card) => {
    if (!card) return "";
    if (card.rank === "Joker")
      return card.jokerWorkoutPick || "Wildcard (Joker Workout)";
    return exMap[card.suit] || "";
  };
  const showBack = !current || current.rank === "BACK";
  const preWorkoutOverlay = React.useMemo(() => {
    if (current) return null;
    const exercises = SUIT_KEYS.map((key, idx) => {
      const name = (exMap[key] || "").trim();
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
  const isEndOfDeck = current?.id === "end";
  const progressIndex = Math.min(
    totalCards,
    Math.max(0, totalCards - deck.length)
  );
  const currentCardId = current?.id;
  const totalRepsCompleted = SUIT_KEYS.reduce(
    (sum, key) => sum + (workoutStats.suits[key] || 0),
    0
  );

  React.useEffect(() => {
    if (currentCardId !== "end" || workoutCompleted) return;
    const suitDetails = SUIT_KEYS.map((key) => ({
      key,
      suit: SUIT_LABELS[key],
      workout: exMap[key] || "",
      reps: workoutStats.suits[key] || 0,
    }));
    const totalReps = suitDetails.reduce((sum, item) => sum + item.reps, 0);
    const entry = {
      id: Date.now(),
      completedAt: new Date().toISOString(),
      workoutName: currentWorkoutName || "Custom Deck",
      suits: suitDetails,
      totalReps,
      jokers: [...workoutStats.jokers],
    };
    setWorkoutHistory((prev) => [entry, ...prev]);
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
    const setter = type === "workouts" ? setWorkoutLibrary : setJokerLibrary;
    const resetSetter =
      type === "workouts" ? setNewWorkoutEntry : setNewJokerEntry;

    const trimmedWorkout = (entry.workout || "").trim();
    if (!trimmedWorkout) return;

    const newRow = {
      include: true,
      workout: trimmedWorkout,
      difficulty: Number(entry.difficulty) || 1,
      focus: entry.focus || "Full Body",
      weights: entry.weights || "No",
    };
    setter((rows) => [...rows, newRow]);
    resetSetter({ ...DEFAULT_CUSTOM_ENTRY });
  };

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
    const suitKeys = Object.keys(EX_MAP);
    const uniqueWorkoutPool = [];
    const usedWorkoutNames = new Set();
    finalWorkoutPool.forEach((row) => {
      const name = (row.workout || "").trim();
      if (!name || usedWorkoutNames.has(name)) return;
      usedWorkoutNames.add(name);
      uniqueWorkoutPool.push(row);
    });
    if (uniqueWorkoutPool.length < suitKeys.length) {
      BASIC_FALLBACK_WORKOUTS.forEach((name) => {
        if (uniqueWorkoutPool.length >= suitKeys.length) return;
        if (!usedWorkoutNames.has(name)) {
          usedWorkoutNames.add(name);
          uniqueWorkoutPool.push({ workout: name });
        }
      });
    }
    if (!uniqueWorkoutPool.length) {
      uniqueWorkoutPool.push({ workout: "Wildcard Workout" });
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
      workoutOverride[key] = pick?.workout || EX_MAP[key];
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

    setExMap(workoutOverride);
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
    setRandomSettings((prev) => ({
      ...prev,
      [field]: field === "numJokers" ? Number(value) : value,
    }));
  };

  const handleDeckSelectionChange = (deckId) => {
    setSelectedDeckId(deckId);
  };

  const handleDeckSuitChange = (deckId, suitKey, value) => {
    setDeckPresets((prev) =>
      prev.map((deckPreset) =>
        deckPreset.id === deckId
          ? {
              ...deckPreset,
              suits: { ...deckPreset.suits, [suitKey]: value },
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
    setCustomDeckDraft((prev) => ({
      ...(prev || getCustomDeckTemplate()),
      suits: { ...(prev?.suits || DEFAULT_EXERCISES), [suitKey]: value },
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
      suits: { ...(customDeckDraft.suits || DEFAULT_EXERCISES) },
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-900 text-white p-4">
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
                  className={`flex-1 px-5 py-2 rounded-full border font-semibold tracking-wide text-sm transition-all ${
                    activeTab === tab.key ? "shadow-lg" : "hover:opacity-90"
                  }`}
                  style={
                    activeTab === tab.key
                      ? {
                          backgroundColor: "#1d3a8a",
                          borderColor: "#ffffff",
                          color: "#ffffff",
                        }
                      : {
                          backgroundColor: "#0b1f49",
                          borderColor: "rgba(255,255,255,0.6)",
                          color: "#ffffff",
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
            <LibraryTable
              rows={workoutLibrary}
              onToggleInclude={(idx) => toggleIncludeRow("workouts", idx)}
              newEntry={newWorkoutEntry}
              onNewEntryChange={(field, value) =>
                handleNewEntryChange("workouts", field, value)
              }
              onAddEntry={() => addCustomEntry("workouts")}
              addLabel="Add Workout"
            />
          )}
          {activeTab === "jokers" && (
            <LibraryTable
              rows={jokerLibrary}
              onToggleInclude={(idx) => toggleIncludeRow("jokers", idx)}
              newEntry={newJokerEntry}
              onNewEntryChange={(field, value) =>
                handleNewEntryChange("jokers", field, value)
              }
              onAddEntry={() => addCustomEntry("jokers")}
              addLabel="Add Joker Workout"
            />
          )}

          {activeTab === "history" && <History entries={workoutHistory} />}

          {activeTab === "workout" && (
            <>
              {!hasStarted && (
                <p
                  className="mb-4 text-center text-sm"
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
              >
                <CardFace
                  card={current}
                  reps={repsFor(current)}
                  workout={exerciseFor(current)}
                  showBack={showBack}
                  preWorkoutOverlay={preWorkoutOverlay}
                  isFlipped={!!current}
                />
              </div>

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
                            {exMap[key] || "Workout"} -{" "}
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
