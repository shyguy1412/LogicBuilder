export interface GateData {
  id: number;
  type: 'and' | 'or' | 'not' | 'nand' | 'nor' | 'xor' | 'xnor' | 'buffer' | 'input' | 'output';
  position: { x: number; y: number };
  inputs: number[];
  outputs: number[];
}

export interface WireData {
  id: number;
  from: { gateId: number; pin: number };
  to: { gateId: number; pin: number };
}

export interface CircuitData {
  gates: GateData[];
  wires: WireData[];
}

export function validateCircuitData(data: any): data is CircuitData {
  if (!data || typeof data !== 'object') return false;
  
  if (!Array.isArray(data.gates) || !Array.isArray(data.wires)) return false;
  
  for (const gate of data.gates) {
    if (!validateGate(gate)) return false;
  }
  
  for (const wire of data.wires) {
    if (!validateWire(wire)) return false;
  }
  
  return true;
}

function validateGate(gate: any): gate is GateData {
  if (!gate || typeof gate !== 'object') return false;
  
  if (typeof gate.id !== 'number') return false;
  
  const validTypes = ['and', 'or', 'not', 'nand', 'nor', 'xor', 'xnor', 'buffer', 'input', 'output'];
  if (!validTypes.includes(gate.type)) return false;
  
  if (!gate.position || typeof gate.position.x !== 'number' || typeof gate.position.y !== 'number') {
    return false;
  }
  
  if (!Array.isArray(gate.inputs) || !Array.isArray(gate.outputs)) return false;
  
  return true;
}

function validateWire(wire: any): wire is WireData {
  if (!wire || typeof wire !== 'object') return false;
  
  if (typeof wire.id !== 'number') return false;
  
  if (!wire.from || typeof wire.from.gateId !== 'number' || typeof wire.from.pin !== 'number') {
    return false;
  }
  
  if (!wire.to || typeof wire.to.gateId !== 'number' || typeof wire.to.pin !== 'number') {
    return false;
  }
  
  return true;
}