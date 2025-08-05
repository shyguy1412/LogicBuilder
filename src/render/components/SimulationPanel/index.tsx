// Simulation Control Panel Component
// Provides UI controls for running, stepping, and managing circuit simulations

import { h } from "preact";
import { useState, useCallback } from "preact/hooks";
import style from "./SimulationPanel.module.css";
import { circuitActions, circuitStore } from "@/store/circuit";
import { useAtom } from "@/lib/components/hooks";

export function SimulationPanel() {
  const [speed, setSpeed] = useState(100);
  const circuit = useAtom(circuitStore);
  const isRunning = circuit.simulation.running;

  // Start continuous simulation with specified speed
  const handleStart = useCallback(() => {
    circuitActions.startSimulation();
    // Set up interval to run simulation steps
    const interval = setInterval(() => {
      // Stop interval if simulation was stopped
      if (!circuitStore.get().simulation.running) {
        clearInterval(interval);
        return;
      }
      circuitActions.simulate();
    }, speed);
  }, [speed]);

  const handleStop = useCallback(() => {
    circuitActions.stopSimulation();
  }, []);

  // Run a single simulation step
  const handleStep = useCallback(() => {
    circuitActions.simulate();
  }, []);

  // Clear/reset the entire circuit
  const handleClear = useCallback(() => {
    circuitActions.clearCircuit();
  }, []);

  return (
    <div class={style.panel}>
      <h3>Simulation Control</h3>
      
      <div class={style.controls}>
        <button 
          onClick={isRunning ? handleStop : handleStart}
          class={style.button}
        >
          {isRunning ? "Stop" : "Start"}
        </button>
        
        <button 
          onClick={handleStep}
          disabled={isRunning}
          class={style.button}
        >
          Step
        </button>
        
        <button 
          onClick={handleClear}
          disabled={isRunning}
          class={style.button}
        >
          Clear
        </button>
      </div>
      
      <div class={style.speedControl}>
        <label>Speed (ms):</label>
        <input
          type="range"
          min="10"
          max="1000"
          value={speed}
          onInput={(e) => setSpeed(parseInt(e.currentTarget.value))}
          disabled={isRunning}
        />
        <span>{speed}ms</span>
      </div>
      
      <div class={style.stats}>
        <div>Gates: {circuit.gates.size}</div>
        <div>Wires: {circuit.wires.size}</div>
        <div>Status: {isRunning ? "Running" : "Stopped"}</div>
      </div>
    </div>
  );
}