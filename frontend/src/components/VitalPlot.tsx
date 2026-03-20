import { useState } from "react";

type Vital = {
  id: string;
  timestamp: string;
  stream_type: string;
  value: number;
  unit: string;
};

type ScaleConfig = {
  minPadding: number;
  maxPadding: number;
  minRange: number;
};

type VitalPlotProps = {
  vitals: Vital[];
  availableVitals: Vital[];
  rangeStart: string;
  rangeEnd: string;
  selectedStream: string;
  onSelectedStreamChange: (value: string) => void;
  onRangeStartChange: (value: string) => void;
  onRangeEndChange: (value: string) => void;
  onApplyRange: () => void;
  onUseLastAlertWindow: () => void;
  hasAppliedRange: boolean;
  hasAlertWindow: boolean;
};

export function VitalPlot({
  vitals,
  availableVitals,
  rangeStart,
  rangeEnd,
  selectedStream,
  onSelectedStreamChange,
  onRangeStartChange,
  onRangeEndChange,
  onApplyRange,
  onUseLastAlertWindow,
  hasAppliedRange,
  hasAlertWindow
}: VitalPlotProps) {
  const [zoomLevel, setZoomLevel] = useState(2);
  const series = selectedStream === "all" ? vitals : vitals.filter((item) => item.stream_type === selectedStream);
  const availableStreams = Array.from(new Set(availableVitals.map((item) => item.stream_type)));
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
  const scaleConfig: Record<string, ScaleConfig> = {
    heart_rate: { minPadding: 2, maxPadding: 2, minRange: 12 },
    pulse: { minPadding: 2, maxPadding: 2, minRange: 12 },
    hrv: { minPadding: 2, maxPadding: 2, minRange: 8 },
    motion: { minPadding: 1, maxPadding: 2, minRange: 10 },
    eeg: { minPadding: 1, maxPadding: 1, minRange: 6 },
    sleep: { minPadding: 2, maxPadding: 2, minRange: 12 }
  };

  function resolveScale(streamType: string, items: Vital[]) {
    const values = items.map((item) => item.value);
    const observedMin = Math.min(...values);
    const observedMax = Math.max(...values);
    const config = scaleConfig[streamType] ?? { minPadding: 2, maxPadding: 2, minRange: 8 };
    let minValue = observedMin - config.minPadding;
    let maxValue = observedMax + config.maxPadding;
    const currentRange = maxValue - minValue;

    if (currentRange < config.minRange) {
      const extra = (config.minRange - currentRange) / 2;
      minValue -= extra;
      maxValue += extra;
    }

    if (streamType === "motion" || streamType === "sleep") {
      minValue = Math.max(0, minValue);
    }

    const range = Math.max(maxValue - minValue, 1);
    return { minValue, maxValue, range };
  }

  function formatTimeLabel(timestamp: string, index: number) {
    const date = new Date(timestamp);
    if (zoomLevel >= 4) {
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }
    if (zoomLevel === 3) {
      return date.getMinutes() % 10 === 0 ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";
    }
    if (zoomLevel === 2) {
      return date.getMinutes() % 30 === 0 ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";
    }
    return index % 60 === 0 ? date.toLocaleTimeString([], { hour: "numeric" }) : "";
  }

  const pointWidth = zoomLevel === 1 ? 4 : zoomLevel === 2 ? 8 : zoomLevel === 3 ? 14 : 24;
  const baseHeightFloor = zoomLevel === 1 ? 18 : zoomLevel === 2 ? 28 : zoomLevel === 3 ? 40 : 52;
  const chartHeight = 180;

  const groupedSeries = Array.from(new Set(series.map((item) => item.stream_type))).map((streamType) => {
    const items = series.filter((item) => item.stream_type === streamType);
    const scale = resolveScale(streamType, items);
    return { streamType, items, scale };
  });

  return (
    <section className="card">
      <div className="card-header">
        <h2>Recent Body-Signal Readings</h2>
        <span className="eyebrow">Recent sensor measurements</span>
      </div>
      <div className="query-box">
        <label>
          Start time
          <input type="datetime-local" value={rangeStart} onChange={(event) => onRangeStartChange(event.target.value)} />
        </label>
        <label>
          End time
          <input type="datetime-local" value={rangeEnd} onChange={(event) => onRangeEndChange(event.target.value)} />
        </label>
        <label>
          Signal to show
          <select value={selectedStream} onChange={(event) => onSelectedStreamChange(event.target.value)}>
            <option value="all">Choose one signal</option>
            {availableStreams.map((streamType) => (
              <option key={streamType} value={streamType}>
                {streamLabels[streamType] ?? streamType}
              </option>
            ))}
          </select>
        </label>
        <label>
          Zoom level
          <input
            type="range"
            min="1"
            max="4"
            step="1"
            value={zoomLevel}
            onChange={(event) => setZoomLevel(Number(event.target.value))}
          />
        </label>
        <div className="action-row">
          <button onClick={onApplyRange} disabled={!rangeStart || !rangeEnd || selectedStream === "all"}>
            Show selected time range
          </button>
          <button onClick={onUseLastAlertWindow} disabled={!hasAlertWindow}>
            Show around last alert
          </button>
        </div>
      </div>
      <p className="muted">
        This panel only shows sensor readings for the time range the doctor asks for. Each chart covers one signal type
        only, so heart rate, heart rate variability, and body movement are not mixed onto the same scale.
      </p>
      {!hasAppliedRange ? (
        <p className="muted">Choose a start and end time, then run the query to view body-signal readings.</p>
      ) : null}
      {hasAppliedRange && !series.length ? (
        <p className="muted">No body-signal readings are available in the selected time range.</p>
      ) : null}
      {hasAppliedRange && series.length ? (
        <>
      <div className="chips">
        {Array.from(new Set(series.map((item) => item.stream_type))).map((streamType) => (
          <span className="chip" key={streamType}>
            {streamLabels[streamType] ?? streamType}
          </span>
        ))}
      </div>
      <div className="mini-chart-stack">
        {groupedSeries.map(({ streamType, items, scale }) => (
          <div className="mini-chart" key={streamType}>
            <div className="mini-chart-header">
              <strong>{streamLabels[streamType] ?? streamType}</strong>
              <span className="muted">
                Scale {scale.minValue.toFixed(streamType === "sleep" ? 0 : 1)} to {scale.maxValue.toFixed(streamType === "sleep" ? 0 : 1)} {items[0]?.unit}
              </span>
            </div>
            <div className="plot-scroll">
              <div className="plot-wrap">
                <div className="plot-axis">
                  <span>{scale.maxValue.toFixed(streamType === "sleep" ? 0 : 1)}</span>
                  <span>{scale.minValue.toFixed(streamType === "sleep" ? 0 : 1)}</span>
                </div>
                <div className="plot">
                {items.map((point, index) => (
                  <div className="plot-point" key={point.id}>
                    <div
                      className={`plot-bar ${streamColors[point.stream_type] ?? ""}`}
                      style={{
                        height: `${baseHeightFloor + ((point.value - scale.minValue) / scale.range) * (chartHeight - baseHeightFloor)}px`,
                        width: `${pointWidth}px`
                      }}
                      title={`${streamLabels[point.stream_type] ?? point.stream_type}: ${point.value} ${point.unit}`}
                    />
                    <span>{formatTimeLabel(point.timestamp, index)}</span>
                    <small>
                      {point.value} {point.unit}
                    </small>
                  </div>
                ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="muted">
        Read left to right to see when each signal changed. If several charts rise or dip around the same time, that
        gives the doctor a quick visual cue to inspect that time window more closely.
      </p>
        </>
      ) : null}
    </section>
  );
}
