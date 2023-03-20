import { useState } from "react";
import "./root.css";

function App() {
  const [value, setValue] = useState(0);
  /*
  Left: Glow: 110% 0%, Border: 0 50
  Top: Glow: 50% -75%, Border: 50 0
  Right: Glow: -10% 0%, Border: 100 50
  */
  // function calculateCSSVariables() {
  //   const glowX =
  // }
  const maxValue = 120;

  function calculateEllipseYPosition(
    x: number,
    a: number,
    b: number,
    xCentre: number
  ) {
    const LHS = (x - xCentre) ** 2 / a ** 2;
    const ySquared = (1 - LHS) * b ** 2;
    const y = Math.sqrt(ySquared);
    return y;
  }

  const glowX = value * (120 / maxValue) - 10;
  const glowY = calculateEllipseYPosition(glowX, 60, 75, 50);

  const borderX = value * (100 / maxValue);
  const borderY = calculateEllipseYPosition(borderX, 50, 50, 50);

  return (
    <div className="flex">
      <input
        type="range"
        value={value}
        onChange={(event) => setValue(parseFloat(event.target.value))}
        min={0}
        max={maxValue}
      />
      <div
        data-state="night"
        className="card"
        style={{ "--x": `${borderX}%`, "--y": `${-borderY}%` }}
      >
        <div
          aria-hidden="true"
          className="glow"
          style={{ "--left": `${glowX}%`, "--top": `${-glowY}%` }}
        ></div>
      </div>
    </div>
  );
}

export default App;
