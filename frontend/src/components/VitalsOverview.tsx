import { useMemo, useState } from "react";

type Vital = {
  id: string;
  timestamp: string;
  stream_type: string;
  value: number;
  unit: string;
};

type VitalsOverviewProps = {
  vitals: Vital[];
};

export function VitalsOverview({ vitals }: VitalsOverviewProps) {
  const streamLabels: Record<string, string> = {
    heart_rate: "Heart rate",
    pulse: "Pulse",
    hrv: "Heart rate variability",
    motion: "Body movement",
    eeg: "EEG",
    sleep: "Sleep score"
  };
  const streamColors: Record<string, string> = {
    heart_rate: "stream-heart-rate",
    pulse: "stream-pulse",
    hrv: "stream-hrv",
    motion: "stream-motion",
    eeg: "stream-eeg",
    sleep: "stream-sleep"
  };
  const orderedStreams = ["heart_rate", "pulse", "hrv", "motion", "eeg", "sleep"];
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [selectedStreams, setSelectedStreams] = useState<string[]>(orderedStreams);

  const filteredVitals = useMemo(() => {
    const start = rangeStart ? new Date(rangeStart).getTime() : Number.NEGATIVE_INFINITY;
    const end = rangeEnd ? new Date(rangeEnd).getTime() : Number.POSITIVE_INFINITY;
    return vitals.filter((item) => {
      const timestamp = new Date(item.timestamp).getTime();
      return timestamp >= start && timestamp <= end && selectedStreams.includes(item.stream_type);
    });
  }, [vitals, rangeStart, rangeEnd, selectedStreams]);

  const groupedSeries = orderedStreams
    .filter((streamType) => selectedStreams.includes(streamType))
    .map((streamType) => {
    const items = filteredVitals.filter((item) => item.stream_type === streamType);
    const values = items.map((item) => item.value);
    const minValue = values.length ? Math.min(...values) : 0;
    const maxValue = values.length ? Math.max(...values) : 1;
    const range = Math.max(maxValue - minValue, 1);
    return { streamType, items, minValue, maxValue, range };
  });
  const chartHeight = 180;
  const baseHeightFloor = 24;

  function toggleStream(streamType: string) {
    setSelectedStreams((current) =>
      current.includes(streamType) ? current.filter((item) => item !== streamType) : [...current, streamType]
    );
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2>Vitals Overview</h2>
        <span className="eyebrow">Six core vital charts</span>
      </div>
      <div className="query-box">
        <label>
          Start time
          <input type="datetime-local" value={rangeStart} onChange={(event) => setRangeStart(event.target.value)} />
        </label>
        <label>
          End time
          <input type="datetime-local" value={rangeEnd} onChange={(event) => setRangeEnd(event.target.value)} />
        </label>
      </div>
      <div className="checkbox-row">
        {orderedStreams.map((streamType) => (
          <label className="checkbox-chip" key={streamType}>
            <input
              type="checkbox"
              checked={selectedStreams.includes(streamType)}
              onChange={() => toggleStream(streamType)}
            />
            <span>{streamLabels[streamType] ?? streamType}</span>
          </label>
        ))}
      </div>
      <div className="mini-chart-stack">
        {groupedSeries.map(({ streamType, items, minValue, maxValue, range }) => (
          <div className="mini-chart" key={streamType}>
            <div className="mini-chart-header">
              <strong>{streamLabels[streamType] ?? streamType}</strong>
              <span className="muted">
                {items.length
                  ? `${minValue.toFixed(streamType === "sleep" ? 0 : 1)} to ${maxValue.toFixed(streamType === "sleep" ? 0 : 1)} ${items[0]?.unit}`
                  : "No data"}
              </span>
            </div>
            {items.length ? (
              <div className="plot-scroll">
                <div className="plot-wrap">
                  <div className="plot-axis">
                    <span>{maxValue.toFixed(streamType === "sleep" ? 0 : 1)}</span>
                    <span>{minValue.toFixed(streamType === "sleep" ? 0 : 1)}</span>
                  </div>
                  <div className="plot">
                    {items.map((point) => (
                      <div className="plot-point" key={point.id}>
                        <div
                          className={`plot-bar ${streamColors[point.stream_type] ?? ""}`}
                          style={{
                            height: `${baseHeightFloor + ((point.value - minValue) / range) * (chartHeight - baseHeightFloor)}px`,
                            width: "10px"
                          }}
                          title={`${streamLabels[point.stream_type] ?? point.stream_type}: ${point.value} ${point.unit}`}
                        />
                        <span>{new Date(point.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                        <small>
                          {point.value} {point.unit}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="muted">No data available.</p>
            )}
          </div>
        ))}
      </div>
      {!groupedSeries.length ? <p className="muted">Choose at least one chart to display.</p> : null}
    </section>
  );
}
