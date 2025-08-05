# Logic Builder Development Guide

## Getting Started

This guide will help you set up the Logic Builder development environment and understand the codebase structure.

## Prerequisites

### Required Software

- **Node.js**: Version 20 or higher
- **npm**: Version 10 or higher
- **Rust**: Latest stable version (for logic engine)
- **Cargo**: Rust package manager
- **Docker**: For containerized development
- **Git**: Version control

### Optional Tools

- **wasm-pack**: For building WebAssembly modules
- **VS Code**: Recommended IDE with extensions:
  - ESLint
  - Prettier
  - Rust Analyzer
  - Docker

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/shyguy1412/LogicBuilder.git
cd LogicBuilder
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

#### Server Dependencies
```bash
cd server
npm install
cd ..
```

#### Rust Dependencies
```bash
cd logic-circuit-engine
cargo build
cd ..
```

### 3. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
SERVER_PORT=3001
NODE_ENV=development
API_URL=http://localhost:3001
WS_URL=ws://localhost:3001
CORS_ORIGIN=http://localhost:3000
```

## Development Workflow

### Running the Application

#### Method 1: Docker (Recommended)
```bash
# Start all services
docker-compose up

# Start only the server
docker-compose up server

# Rebuild containers
docker-compose up --build
```

#### Method 2: Local Development

Terminal 1 - Frontend:
```bash
npm run dev
```

Terminal 2 - Backend:
```bash
cd server
npm run dev
```

### Building the Logic Engine

#### Standard Build
```bash
cd logic-circuit-engine
cargo build --release
```

#### WebAssembly Build
```bash
# Install wasm-pack if not already installed
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Build WASM module
./build-wasm.sh
```

## Code Structure

### Frontend Architecture

```
src/
├── main/                 # Electron main process
│   ├── main.ts          # Main process entry
│   └── preload.ts       # Preload script
├── render/              # Renderer process
│   ├── components/      # React/Preact components
│   │   ├── App/        # Main application
│   │   ├── Workspace/  # Circuit canvas
│   │   └── ...
│   ├── store/          # State management
│   │   └── circuit.ts  # Circuit state
│   ├── lib/            # Utilities
│   └── index.tsx       # Renderer entry
```

### Backend Architecture

```
server/
├── src/
│   ├── index.ts        # Express server
│   └── validators.ts   # Input validation
├── Dockerfile          # Container config
└── package.json        # Dependencies
```

### Logic Engine Architecture

```
logic-circuit-engine/
├── src/
│   └── lib.rs          # Core logic implementation
├── Cargo.toml          # Rust dependencies
└── tests/              # Unit tests
```

## Development Tasks

### Adding a New Logic Gate

1. **Update Rust Engine** (`logic-circuit-engine/src/lib.rs`):
```rust
// Add to GateType enum
pub enum GateType {
    // ... existing gates
    MyNewGate,
}

// Add evaluation logic
impl Gate {
    pub fn evaluate(&self, input_values: &[LogicValue]) -> Vec<LogicValue> {
        match self.gate_type {
            // ... existing cases
            GateType::MyNewGate => {
                // Implementation
            }
        }
    }
}
```

2. **Update TypeScript Bindings** (`lce-ts-bindings/index.ts`):
```typescript
export type GateType = 
  // ... existing types
  | 'mynewgate';

// Add to evaluateGate method
private evaluateGate(type: GateType, inputs: boolean[]): boolean | undefined {
    switch (type) {
        // ... existing cases
        case 'mynewgate':
            // Implementation
    }
}
```

3. **Update Component List** (`src/render/components/ComponentList/index.tsx`):
```typescript
const GATE_TYPES = [
    // ... existing gates
    { type: "mynewgate", label: "MYNEW", description: "My new gate" },
];
```

### Creating a New UI Component

1. Create component directory:
```bash
mkdir src/render/components/MyComponent
```

2. Create component files:
```typescript
// index.tsx
import { h } from "preact";
import style from "./MyComponent.module.css";

export function MyComponent() {
    return (
        <div class={style.container}>
            {/* Component content */}
        </div>
    );
}
```

3. Create styles:
```css
/* MyComponent.module.css */
.container {
    /* Styles */
}
```

### Adding an API Endpoint

1. **Add endpoint** (`server/src/index.ts`):
```typescript
app.get('/api/myendpoint', (req, res) => {
    // Implementation
    res.json({ data: result });
});
```

2. **Add validation** (`server/src/validators.ts`):
```typescript
export function validateMyData(data: any): boolean {
    // Validation logic
    return true;
}
```

## Testing

### Running Tests

#### Rust Tests
```bash
cd logic-circuit-engine
cargo test
```

#### TypeScript Tests
```bash
npm test  # When implemented
```

#### API Tests
```bash
cd server
npm test  # When implemented
```

### Manual Testing

1. **Test Logic Gates**:
   - Add gates to workspace
   - Connect with wires
   - Run simulation
   - Verify outputs

2. **Test API**:
   - Use Postman or curl
   - Test all CRUD operations
   - Verify WebSocket connections

3. **Test UI**:
   - Drag and drop operations
   - Responsive layout
   - Keyboard shortcuts
   - Error handling

## Debugging

### Frontend Debugging

1. **Chrome DevTools**:
   - Press `Ctrl+Shift+I` in Electron app
   - Use Sources tab for breakpoints
   - Check Network tab for API calls

2. **Console Logging**:
```typescript
import { Lumber } from "@/lib/log/Lumber";
Lumber.log(Lumber.RENDER, "Debug message", data);
```

### Backend Debugging

1. **Node.js Inspector**:
```bash
cd server
node --inspect src/index.js
```

2. **Logging**:
```typescript
console.log('Debug:', data);
console.error('Error:', error);
```

### Rust Debugging

1. **Print Debugging**:
```rust
println!("Debug: {:?}", variable);
dbg!(&variable);
```

2. **GDB/LLDB**:
```bash
cargo build
rust-gdb target/debug/logic-circuit-engine
```

## Performance Optimization

### Frontend Optimization

1. **Use Memoization**:
```typescript
import { memo } from "preact/compat";

export const MyComponent = memo(() => {
    // Component
});
```

2. **Optimize Re-renders**:
```typescript
const handleClick = useCallback(() => {
    // Handler
}, [dependencies]);
```

### Backend Optimization

1. **Use Caching**:
```typescript
const cache = new Map();

app.get('/api/data', (req, res) => {
    if (cache.has(key)) {
        return res.json(cache.get(key));
    }
    // Compute and cache
});
```

2. **Database Indexing** (when implemented):
```sql
CREATE INDEX idx_circuits_name ON circuits(name);
```

### Rust Optimization

1. **Use References**:
```rust
fn process(data: &[LogicValue]) {  // Borrow instead of move
    // Process
}
```

2. **Profile Code**:
```bash
cargo build --release
perf record ./target/release/logic-circuit-engine
perf report
```

## Common Issues

### Issue: npm install fails
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Docker build fails
**Solution:**
```bash
docker system prune -a
docker-compose build --no-cache
```

### Issue: Rust compilation errors
**Solution:**
```bash
cargo clean
cargo update
cargo build
```

### Issue: WebSocket connection fails
**Solution:**
- Check CORS settings
- Verify server is running
- Check firewall settings

## Code Style

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Prefer functional components
- Use meaningful variable names

### Rust

- Follow Rust naming conventions
- Use `cargo fmt` for formatting
- Use `cargo clippy` for linting
- Write unit tests for all functions
- Document public APIs

### CSS

- Use CSS Modules for scoping
- Follow BEM naming convention
- Use CSS variables for theming
- Mobile-first responsive design

## Git Workflow

### Branch Naming

- `feature/gate-type-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/what-documented` - Documentation
- `refactor/what-refactored` - Code refactoring

### Commit Messages

```
type(scope): description

[optional body]

[optional footer]
```

Examples:
```
feat(gates): add JK flip-flop gate
fix(simulation): correct XOR gate evaluation
docs(api): update WebSocket documentation
```

### Pull Request Process

1. Create feature branch
2. Make changes and commit
3. Push to remote
4. Create pull request
5. Code review
6. Merge to main

## Resources

### Documentation

- [Electron Documentation](https://www.electronjs.org/docs)
- [Preact Documentation](https://preactjs.com/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

### Learning Resources

- [Digital Logic Basics](https://www.electronics-tutorials.ws/logic/logic_1.html)
- [WebAssembly Guide](https://webassembly.org/getting-started/developers-guide/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### Community

- [GitHub Issues](https://github.com/shyguy1412/LogicBuilder/issues)
- [Discord Server](#) (if available)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/logic-circuits)