// Logic Circuit Engine - Core simulation engine for digital logic circuits
// This module provides a complete logic gate simulation system written in Rust
// with optional WebAssembly bindings for browser integration

use std::collections::{HashMap, HashSet};
use std::fmt;

// Unique identifier for logic gates/nodes in the circuit
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct NodeId(pub usize);

// Unique identifier for wires connecting logic gates
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct WireId(pub usize);

// Represents the three possible states of a digital signal
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LogicValue {
    Low,       // Logic 0 / FALSE
    High,      // Logic 1 / TRUE
    Undefined, // Unknown or uninitialized state
}

impl LogicValue {
    // Convert LogicValue to Option<bool>
    // Returns None for Undefined state
    pub fn to_bool(&self) -> Option<bool> {
        match self {
            LogicValue::Low => Some(false),
            LogicValue::High => Some(true),
            LogicValue::Undefined => None,
        }
    }

    // Create LogicValue from boolean
    pub fn from_bool(value: bool) -> Self {
        if value {
            LogicValue::High
        } else {
            LogicValue::Low
        }
    }
}

// Supported logic gate types
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum GateType {
    And,    // Output HIGH when all inputs are HIGH
    Or,     // Output HIGH when any input is HIGH
    Not,    // Inverts the input signal
    Nand,   // Inverted AND gate
    Nor,    // Inverted OR gate
    Xor,    // Exclusive OR - HIGH when odd number of inputs are HIGH
    Xnor,   // Exclusive NOR - HIGH when even number of inputs are HIGH
    Buffer, // Passes input unchanged (signal amplifier)
    Input,  // Input source for the circuit
    Output, // Output display for the circuit
}

// Represents a logic gate with its connections
#[derive(Debug, Clone)]
pub struct Gate {
    pub gate_type: GateType,     // Type of logic operation
    pub inputs: Vec<WireId>,      // Input wire connections
    pub outputs: Vec<WireId>,     // Output wire connections
}

impl Gate {
    // Create a new gate of specified type
    pub fn new(gate_type: GateType) -> Self {
        Gate {
            gate_type,
            inputs: Vec::new(),
            outputs: Vec::new(),
        }
    }

    // Evaluate the gate's output based on input values
    // Returns a vector of output values (most gates have single output)
    pub fn evaluate(&self, input_values: &[LogicValue]) -> Vec<LogicValue> {
        match self.gate_type {
            GateType::And => {
                let result = input_values.iter().all(|&v| v == LogicValue::High);
                vec![LogicValue::from_bool(result)]
            }
            GateType::Or => {
                let result = input_values.iter().any(|&v| v == LogicValue::High);
                vec![LogicValue::from_bool(result)]
            }
            GateType::Not => {
                if input_values.is_empty() {
                    vec![LogicValue::Undefined]
                } else {
                    vec![match input_values[0] {
                        LogicValue::High => LogicValue::Low,
                        LogicValue::Low => LogicValue::High,
                        LogicValue::Undefined => LogicValue::Undefined,
                    }]
                }
            }
            GateType::Nand => {
                let and_result = input_values.iter().all(|&v| v == LogicValue::High);
                vec![LogicValue::from_bool(!and_result)]
            }
            GateType::Nor => {
                let or_result = input_values.iter().any(|&v| v == LogicValue::High);
                vec![LogicValue::from_bool(!or_result)]
            }
            GateType::Xor => {
                let high_count = input_values.iter().filter(|&&v| v == LogicValue::High).count();
                vec![LogicValue::from_bool(high_count % 2 == 1)]
            }
            GateType::Xnor => {
                let high_count = input_values.iter().filter(|&&v| v == LogicValue::High).count();
                vec![LogicValue::from_bool(high_count % 2 == 0)]
            }
            GateType::Buffer | GateType::Input | GateType::Output => {
                if input_values.is_empty() {
                    vec![LogicValue::Undefined]
                } else {
                    vec![input_values[0]]
                }
            }
        }
    }
}

// Represents a wire connection between gates
#[derive(Debug, Clone)]
pub struct Wire {
    pub id: WireId,                  // Unique wire identifier
    pub source: Option<NodeId>,      // Gate that drives this wire
    pub targets: Vec<NodeId>,        // Gates that read from this wire
    pub value: LogicValue,           // Current signal value on the wire
}

impl Wire {
    pub fn new(id: WireId) -> Self {
        Wire {
            id,
            source: None,
            targets: Vec::new(),
            value: LogicValue::Undefined,
        }
    }
}

// Main circuit container that holds all gates and wires
pub struct Circuit {
    nodes: HashMap<NodeId, Gate>,    // All gates in the circuit
    wires: HashMap<WireId, Wire>,    // All wire connections
    next_node_id: usize,             // Counter for generating unique node IDs
    next_wire_id: usize,             // Counter for generating unique wire IDs
}

impl Circuit {
    pub fn new() -> Self {
        Circuit {
            nodes: HashMap::new(),
            wires: HashMap::new(),
            next_node_id: 0,
            next_wire_id: 0,
        }
    }

    pub fn add_gate(&mut self, gate_type: GateType) -> NodeId {
        let id = NodeId(self.next_node_id);
        self.next_node_id += 1;
        self.nodes.insert(id, Gate::new(gate_type));
        id
    }

    pub fn add_wire(&mut self) -> WireId {
        let id = WireId(self.next_wire_id);
        self.next_wire_id += 1;
        self.wires.insert(id, Wire::new(id));
        id
    }

    pub fn connect(&mut self, source: NodeId, source_pin: usize, wire: WireId) {
        if let Some(gate) = self.nodes.get_mut(&source) {
            if source_pin >= gate.outputs.len() {
                gate.outputs.resize(source_pin + 1, wire);
            }
            gate.outputs[source_pin] = wire;
        }
        
        if let Some(w) = self.wires.get_mut(&wire) {
            w.source = Some(source);
        }
    }

    pub fn connect_input(&mut self, wire: WireId, target: NodeId, target_pin: usize) {
        if let Some(gate) = self.nodes.get_mut(&target) {
            if target_pin >= gate.inputs.len() {
                gate.inputs.resize(target_pin + 1, wire);
            }
            gate.inputs[target_pin] = wire;
        }
        
        if let Some(w) = self.wires.get_mut(&wire) {
            if !w.targets.contains(&target) {
                w.targets.push(target);
            }
        }
    }

    pub fn set_wire_value(&mut self, wire: WireId, value: LogicValue) {
        if let Some(w) = self.wires.get_mut(&wire) {
            w.value = value;
        }
    }

    // Perform one simulation step - evaluate all gates and update wire values
    // Returns true if any wire value changed
    pub fn simulate_step(&mut self) -> bool {
        let mut changed = false;
        let mut new_values = HashMap::new();

        for (&node_id, gate) in &self.nodes {
            let input_values: Vec<LogicValue> = gate.inputs
                .iter()
                .map(|&wire_id| {
                    self.wires.get(&wire_id)
                        .map(|w| w.value)
                        .unwrap_or(LogicValue::Undefined)
                })
                .collect();

            let output_values = gate.evaluate(&input_values);

            for (i, &wire_id) in gate.outputs.iter().enumerate() {
                if i < output_values.len() {
                    new_values.insert(wire_id, output_values[i]);
                }
            }
        }

        for (wire_id, value) in new_values {
            if let Some(wire) = self.wires.get_mut(&wire_id) {
                if wire.value != value {
                    wire.value = value;
                    changed = true;
                }
            }
        }

        changed
    }

    // Run simulation until stable state or max iterations reached
    // Returns the number of iterations performed
    pub fn simulate(&mut self, max_iterations: usize) -> usize {
        let mut iterations = 0;
        while iterations < max_iterations {
            if !self.simulate_step() {
                break; // Circuit reached stable state
            }
            iterations += 1;
        }
        iterations
    }

    pub fn get_wire_value(&self, wire: WireId) -> LogicValue {
        self.wires.get(&wire)
            .map(|w| w.value)
            .unwrap_or(LogicValue::Undefined)
    }

    pub fn clear_values(&mut self) {
        for wire in self.wires.values_mut() {
            wire.value = LogicValue::Undefined;
        }
    }
}

#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub struct WasmCircuit {
    circuit: Circuit,
}

#[cfg(feature = "wasm")]
#[wasm_bindgen]
impl WasmCircuit {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        WasmCircuit {
            circuit: Circuit::new(),
        }
    }

    #[wasm_bindgen(js_name = addGate)]
    pub fn add_gate(&mut self, gate_type: String) -> usize {
        let gate_type = match gate_type.as_str() {
            "and" => GateType::And,
            "or" => GateType::Or,
            "not" => GateType::Not,
            "nand" => GateType::Nand,
            "nor" => GateType::Nor,
            "xor" => GateType::Xor,
            "xnor" => GateType::Xnor,
            "buffer" => GateType::Buffer,
            "input" => GateType::Input,
            "output" => GateType::Output,
            _ => GateType::Buffer,
        };
        self.circuit.add_gate(gate_type).0
    }

    #[wasm_bindgen(js_name = addWire)]
    pub fn add_wire(&mut self) -> usize {
        self.circuit.add_wire().0
    }

    #[wasm_bindgen]
    pub fn connect(&mut self, source: usize, source_pin: usize, wire: usize) {
        self.circuit.connect(NodeId(source), source_pin, WireId(wire));
    }

    #[wasm_bindgen(js_name = connectInput)]
    pub fn connect_input(&mut self, wire: usize, target: usize, target_pin: usize) {
        self.circuit.connect_input(WireId(wire), NodeId(target), target_pin);
    }

    #[wasm_bindgen(js_name = setWireValue)]
    pub fn set_wire_value(&mut self, wire: usize, value: bool) {
        self.circuit.set_wire_value(WireId(wire), LogicValue::from_bool(value));
    }

    #[wasm_bindgen]
    pub fn simulate(&mut self, max_iterations: usize) -> usize {
        self.circuit.simulate(max_iterations)
    }

    #[wasm_bindgen(js_name = getWireValue)]
    pub fn get_wire_value(&self, wire: usize) -> Option<bool> {
        self.circuit.get_wire_value(WireId(wire)).to_bool()
    }

    #[wasm_bindgen(js_name = clearValues)]
    pub fn clear_values(&mut self) {
        self.circuit.clear_values();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_and_gate() {
        let mut circuit = Circuit::new();
        
        let and_gate = circuit.add_gate(GateType::And);
        let input1 = circuit.add_wire();
        let input2 = circuit.add_wire();
        let output = circuit.add_wire();
        
        circuit.connect_input(input1, and_gate, 0);
        circuit.connect_input(input2, and_gate, 1);
        circuit.connect(and_gate, 0, output);
        
        circuit.set_wire_value(input1, LogicValue::High);
        circuit.set_wire_value(input2, LogicValue::High);
        circuit.simulate(10);
        
        assert_eq!(circuit.get_wire_value(output), LogicValue::High);
        
        circuit.set_wire_value(input1, LogicValue::Low);
        circuit.simulate(10);
        
        assert_eq!(circuit.get_wire_value(output), LogicValue::Low);
    }

    #[test]
    fn test_or_gate() {
        let mut circuit = Circuit::new();
        
        let or_gate = circuit.add_gate(GateType::Or);
        let input1 = circuit.add_wire();
        let input2 = circuit.add_wire();
        let output = circuit.add_wire();
        
        circuit.connect_input(input1, or_gate, 0);
        circuit.connect_input(input2, or_gate, 1);
        circuit.connect(or_gate, 0, output);
        
        circuit.set_wire_value(input1, LogicValue::Low);
        circuit.set_wire_value(input2, LogicValue::High);
        circuit.simulate(10);
        
        assert_eq!(circuit.get_wire_value(output), LogicValue::High);
    }

    #[test]
    fn test_not_gate() {
        let mut circuit = Circuit::new();
        
        let not_gate = circuit.add_gate(GateType::Not);
        let input = circuit.add_wire();
        let output = circuit.add_wire();
        
        circuit.connect_input(input, not_gate, 0);
        circuit.connect(not_gate, 0, output);
        
        circuit.set_wire_value(input, LogicValue::High);
        circuit.simulate(10);
        
        assert_eq!(circuit.get_wire_value(output), LogicValue::Low);
    }
}