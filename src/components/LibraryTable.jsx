import React from "react";
import {
  TABLE_COLUMNS,
  COLUMN_STYLES,
  LEVEL_OPTIONS,
  FOCUS_OPTIONS,
  WEIGHT_OPTIONS,
  WORKOUT_MULTIPLIER_OPTIONS,
} from "../constants/libraryConfig";

// temporary for updating Git
export default function LibraryTable({
  rows,
  onToggleInclude,
  newEntry,
  onNewEntryChange,
  onAddEntry,
  addLabel,
  showMultiplierSelect = false,
  multiplierOptions = WORKOUT_MULTIPLIER_OPTIONS,
  isEditing = false,
  editRows = null,
  onEditRowChange,
  onDeleteRow,
}) {
  const displayedRows = React.useMemo(() => {
    if (isEditing && Array.isArray(editRows)) {
      return editRows;
    }
    return rows || [];
  }, [editRows, isEditing, rows]);

  const hasDeleteColumn = isEditing && typeof onDeleteRow === "function";
  const showIncludeColumn = !isEditing;

  const columnDefs = React.useMemo(() => {
    if (!isEditing) return TABLE_COLUMNS;
    const baseColumns = TABLE_COLUMNS.filter((col) => col.key !== "include");
    const extended = [...baseColumns, { key: "difficulty", label: "Level" }];
    if (showMultiplierSelect) {
      extended.push({ key: "multiplier", label: "Mult" });
    }
    if (hasDeleteColumn) {
      extended.push({ key: "actions", label: "Del" });
    }
    return extended;
  }, [hasDeleteColumn, isEditing, showMultiplierSelect]);

  const clampLevel = (value) =>
    Math.min(3, Math.max(1, Number(value) || 1));

  const groupedByLevel = React.useMemo(() => {
    const groups = { 1: [], 2: [], 3: [] };
    displayedRows.forEach((row, idx) => {
      const level = clampLevel(row.difficulty);
      groups[level].push({ row, idx });
    });
    return groups;
  }, [displayedRows]);

  const renderTableBody = (levelRows) => {
    if (!levelRows.length) {
      return (
        <tr>
          <td
            colSpan={columnDefs.length}
            className="px-3 sm:px-4 py-4 text-center text-white/70"
            style={{ borderColor: "rgba(255,255,255,0.35)" }}
          >
            No workouts saved for this level yet.
          </td>
        </tr>
      );
    }

    return levelRows.map(({ row, idx }) => {
      const focusValue = row.focus || FOCUS_OPTIONS[0];
      const weightsValue = row.weights || WEIGHT_OPTIONS[0].value;
      const multiplierValue = Number(row.multiplier) || 1;
      const difficultyValue = clampLevel(row.difficulty);
      const editKey = row._editId ?? idx;

      const handleIncludeToggle = () => {
        if (isEditing) {
          onEditRowChange?.(idx, "include", !row.include);
        } else {
          onToggleInclude?.(idx);
        }
      };

      const inputProps =
        "w-full px-2 py-1.5 rounded bg-white/90 text-black text-xs sm:text-sm";

      return (
        <tr
          key={isEditing ? `edit-${editKey}` : `${row.workout}-${idx}`}
          className="hover:bg-white/5"
        >
          {showIncludeColumn && (
            <td
              className="px-3 sm:px-4 py-2 align-top border border-white/30"
              style={{
                ...COLUMN_STYLES.include,
                color: "#ffffff",
                borderColor: "rgba(255,255,255,0.35)",
              }}
            >
              <input
                type="checkbox"
                checked={!!row.include}
                onChange={handleIncludeToggle}
                className="h-5 w-5 accent-blue-500 cursor-pointer"
                aria-label={`Include ${row.workout}`}
              />
            </td>
          )}
          <td
            className="px-3 sm:px-4 py-2 whitespace-normal break-words border border-white/30"
            style={{
              ...COLUMN_STYLES.workout,
              color: "#ffffff",
              borderColor: "rgba(255,255,255,0.35)",
            }}
          >
            {isEditing ? (
              <input
                className={inputProps}
                value={row.workout || ""}
                onChange={(e) =>
                  onEditRowChange?.(idx, "workout", e.target.value)
                }
                placeholder="Workout name"
              />
            ) : (
              row.workout
            )}
          </td>
          <td
            className="px-3 sm:px-4 py-2 whitespace-normal break-words border border-white/30"
            style={{
              ...COLUMN_STYLES.focus,
              color: "#ffffff",
              borderColor: "rgba(255,255,255,0.35)",
            }}
          >
            {isEditing ? (
              <select
                className={inputProps}
                value={focusValue}
                onChange={(e) =>
                  onEditRowChange?.(idx, "focus", e.target.value)
                }
              >
                {FOCUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              row.focus
            )}
          </td>
          <td
            className="px-3 sm:px-4 py-2 border border-white/30"
            style={{
              ...COLUMN_STYLES.weights,
              color: "#ffffff",
              borderColor: "rgba(255,255,255,0.35)",
            }}
          >
            {isEditing ? (
              <select
                className={inputProps}
                value={weightsValue}
                onChange={(e) =>
                  onEditRowChange?.(idx, "weights", e.target.value)
                }
              >
                {WEIGHT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              row.weights
            )}
          </td>
          {isEditing && (
            <td
              className="px-3 sm:px-4 py-2 border border-white/30"
              style={{
                ...COLUMN_STYLES.level,
                color: "#ffffff",
                borderColor: "rgba(255,255,255,0.35)",
              }}
            >
              <select
                className={inputProps}
                value={difficultyValue}
                onChange={(e) =>
                  onEditRowChange?.(
                    idx,
                    "difficulty",
                    Number(e.target.value)
                  )
                }
              >
                {LEVEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </td>
          )}
          {isEditing && showMultiplierSelect && (
            <td
              className="px-3 sm:px-4 py-2 border border-white/30"
              style={{
                ...COLUMN_STYLES.multiplier,
                color: "#ffffff",
                borderColor: "rgba(255,255,255,0.35)",
              }}
            >
              <select
                className={inputProps}
                value={multiplierValue}
                onChange={(e) =>
                  onEditRowChange?.(
                    idx,
                    "multiplier",
                    Number(e.target.value) || 1
                  )
                }
              >
                {multiplierOptions.map((value) => (
                  <option key={`edit-mult-${value}`} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </td>
          )}
          {hasDeleteColumn && (
            <td
              className="px-3 sm:px-4 py-2 border border-white/30"
              style={{
                ...COLUMN_STYLES.actions,
                color: "#ffffff",
                borderColor: "rgba(255,255,255,0.35)",
              }}
            >
              <button
                type="button"
                onClick={() => onDeleteRow?.(idx)}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-500"
                aria-label={`Delete ${row.workout || "workout"}`}
              >
                X
              </button>
            </td>
          )}
        </tr>
      );
    });
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {[1, 2, 3].map((level) => (
        <div key={level} className="flex flex-col gap-2">
          <div
            className="flex items-center justify-between"
            style={{ color: "#ffffff" }}
          >
            <h3 className="text-lg font-semibold">Level {level}</h3>
            <span className="text-sm text-white/70">
              {groupedByLevel[level].length} workouts
            </span>
          </div>
          <div className="w-full overflow-auto rounded-2xl border border-white/20 bg-white/5">
            <table
              className="min-w-full text-[0.75rem] sm:text-sm leading-snug text-white"
              style={{
                color: "#ffffff",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontWeight: 400,
              }}
            >
              <thead
                className="bg-white/10 text-[0.7rem] sm:text-xs uppercase tracking-wide"
                style={{
                  color: "#ffffff",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontWeight: 600,
                }}
              >
                <tr>
                  {columnDefs.map((col) => (
                    <th
                      key={col.key}
                      className="px-3 sm:px-4 py-2 text-left whitespace-normal break-words border border-white/30"
                      style={{
                        ...COLUMN_STYLES[col.key],
                        color: "#ffffff",
                        borderColor: "rgba(255,255,255,0.35)",
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody
                className="divide-y divide-white/10"
                style={{
                  color: "#ffffff",
                  fontFamily: "Arial, Helvetica, sans-serif",
                }}
              >
                {renderTableBody(groupedByLevel[level])}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
        <h3
          className="text-sm font-semibold uppercase"
          style={{ letterSpacing: "0.08em", color: "#ffffff" }}
        >
          Add Custom Entry
        </h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="text-xs uppercase tracking-wide"
              style={{ color: "#ffffff", width: 140, textAlign: "right" }}
            >
              Workout
            </span>
            <input
              className="flex-1 min-w-[180px] px-3 py-2 rounded bg-white/90 text-black text-sm"
              placeholder="Workout name"
              value={newEntry.workout}
              onChange={(e) => onNewEntryChange("workout", e.target.value)}
            />
          </div>
          {showMultiplierSelect && (
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="text-xs uppercase tracking-wide"
                style={{ color: "#ffffff", width: 140, textAlign: "right" }}
              >
                Multiplier
              </span>
              <select
                className="flex-1 min-w-[140px] px-3 py-2 rounded bg-white/90 text-black text-sm"
                value={Number(newEntry.multiplier) || 1}
                onChange={(e) =>
                  onNewEntryChange("multiplier", Number(e.target.value) || 1)
                }
              >
                {multiplierOptions.map((value) => (
                  <option key={`new-mult-${value}`} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="text-xs uppercase tracking-wide"
              style={{ color: "#ffffff", width: 140, textAlign: "right" }}
            >
              Level
            </span>
            <select
              className="flex-1 min-w-[140px] px-3 py-2 rounded bg-white/90 text-black text-sm"
              value={newEntry.difficulty}
              onChange={(e) =>
                onNewEntryChange("difficulty", Number(e.target.value))
              }
            >
              {LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="text-xs uppercase tracking-wide"
              style={{ color: "#ffffff", width: 140, textAlign: "right" }}
            >
              Focus
            </span>
            <select
              className="flex-1 min-w-[180px] px-3 py-2 rounded bg-white/90 text-black text-sm"
              value={newEntry.focus}
              onChange={(e) => onNewEntryChange("focus", e.target.value)}
            >
              {FOCUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="text-xs uppercase tracking-wide"
              style={{ color: "#ffffff", width: 140, textAlign: "right" }}
            >
              Gym/Weights
            </span>
            <select
              className="flex-1 min-w-[140px] px-3 py-2 rounded bg-white/90 text-black text-sm"
              value={newEntry.weights}
              onChange={(e) => onNewEntryChange("weights", e.target.value)}
            >
              {WEIGHT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={onAddEntry}
          className="self-start px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-500"
        >
          {addLabel}
        </button>
      </div>
    </div>
  );
}
