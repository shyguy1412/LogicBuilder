// Circuit Store - State management for the logic circuit editor
// Uses XState's atom pattern for reactive state updates

import { createAtom } from "@xstate/store";
import { createCircuit, Circuit, GateType } from "@/../../lce-ts-bindings";

// Complete state of the circuit editor
export interface CircuitState {
  circuit: Circuit;                      // Circuit simulation engine instance
  gates: Map<number, {                   // Visual representation of gates
    id: number;                         // Gate unique identifier
    type: GateType;                     // Gate logic type
    x: number;                          // X position on grid
    y: number;                          // Y position on grid
  }>;
  wires: Map<number, {                   // Wire connections between gates
    id: number;                         // Wire unique identifier
    from: { gateId: number; pin: number };  // Source gate and pin
    to: { gateId: number; pin: number };    // Target gate and pin
  }>;
  simulation: {                          // Simulation control state
    running: boolean;                   // Is simulation active
    speed: number;                      // Simulation speed in ms
  };
}

// Initial state with empty circuit
const initialState: CircuitState = {
  circuit: createCircuit(),     // Create new circuit engine instance
  gates: new Map(),             // No gates initially
  wires: new Map(),             // No wires initially
  simulation: {
    running: false,             // Simulation stopped by default
    speed: 100,                 // 100ms per simulation step
  },
};

// Global reactive state store
export const circuitStore = createAtom(initialState);

// Actions for modifying circuit state
export const circuitActions = {
  // Add a new gate to the circuit at specified position
  addGate: (type: GateType, x: number, y: number) => {
    const state = circuitStore.get();
    const gateId = state.circuit.addGate(type);
    
    state.gates.set(gateId, { id: gateId, type, x, y });
    circuitStore.set({ ...state });
    
    return gateId;
  },

  removeGate: (gateId: number) => {
    const state = circuitStore.get();
    state.gates.delete(gateId);
    
    const wiresToRemove: number[] = [];
    state.wires.forEach((wire, wireId) => {
      if (wire.from.gateId === gateId || wire.to.gateId === gateId) {
        wiresToRemove.push(wireId);
      }
    });
    
    wiresToRemove.forEach(wireId => state.wires.delete(wireId));
    circuitStore.set({ ...state });
  },

  // Create a wire connection between two gates
  connectGates: (fromGateId: number, fromPin: number, toGateId: number, toPin: number) => {
    const state = circuitStore.get();
    const wireId = state.circuit.addWire();
    
    state.circuit.connect(fromGateId, fromPin, wireId);
    state.circuit.connectInput(wireId, toGateId, toPin);
    
    state.wires.set(wireId, {
      id: wireId,
      from: { gateId: fromGateId, pin: fromPin },
      to: { gateId: toGateId, pin: toPin },
    });
    
    circuitStore.set({ ...state });
    return wireId;
  },

  setInputValue: (gateId: number, value: boolean) => {
    const state = circuitStore.get();
    const gate = state.gates.get(gateId);
    
    if (gate && gate.type === 'input') {
      const wireId = state.circuit.addWire();
      state.circuit.connect(gateId, 0, wireId);
      state.circuit.setWireValue(wireId, value);
    }
    
    circuitStore.set({ ...state });
  },

  // Run one simulation cycle (up to 100 iterations)
  simulate: () => {
    const state = circuitStore.get();
    state.circuit.simulate(100);  // Run simulation with max 100 iterations
    circuitStore.set({ ...state });
  },

  startSimulation: () => {
    const state = circuitStore.get();
    state.simulation.running = true;
    circuitStore.set({ ...state });
  },

  stopSimulation: () => {
    const state = circuitStore.get();
    state.simulation.running = false;
    circuitStore.set({ ...state });
  },

  clearCircuit: () => {
    const state = circuitStore.get();
    state.circuit.clearValues();
    state.gates.clear();
    state.wires.clear();
    circuitStore.set({ ...state });
  },
};