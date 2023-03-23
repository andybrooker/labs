import { useEffect, useRef, useState } from "react";
import "./root.css";

function degreeToRadian(degrees: number) {
  return degrees * (Math.PI / 180);
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeInQuad(x: number): number {
  return x ** 2;
}

function normalise(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

function getShadows({ angle }: { angle: number }) {
  const numShadows = 4;
  const longestSide = Math.max(200, 100);
  const factor = longestSide / 100;
  const scale = factor;

  return Array.from({ length: numShadows }, (_, i) => {
    const normalisedIndex = normalise(i, 0, numShadows);

    // Calculate Offset
    const offsetEase = easeInQuad(normalisedIndex) * 8.33;
    const offsetX = Math.cos(angle) * scale * factor * offsetEase;
    const offsetY = Math.sin(angle) * scale * factor * offsetEase;

    // Calculate radius-blur
    const offsetRadius = easeInQuad(normalisedIndex) * 9;
    const radiusBlur = offsetRadius * scale * factor;

    // Calculate spread-radius
    const offsetSpread = normalisedIndex * 2.5;

    const hslLightness = 0.36 * Math.sin(angle);
    console.log(hslLightness);

    return `${offsetX}px ${offsetY}px ${radiusBlur}px -${offsetSpread}px hsl(var(--shadow-color) / ${hslLightness})`;
  });
}

function useTime() {
  const now = () => {
    const d = new Date();
    return { hours: d.getUTCHours(), minutes: d.getUTCMinutes() };
  };

  const [time, setTime] = useState(now());

  useEffect(() => {
    const timerID = setInterval(() => setTime(now()), 1000);
    return () => clearInterval(timerID);
  }, []);

  return { time };
}

function useCounter() {
  const [count, setCount] = useState(360);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number>();

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setCount((prevCount) => {
          const newCount = prevCount + 1;
          if (newCount > 1440) {
            // Stop at 24 hours (1440 minutes)
            // setIsRunning(false);
            return 0;
          }
          return newCount;
        });
      }, 1000 / 60);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  function start() {
    setIsRunning(true);
  }

  function stop() {
    setIsRunning(false);
  }

  function reset() {
    setCount(0);
  }

  return { count, start, stop, reset, isRunning };
}

function getGreeting(time: number) {
  if (6 <= time && time < 12) return "Good Morning";
  else if (12 <= time && time <= 18) return "Good Afternoon";
  else return "Good Evening";
}

function formatTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

const dayOrNight = (value: number) =>
  0 <= value && value < 180 ? "day" : "night";

function App() {
  const { count, start, stop, isRunning } = useCounter();
  // const [value, setValue] = useState(0);
  const value = (count - 360) / 4;
  const maxDegrees = 360;

  function getCoord(
    offset: number,
    radius: number,
    angle: number,
    trigFn: Math["cos"] | Math["sin"]
  ) {
    return offset - radius * trigFn(angle);
  }

  const { time } = useTime();
  const timeProportion = (time.hours + time.minutes / 60 - 6) / 24;
  // const value = 360 * timeProportion;
  const radians = degreeToRadian(value - 180);

  const glowX = getCoord(50, 60, radians, Math.cos);
  const glowY = getCoord(0, 75, radians, Math.sin);
  const borderX = getCoord(50, 50, radians, Math.cos);
  const borderY = getCoord(50, 50, radians, Math.sin);
  const opacity = Math.sin(radians);

  const shadows = getShadows({ angle: degreeToRadian(value) }).join(", ");
  const timeOfDay = dayOrNight(value);

  return (
    <div
      data-state={timeOfDay}
      className="app"
      style={{ "--light": `${opacity * -100}%` } as React.CSSProperties}
    >
      <div
        data-state={timeOfDay}
        className="card"
        style={
          {
            "--x": `${borderX}%`,
            "--y": `${borderY}%`,
            "--opacity": opacity,
            "--light": `${opacity * -100}%`,
            "--angle": `${value}deg`,
            "--boxShadow": shadows,
          } as React.CSSProperties
        }
      >
        <div className="text">
          <div>
            <div>{getGreeting(value / 15 + 6)}, Andy</div>
            <div className="time">
              {formatTime(count)}
              {/* {`${time.hours}:${time.minutes
              .toString()
              .padStart(2)}`} */}
            </div>
          </div>
          <div className="location">London, United Kingdom</div>
        </div>

        <div
          aria-hidden="true"
          className="glow"
          style={
            {
              "--left": `${glowX}%`,
              "--top": `${glowY}%`,
            } as React.CSSProperties
          }
        ></div>
      </div>

      <button
        className="button"
        data-state={timeOfDay}
        onClick={isRunning ? stop : start}
        style={
          {
            "--x": `${borderX}%`,
            "--y": `${borderY}%`,
            "--opacity": opacity,
            "--light": `${opacity * -100}%`,
            "--angle": `${value}deg`,
            "--boxShadow": shadows,
          } as React.CSSProperties
        }
      >
        {isRunning ? "Pause Simulation" : "Simulate Day"}
      </button>
    </div>
  );
}

export default App;
