pub mod chip;
#[cfg(test)]
mod test;
use chip::Chip;
use serde::Serialize;
mod signal;

use std::collections::{HashMap, HashSet};

pub use signal::Signal;

type Pin = (usize, usize); // Chip index, Pin index

pub enum Error {
    InvalidInput,
}

pub enum Source {
    Signal(Signal),
    Pin(Pin),
}

#[derive(Debug, Clone, Serialize)]
pub struct Circuit {
    chips: Box<[Chip]>,
    inputs: Box<[Signal]>,
}

pub struct CircuitBuilder {
    chips: Vec<Chip>,
    table: HashMap<String, usize>,
}

impl CircuitBuilder {
    pub fn new(inputs: usize, _: usize) -> Self {
        Self {
            chips: vec![Chip::noop(inputs)],
            table: HashMap::new(),
        }
    }

    pub fn add_chip(mut self, name: &str, cb: impl Fn() -> Chip) -> Self {
        let chip = cb();
        self.chips.push(chip);

        self.table.insert(name.to_string(), self.chips.len() - 1);

        self
    }

    pub fn connect(mut self, name: &str, cb: impl Fn(&HashMap<String, usize>) -> Pin) -> Self {
        let chip = self.table.get(name).unwrap();
        self.chips[*chip].add_connection(cb(&self.table));

        self
    }

    pub fn input(mut self, cb: impl Fn(&HashMap<String, usize>) -> Pin) -> Self {
        self.chips[0].add_connection(cb(&self.table));

        self
    }

    pub fn output(mut self, cb: impl Fn(&HashMap<String, usize>) -> Pin) -> Self {
        let (chip, output_pin) = cb(&self.table);

        self.chips[chip].add_connection((0, output_pin));

        self
    }

    pub fn build(self) -> Circuit {
        let inputs = self.chips[0].connections.len();
        Circuit {
            chips: self.chips.into_boxed_slice(),
            inputs: vec![Signal::FLOAT; inputs].into_boxed_slice(),
        }
    }
}

impl Circuit {
    pub fn builder(inputs: usize, outputs: usize) -> CircuitBuilder {
        CircuitBuilder::new(inputs, outputs)
    }

    pub fn output(&self) -> Box<[Signal]> {
        self.chips[0].output()
    }

    pub fn tick(&mut self) {
        let updated = &mut HashSet::new();

        updated.insert(0);

        for i in 0..self.inputs.len() {
            let signal = self.inputs[i];
            let (chip, pin) = self.chips[0].connections[i];
            self.chips[chip].inputs[pin] = signal;
        }

        for i in 0..self.chips[0].connections.len() {
            let (chip, ..) = self.chips[0].connections[i];
            self.update_chip(chip, updated);
        }
    }

    fn update_chip(&mut self, chip: usize, updated: &mut HashSet<usize>) {
        if updated.contains(&chip) {
            return;
        }

        let result = &self.chips[chip].output();

        result.into_iter().enumerate().for_each(|(i, signal)| {
            let (chip, pin) = self.chips[chip].connections[i];
            self.chips[chip].inputs[pin] = *signal;
        });

        updated.insert(chip);

        for i in 0..self.chips[chip].connections.len() {
            let (chip, ..) = self.chips[chip].connections[i];
            self.update_chip(chip, updated);
        }
    }
}
