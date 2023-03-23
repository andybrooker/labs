import { useEffect, useState } from "react";
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

function calculateShadowLightness(lightness: number) {
  return lightness / 1.61 - (1 - lightness / 100) * 4;
}

function easeOutQuad(x: number): number {
  return 1 - (1 - x) * (1 - x);
}

function getLightLevel(value: number) {
  const pow = -1 * (value - 1) ** 6;
  return Math.exp(pow);
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

function App() {
  const [value, setValue] = useState(0);
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

  return (
    <div
      data-state={value <= 180 ? "day" : "night"}
      className="app"
      style={{ "--light": `${opacity * -100}%` } as React.CSSProperties}
    >
      <div
        data-state={value <= 180 ? "day" : "night"}
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
            <div>Good Evening, Andy</div>
            <div className="time">{`${time.hours}:${
              time.minutes < 10 ? "0" + time.minutes : time.minutes
            }`}</div>
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
      <input
        type="range"
        value={value}
        onChange={(event) => setValue(parseFloat(event.target.value))}
        min={0}
        max={360}
        step={1}
      />
    </div>
  );
}

export default App;
