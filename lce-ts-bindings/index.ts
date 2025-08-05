// TypeScript interface for circuit operations
// This interface is implemented by both the pure TypeScript simulator
// and the WebAssembly module compiled from Rust
export interface Circuit {
  addGate(type: GateType): number;      // Add a new gate, returns gate ID
  addWire(): number;                    // Add a new wire, returns wire ID
  connect(source: number, sourcePin: number, wire: number): void;  // Connect gate output to wire
  connectInput(wire: number, target: number, targetPin: number): void;  // Connect wire to gate input
  setWireValue(wire: number, value: boolean): void;  // Set wire signal value
  simulate(maxIterations: number): number;  // Run simulation, returns iterations
  getWireValue(wire: number): boolean | undefined;  // Get current wire value
  clearValues(): void;  // Reset all wire values to undefined
}

// Supported logic gate types
export type GateType = 
  | 'and'    // AND gate - all inputs must be HIGH
  | 'or'     // OR gate - any input must be HIGH
  | 'not'    // NOT gate - inverts input
  | 'nand'   // NAND gate - inverted AND
  | 'nor'    // NOR gate - inverted OR
  | 'xor'    // XOR gate - odd number of HIGH inputs
  | 'xnor'   // XNOR gate - even number of HIGH inputs
  | 'buffer' // Buffer - passes input unchanged
  | 'input'  // Input source
  | 'output';// Output display

// Pure TypeScript implementation of the circuit simulator
// This provides a fallback when WebAssembly is not available
// or for development without needing to compile the Rust code
class CircuitSimulator implements Circuit {
  // Map of gate IDs to gate data
  private gates: Map<number, { type: GateType; inputs: number[]; outputs: number[] }> = new Map();
  // Map of wire IDs to wire data
  private wires: Map<number, { value: boolean | undefined; source?: number; targets: number[] }> = new Map();
  // ID counters for unique identification
  private nextGateId = 0;
  private nextWireId = 0;

  addGate(type: GateType): number {
    const id = this.nextGateId++;
    this.gates.set(id, { type, inputs: [], outputs: [] });
    return id;
  }

  addWire(): number {
    const id = this.nextWireId++;
    this.wires.set(id, { value: undefined, targets: [] });
    return id;
  }

  connect(source: number, sourcePin: number, wire: number): void {
    const gate = this.gates.get(source);
    const w = this.wires.get(wire);
    if (gate && w) {
      while (gate.outputs.length <= sourcePin) {
        gate.outputs.push(-1);
      }
      gate.outputs[sourcePin] = wire;
      w.source = source;
    }
  }

  connectInput(wire: number, target: number, targetPin: number): void {
    const gate = this.gates.get(target);
    const w = this.wires.get(wire);
    if (gate && w) {
      while (gate.inputs.length <= targetPin) {
        gate.inputs.push(-1);
      }
      gate.inputs[targetPin] = wire;
      if (!w.targets.includes(target)) {
        w.targets.push(target);
      }
    }
  }

  setWireValue(wire: number, value: boolean): void {
    const w = this.wires.get(wire);
    if (w) {
      w.value = value;
    }
  }

  // Evaluate a gate's output based on its type and input values
  // Returns undefined if inputs are undefined
  private evaluateGate(type: GateType, inputs: (boolean | undefined)[]): boolean | undefined {
    const definedInputs = inputs.filter(i => i !== undefined) as boolean[];
    
    // Can't evaluate without defined inputs
    if (definedInputs.length === 0) return undefined;
    
    switch (type) {
      case 'and':
        return definedInputs.every(v => v);
      case 'or':
        return definedInputs.some(v => v);
      case 'not':
        return inputs[0] !== undefined ? !inputs[0] : undefined;
      case 'nand':
        return !definedInputs.every(v => v);
      case 'nor':
        return !definedInputs.some(v => v);
      case 'xor':
        return definedInputs.filter(v => v).length % 2 === 1;
      case 'xnor':
        return definedInputs.filter(v => v).length % 2 === 0;
      case 'buffer':
      case 'input':
      case 'output':
        return inputs[0];
      default:
        return undefined;
    }
  }

  // Run circuit simulation until stable or max iterations reached
  // Returns the number of iterations performed
  simulate(maxIterations: number): number {
    let iterations = 0;
    let changed = true;

    // Continue simulating while values are changing
    while (changed && iterations < maxIterations) {
      changed = false;
      const newValues = new Map<number, boolean | undefined>();

      for (const [gateId, gate] of this.gates) {
        const inputValues = gate.inputs.map(wireId => {
          const wire = this.wires.get(wireId);
          return wire ? wire.value : undefined;
        });

        const outputValue = this.evaluateGate(gate.type, inputValues);

        for (let i = 0; i < gate.outputs.length; i++) {
          const wireId = gate.outputs[i];
          if (wireId >= 0) {
            newValues.set(wireId, outputValue);
          }
        }
      }

      for (const [wireId, value] of newValues) {
        const wire = this.wires.get(wireId);
        if (wire && wire.value !== value) {
          wire.value = value;
          changed = true;
        }
      }

      iterations++;
    }

    return iterations;
  }

  getWireValue(wire: number): boolean | undefined {
    const w = this.wires.get(wire);
    return w ? w.value : undefined;
  }

  clearValues(): void {
    for (const wire of this.wires.values()) {
      wire.value = undefined;
    }
  }
}

// Factory function to create a new circuit instance
// This abstracts the implementation choice between TypeScript and WASM
export function createCircuit(): Circuit {
  // TODO: Add logic to detect and use WASM module if available
  return new CircuitSimulator();
}