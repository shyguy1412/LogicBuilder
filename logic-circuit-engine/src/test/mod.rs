use crate::{Circuit, Signal, chip::Chip};

#[test]
pub fn simple_and_circuit() {
    use Signal::*;

    let mut circuit = Circuit::builder(2, 1)
        .add_chip("and_chip", || Chip::and(2))
        .input(|circuit| (*circuit.get("and_chip").unwrap(), 0))
        .input(|circuit| (*circuit.get("and_chip").unwrap(), 1))
        .output(|circuit| (*circuit.get("and_chip").unwrap(), 0))
        .build();

    circuit.inputs = vec![HIGH, HIGH].into_boxed_slice();

    circuit.tick();

    let output = circuit.output();

    assert_eq!(output[0], HIGH);

    circuit.inputs = vec![HIGH, LOW].into_boxed_slice();

    circuit.tick();

    let output = circuit.output();

    assert_eq!(output[0], LOW);

    circuit.inputs = vec![LOW, HIGH].into_boxed_slice();

    circuit.tick();

    let output = circuit.output();

    assert_eq!(output[0], LOW);

    circuit.inputs = vec![LOW, LOW].into_boxed_slice();

    circuit.tick();

    let output = circuit.output();

    assert_eq!(output[0], LOW);
}

#[test]
pub fn not_feedback() {
    use Signal::*;

    let mut circuit = Circuit::builder(2, 1)
        .add_chip("not_chip", || Chip::not(1))
        .output(|circuit| (*circuit.get("not_chip").unwrap(), 0))
        .connect("not_chip", |circuit| (*circuit.get("not_chip").unwrap(), 0))
        .build();

    circuit.tick();
    let output = circuit.output();
    assert_eq!(output[0], HIGH);

    circuit.tick();
    let output = circuit.output();
    assert_eq!(output[0], LOW);

    circuit.tick();
    let output = circuit.output();
    assert_eq!(output[0], HIGH);

    circuit.tick();
    let output = circuit.output();
    assert_eq!(output[0], LOW);
}
