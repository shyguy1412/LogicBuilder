use std::mem;

use serde::Serialize;

use crate::{Circuit, Pin, Signal};

#[derive(Debug, Clone, Serialize)]
pub struct Chip {
    pub(crate) inputs: Box<[Signal]>,
    pub(crate) connections: Box<[Pin]>,
    behavior: Behavior,
}

#[derive(Debug, Clone, Serialize)]
pub enum Behavior {
    Circuit(Box<Circuit>),
    Gate(Gate),
}

impl Chip {
    pub fn output(&self) -> Box<[Signal]> {
        match &self.behavior {
            Behavior::Circuit(_) => todo!(),
            Behavior::Gate(gate) => gate.behavior(&self.inputs), //(gate)(&self.inputs),
        }
    }

    pub(crate) fn add_connection(&mut self, connection: Pin) {
        let mut vec = mem::take(&mut self.connections).into_vec();
        vec.push(connection);
        self.connections = vec.into_boxed_slice();
    }
}

macro_rules! behavior {
    ($(
        $gate:ident: fn $ident:ident ($input:ident: &[Signal]) -> Box<[Signal]>{$($body:tt)*}
    )*) => {
        #[derive(Debug, Clone, Serialize)]
        pub enum Gate {
            $($gate),*
        }

        impl Gate {
            fn behavior(&self, input: &[Signal]) -> Box<[Signal]> {
                match self {
                    $(Gate::$gate => $ident(input)),*
                }
            }
        }

        $(
        pub fn $ident ($input: &[Signal]) -> Box<[Signal]>{
            $($body)*
        }

        impl Chip {
            pub fn $ident(inputs: usize) -> Self {
                Self{
                    inputs: vec![Signal::FLOAT; inputs].into_boxed_slice(),
                    connections: Box::new([]),
                    behavior: Behavior::Gate(Gate::$gate)
                }
            }
        }
        )*
    };
}

behavior! {
    NOOP: fn noop(input: &[Signal]) -> Box<[Signal]> {
        input.into()
    }

    AND: fn and(input: &[Signal]) -> Box<[Signal]> {
        input
            .iter()
            .all(|signal| *signal == Signal::HIGH)
            .then_some(Box::new([Signal::HIGH]))
            .unwrap_or(Box::new([Signal::LOW]))
    }

    OR: fn or(input: &[Signal]) -> Box<[Signal]> {
        input
        .iter()
        .any(|signal| *signal == Signal::HIGH)
        .then_some(Box::new([Signal::HIGH]))
        .unwrap_or(Box::new([Signal::LOW]))
    }

    NOT: fn not(input: &[Signal]) -> Box<[Signal]> {
        input
        .iter()
        .next()
        .map(|signal| match signal {
            Signal::HIGH => Box::new([Signal::LOW]),
            _ => Box::new([Signal::HIGH]),
        })
        .unwrap_or(Box::new([Signal::HIGH]))
    }

    XOR: fn xor(input: &[Signal]) -> Box<[Signal]> {
        input
        .iter()
        .filter(|signal| **signal == Signal::HIGH)
        .count()
        .eq(&1)
        .then_some(Box::new([Signal::HIGH]))
        .unwrap_or(Box::new([Signal::LOW]))
    }
}
