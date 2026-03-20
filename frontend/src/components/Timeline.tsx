import { useState } from "react";

type TimelineEvent = {
  id: string;
  timestamp: string;
  content?: string;
  source_type: string;
  source_id: string;
};

type CareEvent = {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  event_type: string;
  source_type: string;
  source_id: string;
};

type Alert = {
  id: string;
  alert_timestamp: string;
};

type ViewMode = "month" | "week" | "day" | "events";

function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatHour(hour: number) {
  const normalized = hour % 12 || 12;
  return `${normalized} ${hour < 12 ? "AM" : "PM"}`;
}

export function Timeline({
  messages,
  events,
  alerts,
  confirmedAlertIds
}: {
  messages: TimelineEvent[];
  events: CareEvent[];
  alerts: Alert[];
  confirmedAlertIds: string[];
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const eventList = [
    ...events,
    ...messages.map((message) => ({
      ...message,
      title: "Patient message",
      description: message.content ?? "Patient-reported entry",
      event_type: "message"
    })),
    ...alerts.map((alert) => ({
      id: alert.id,
      timestamp: alert.alert_timestamp,
      title: "Alert generated",
      description: "Body-signal alert for review.",
      event_type: "alert",
      source_type: "alert",
      source_id: alert.id
    }))
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const anchorDate = eventList.length ? new Date(eventList[eventList.length - 1].timestamp) : new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(anchorDate);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const monthEnd = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
  const monthDays = Array.from({ length: monthEnd.getDate() }, (_, idx) => new Date(anchorDate.getFullYear(), anchorDate.getMonth(), idx + 1));
  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, idx) => new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + idx));
  const selectedDayEvents = eventList.filter((event) => sameDay(new Date(event.timestamp), selectedDate));
  const hourlyCounts = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: selectedDayEvents.filter((event) => new Date(event.timestamp).getHours() === hour).length
  }));
  const maxHourlyCount = Math.max(...hourlyCounts.map((item) => item.count), 1);
  const selectedHourEvents = selectedDayEvents.filter((event) => new Date(event.timestamp).getHours() === selectedHour);
  const confirmedAlertDates = alerts
    .filter((alert) => confirmedAlertIds.includes(alert.id))
    .map((alert) => new Date(alert.alert_timestamp));

  function goBack() {
    if (viewMode === "events") {
      setViewMode("day");
      return;
    }
    if (viewMode === "day") {
      setViewMode("week");
      return;
    }
    if (viewMode === "week") {
      setViewMode("month");
    }
  }

  return (
    <section className="card timeline-card">
      <div className="card-header">
        <h2>Timeline Navigator</h2>
        <span className="eyebrow">Month to day drilldown</span>
      </div>
      {viewMode !== "month" ? (
        <button className="secondary-button" onClick={goBack}>
          Back
        </button>
      ) : null}

      {viewMode === "month" ? (
        <div className="calendar-grid">
          {monthDays.map((date) => {
            const dayEvents = eventList.filter((event) => sameDay(new Date(event.timestamp), date));
            const hasConfirmedAlert = confirmedAlertDates.some((alertDate) => sameDay(alertDate, date));
            return (
              <button
                className={`calendar-cell ${hasConfirmedAlert ? "calendar-cell-alert" : ""}`}
                key={date.toISOString()}
                onClick={() => {
                  setSelectedDate(date);
                  setViewMode("week");
                }}
              >
                <strong>{date.getDate()}</strong>
                <span>{dayEvents.length} events</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {viewMode === "week" ? (
        <div className="calendar-grid week-grid">
          {weekDays.map((date) => {
            const dayEvents = eventList.filter((event) => sameDay(new Date(event.timestamp), date));
            return (
              <button
                className="calendar-cell"
                key={date.toISOString()}
                onClick={() => {
                  setSelectedDate(date);
                  setViewMode("day");
                }}
              >
                <strong>{date.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}</strong>
                <span>{dayEvents.length} events</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {viewMode === "day" ? (
        <div className="day-visualization">
          <p className="muted">Event volume for {selectedDate.toLocaleDateString()}</p>
          <div className="hour-bars">
            {hourlyCounts.map(({ hour, count }) => (
              <button
                className="hour-bar"
                key={hour}
                onClick={() => {
                  setSelectedHour(hour);
                  setViewMode("events");
                }}
                title={`${count} events at ${String(hour).padStart(2, "0")}:00`}
              >
                <div className="hour-bar-fill" style={{ height: `${(count / maxHourlyCount) * 100}%` }} />
                <span>{formatHour(hour)}</span>
                <small>{count}</small>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {viewMode === "events" ? (
        <div className="timeline">
          <p className="muted">
            {selectedDate.toLocaleDateString()} at {formatHour(selectedHour ?? 0)}
          </p>
          {selectedHourEvents.length ? (
            selectedHourEvents.map((event) => (
              <article className="timeline-row" key={event.id}>
                <span>{new Date(event.timestamp).toLocaleString()}</span>
                <span>{event.title}</span>
                <span>{event.description}</span>
              </article>
            ))
          ) : (
            <p className="muted">No events in this hour.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
