import React from "react";

// temporary for updating Git
function formatDate(value) {
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return { date: value, time: "" };
    }
    return {
      date: date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  } catch {
    return { date: value, time: "" };
  }
}

function summarizeSuitDetails(suits) {
  const totals = new Map();
  (suits || []).forEach((detail) => {
    const reps = Number(detail.reps) || 0;
    if (!reps) return;
    const label =
      (detail.workout || detail.suit || "Workout").trim() || "Workout";
    totals.set(label, (totals.get(label) || 0) + reps);
  });
  return Array.from(totals.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, reps]) => ({ label, reps }));
}

export default function History({ entries, onDeleteEntries }) {
  const [deleteMode, setDeleteMode] = React.useState(false);
  const [pendingDeletes, setPendingDeletes] = React.useState(new Set());

  React.useEffect(() => {
    if (!deleteMode) return;
    setPendingDeletes((prev) => {
      const next = new Set();
      (entries || []).forEach((entry) => {
        if (prev.has(entry.id)) next.add(entry.id);
      });
      return next;
    });
  }, [entries, deleteMode]);

  const startDeleteMode = () => {
    setPendingDeletes(new Set());
    setDeleteMode(true);
  };

  const cancelDeleteMode = () => {
    setPendingDeletes(new Set());
    setDeleteMode(false);
  };

  const toggleDeleteMark = (id) => {
    setPendingDeletes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const saveDeletes = () => {
    if (!deleteMode) return;
    const idsToDelete = Array.from(pendingDeletes.values());
    if (idsToDelete.length && typeof onDeleteEntries === "function") {
      onDeleteEntries(idsToDelete);
    }
    setPendingDeletes(new Set());
    setDeleteMode(false);
  };

  const totalRepsAllTime = (entries || []).reduce(
    (sum, entry) => sum + (entry.totalReps || 0),
    0
  );
  const { breakdownRows, totalJokersCompleted, totalCardsCompleted } =
    React.useMemo(() => {
      const totalsMap = new Map();
      let jokerCount = 0;
      let cardsCompleted = 0;

      (entries || []).forEach((entry) => {
        const hasDetailedWorkouts =
          Array.isArray(entry.performedWorkouts) &&
          entry.performedWorkouts.length > 0;
        const performedList = hasDetailedWorkouts
          ? entry.performedWorkouts
          : (entry.suits || []).map((detail) => ({
              workout: detail.workout || detail.suit || "Workout",
              reps: detail.reps,
            }));

        performedList.forEach((item) => {
          const reps = Number(item.reps) || 0;
          if (!reps) return;
          const label = (item.workout || "Workout").trim() || "Workout";
          totalsMap.set(label, (totalsMap.get(label) || 0) + reps);
        });

        const jokersForEntry = Array.isArray(entry.jokers)
          ? entry.jokers.length
          : 0;
        if (Array.isArray(entry.jokers)) {
          jokerCount += entry.jokers.length;
        }

        const entryCards =
          typeof entry.cardsCompleted === "number"
            ? entry.cardsCompleted
            : hasDetailedWorkouts
            ? performedList.length + jokersForEntry
            : 0;
        cardsCompleted += entryCards;
      });

      const breakdownRows = Array.from(totalsMap.entries()).sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
      );

      return {
        breakdownRows,
        totalJokersCompleted: jokerCount,
        totalCardsCompleted: cardsCompleted,
      };
    }, [entries]);
  if (!entries || !entries.length) {
    return (
      <div
        className="w-full max-w-3xl text-center mt-6"
        style={{ color: "#ffffff" }}
      >
        No workouts logged yet. Complete a workout to start your history.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div
        className="w-full text-center text-lg font-semibold"
        style={{ color: "#ffffff" }}
      >
        You have completed {totalRepsAllTime} reps across all your workouts!
      </div>
      <div
        className="w-full overflow-auto rounded-2xl border border-white/20 bg-white/5"
        style={{ color: "#ffffff" }}
      >
        <table
          className="min-w-full text-sm"
          style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            color: "#ffffff",
            borderCollapse: "collapse",
          }}
        >
          <thead className="bg-white/10 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left border-b border-white/10 border-r border-white/10">
                Date
              </th>
              <th className="px-4 py-3 text-left border-b border-white/10 border-r border-white/10">
                Workout
              </th>
              <th className="px-4 py-3 text-left border-b border-white/10 border-r border-white/10">
                Workouts &amp; Reps
              </th>
              <th className="px-4 py-3 text-left border-b border-white/10 border-r border-white/10">
                Total Reps
              </th>
              <th className="px-4 py-3 text-left border-b border-white/10">
                Jokers
              </th>
              {deleteMode && (
                <th className="px-4 py-3 text-left border-b border-white/10 border-l border-white/10">
                  Delete
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className={`border-b border-white/10 ${
                  deleteMode && pendingDeletes.has(entry.id)
                    ? "bg-red-900/30"
                    : ""
                }`}
              >
                <td className="px-4 py-3 align-top border-r border-white/10">
                  {(() => {
                    const { date, time } = formatDate(entry.completedAt);
                    return (
                      <>
                        <div>{date}</div>
                        {time && <div>{time}</div>}
                      </>
                    );
                  })()}
                </td>
                <td className="px-4 py-3 align-top border-r border-white/10">
                  {entry.workoutName || "Workout"}
                </td>
                <td className="px-4 py-3 align-top border-r border-white/10">
                  {summarizeSuitDetails(entry.suits).map(({ label, reps }) => (
                    <div key={`${entry.id}-${label}`} className="mb-1">
                      <span className="font-semibold">{label}</span>
                      {` - ${reps}`}
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3 align-top font-semibold border-r border-white/10">
                  {entry.totalReps}
                </td>
                <td className="px-4 py-3 align-top">
                  {entry.jokers && entry.jokers.length
                    ? entry.jokers.join(", ")
                    : "None"}
                </td>
                {deleteMode && (
                  <td className="px-4 py-3 align-top">
                    <button
                      type="button"
                      onClick={() => toggleDeleteMark(entry.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
                        pendingDeletes.has(entry.id)
                          ? "bg-red-700 text-white border-red-500"
                          : "bg-white/10 text-white border-white/30 hover:bg-white/20"
                      }`}
                    >
                      {pendingDeletes.has(entry.id) ? "Undo" : "Delete"}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        className="w-full rounded-2xl border border-white/20 bg-white/5 p-4"
        style={{ color: "#ffffff" }}
      >
        <h3 className="text-base font-semibold mb-2">All-Time Breakdown</h3>
        <div className="flex flex-col gap-2 text-sm">
          {breakdownRows.length ? (
            breakdownRows.map(([label, reps]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-white/80">{label}</span>
                <span className="font-semibold text-white">{reps} reps</span>
              </div>
            ))
          ) : (
            <div className="text-white/70">No workout reps logged yet.</div>
          )}
        </div>
        <div className="mt-4 text-sm flex items-center justify-between flex-wrap gap-2">
          <span className="text-white/80">Jokers Completed</span>
          <span className="font-semibold text-white">
            {totalJokersCompleted}
          </span>
        </div>
        <div className="text-sm flex items-center justify-between flex-wrap gap-2">
          <span className="text-white/80">Cards Completed</span>
          <span className="font-semibold text-white">
            {totalCardsCompleted}
          </span>
        </div>
      </div>
      <div className="w-full flex flex-wrap items-center justify-end gap-3">
        {deleteMode ? (
          <>
            <div
              className="text-sm text-white/80 flex-1"
              style={{ color: "#ffff" }}
            >
              {pendingDeletes.size
                ? `${pendingDeletes.size} ${
                    pendingDeletes.size === 1 ? "workout" : "workouts"
                  } selected for deletion`
                : "Select workouts to delete, then save your changes."}
            </div>
            <button
              type="button"
              onClick={cancelDeleteMode}
              className="px-5 py-2 rounded-lg border border-white/40 text-white font-semibold text-sm hover:bg-white/10"
            >
              Cancel Changes
            </button>
            <button
              type="button"
              onClick={saveDeletes}
              className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-500"
            >
              Save Changes
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={startDeleteMode}
            className="px-5 py-2 rounded-lg bg-red-700 text-white font-semibold text-sm hover:bg-red-600"
          >
            Delete Selected Workouts
          </button>
        )}
      </div>
    </div>
  );
}
