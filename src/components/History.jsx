import React from "react";

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

export default function History({ entries }) {
  const totalRepsAllTime = (entries || []).reduce(
    (sum, entry) => sum + (entry.totalReps || 0),
    0
  );
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
          }}
        >
          <thead className="bg-white/10 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left border border-white/10">
                Date
              </th>
              <th className="px-4 py-3 text-left border border-white/10">
                Workout
              </th>
              <th className="px-4 py-3 text-left border border-white/10">
                Workouts &amp; Reps
              </th>
              <th className="px-4 py-3 text-left border border-white/10">
                Total Reps
              </th>
              <th className="px-4 py-3 text-left border border-white/10">
                Jokers
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t border-white/10">
                <td className="px-4 py-3 align-top border border-white/10">
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
                <td className="px-4 py-3 align-top border border-white/10">
                  {entry.workoutName || "Workout"}
                </td>
                <td className="px-4 py-3 align-top border border-white/10">
                  {(entry.suits || []).map((detail) => (
                    <div key={`${entry.id}-${detail.key}`} className="mb-1">
                      <span className="font-semibold">
                        {detail.workout || detail.suit}
                      </span>
                      {` - ${detail.reps}`}
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3 align-top border border-white/10 font-semibold">
                  {entry.totalReps}
                </td>
                <td className="px-4 py-3 align-top border border-white/10">
                  {entry.jokers && entry.jokers.length
                    ? entry.jokers.join(", ")
                    : "None"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
