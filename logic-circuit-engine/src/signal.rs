use serde::Serialize;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub enum Signal {
    LOW = 0,
    HIGH = 1,
    FLOAT = -1,
}

impl std::ops::Not for Signal {
    type Output = Signal;

    fn not(self) -> Self::Output {
        match self {
            Signal::LOW => Signal::HIGH,
            Signal::HIGH => Signal::LOW,
            floating @ _ => floating,
        }
    }
}

impl std::ops::Not for &Signal {
    type Output = Signal;

    fn not(self) -> Self::Output {
        match self {
            Signal::LOW => Signal::HIGH,
            Signal::HIGH => Signal::LOW,
            floating @ _ => *floating,
        }
    }
}
