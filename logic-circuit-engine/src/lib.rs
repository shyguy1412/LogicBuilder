pub mod chip;
#[cfg(test)]
mod test;
use chip::Chip;
use serde::Serialize;
mod signal;

use std::collections::{HashMap, HashSet};

pub use signal::Signal;

type Pin = (usize, usize); // Chip index, Pin index
type Connection = (usize, Pin); //Source Pin index, Target Pin

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
    // inputs: Box<[Signal]>,
}

pub struct CircuitBuilder {
    chips: Vec<Chip>,
    table: HashMap<String, usize>,
}

impl CircuitBuilder {
    pub fn new(inputs: usize, outputs: usize) -> Self {
        Self {
            chips: vec![Chip::noop(inputs), Chip::noop(outputs)],
            table: HashMap::new(),
        }
    }

    pub fn add_chip(mut self, name: &str, cb: impl Fn() -> Chip) -> Self {
        let chip = cb();
        self.chips.push(chip);

        self.table.insert(name.to_string(), self.chips.len() - 1);

        self
    }

    pub fn connect(
        mut self,
        name: &str,
        cb: impl Fn(&HashMap<String, usize>) -> Connection,
    ) -> Self {
        let chip = self.table.get(name).unwrap();
        self.chips[*chip].add_connection(cb(&self.table));

        self
    }

    pub fn input(mut self, cb: impl Fn(&HashMap<String, usize>) -> Connection) -> Self {
        self.chips[0].add_connection(cb(&self.table));

        self
    }

    pub fn output(mut self, cb: impl Fn(&HashMap<String, usize>) -> Connection) -> Self {
        let (chip, (source, target)) = cb(&self.table);

        self.chips[chip].add_connection((source, (1, target)));

        self
    }

    pub fn build(self) -> Circuit {
        Circuit {
            chips: self.chips.into_boxed_slice(),
        }
    }
}

impl Circuit {
    pub fn builder(inputs: usize, outputs: usize) -> CircuitBuilder {
        CircuitBuilder::new(inputs, outputs)
    }

    pub fn output(&self) -> Box<[Signal]> {
        self.chips[1].output()
    }

    pub fn tick(&mut self) {
        let updated = &mut HashSet::new();

        //TODO Meaningfully sort the chips
        for i in 0..self.chips.len() {
            self.update_chip(i, updated);
        }
    }

    fn update_chip(&mut self, chip: usize, updated: &mut HashSet<usize>) {
        if updated.contains(&chip) {
            return;
        }

        updated.insert(chip);

        let result = &self.chips[chip].output();

        for i in 0..self.chips[chip].connections.len() {
            let (source, (chip, pin)) = self.chips[chip].connections[i];
            let signal = result.get(source).unwrap_or(&Signal::FLOAT);
            self.chips[chip].inputs[pin] = *signal;
        }
    }
}
