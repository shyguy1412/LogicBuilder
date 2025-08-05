# Logic Builder Architecture Documentation

## Overview

Logic Builder is a web-based digital logic circuit designer and simulator built with a modern, modular architecture. The application combines high-performance Rust-based simulation with a responsive TypeScript/Preact frontend.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Electron)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │   Preact    │  │   XState    │  │  Circuit Editor  │   │
│  │     UI      │  │    Store    │  │   Components     │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
│                            │                                │
│  ┌─────────────────────────▼────────────────────────────┐  │
│  │          TypeScript Bindings / WASM Interface        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    Logic Engine (Rust/WASM)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │    Gates    │  │    Wires    │  │   Simulation     │   │
│  │   Library   │  │  Management │  │     Engine       │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
└───────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                      Backend API (Express)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │   REST API  │  │  WebSocket  │  │    Database      │   │
│  │  Endpoints  │  │   Server    │  │   (In-Memory)    │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend Layer (Electron + Preact)

The frontend is built as an Electron application using Preact for the UI layer.

**Key Technologies:**
- **Electron**: Desktop application framework
- **Preact**: Lightweight React alternative
- **TypeScript**: Type-safe development
- **ESBuild**: Fast bundling and compilation
- **CSS Modules**: Scoped styling

**Main Components:**

- **App Component** (`src/render/components/App/`)
  - Main application container
  - Manages routing and layout
  - Integrates titlebar, sidebar, and workspace

- **Workspace** (`src/render/components/Workspace/`)
  - Main canvas for circuit design
  - Handles drag-and-drop operations
  - Manages grid-based component placement

- **Component List** (`src/render/components/ComponentList/`)
  - Palette of available logic gates
  - Drag source for adding components

- **Simulation Panel** (`src/render/components/SimulationPanel/`)
  - Controls for running simulations
  - Speed adjustment and step controls
  - Circuit statistics display

### 2. State Management (XState Store)

State is managed using XState's atom pattern for reactive updates.

**Key Stores:**

- **Circuit Store** (`src/render/store/circuit.ts`)
  - Manages circuit state and simulation
  - Tracks gates and wire connections
  - Handles simulation control

- **Workspace Store** (`src/render/store/workspace.ts`)
  - Manages visual layout
  - Tracks component positions
  - Handles selection and editing

### 3. Logic Engine (Rust)

The core simulation engine is written in Rust for performance.

**Location:** `logic-circuit-engine/src/lib.rs`

**Key Features:**
- **Gate Evaluation**: Implements all standard logic gates
- **Wire Propagation**: Manages signal propagation
- **Simulation Loop**: Iterative evaluation until stable state
- **WASM Bindings**: Optional compilation to WebAssembly

**Supported Gates:**
- Basic: AND, OR, NOT
- Compound: NAND, NOR, XOR, XNOR
- Utility: Buffer, Input, Output

### 4. TypeScript Bindings

Provides a consistent interface between frontend and logic engine.

**Location:** `lce-ts-bindings/index.ts`

**Features:**
- **Circuit Interface**: Standardized API for circuit operations
- **Pure TypeScript Implementation**: Fallback when WASM unavailable
- **Type Safety**: Full TypeScript typing for all operations

### 5. Backend API (Express)

RESTful API server for persistence and collaboration.

**Location:** `server/src/index.ts`

**Endpoints:**

```
GET    /health                 - Health check
GET    /api/circuits           - List all circuits
POST   /api/circuits           - Create new circuit
GET    /api/circuits/:id       - Get specific circuit
PUT    /api/circuits/:id       - Update circuit
DELETE /api/circuits/:id       - Delete circuit
POST   /api/simulate           - Start simulation
GET    /api/simulate/:session  - Get simulation status
```

**WebSocket Events:**
- `subscribe`: Subscribe to circuit updates
- `update`: Broadcast circuit changes
- `circuit-update`: Receive updates from other clients

### 6. Docker Infrastructure

Complete containerization for easy deployment.

**Containers:**
- **Server**: Node.js Express API
- **Frontend**: Electron app (development)
- **Nginx**: Production web server

**Configuration Files:**
- `docker-compose.yml`: Development setup
- `docker-compose.prod.yml`: Production setup
- `Dockerfile`: Frontend container
- `server/Dockerfile`: API server container

## Data Flow

### Circuit Creation Flow

1. User drags gate from Component List
2. Workspace captures drop event
3. Circuit Store adds gate to state
4. Logic Engine creates gate instance
5. UI updates to show new gate

### Simulation Flow

1. User clicks "Start" in Simulation Panel
2. Circuit Store begins simulation loop
3. Logic Engine evaluates gates
4. Wire values propagate
5. UI updates to show signal states
6. Process repeats until stable or stopped

### Persistence Flow

1. User saves circuit
2. Frontend serializes circuit state
3. POST request to API server
4. Server validates and stores data
5. WebSocket broadcasts to other clients

## Development Guidelines

### Code Organization

```
src/
├── main/           # Electron main process
├── render/         # Renderer process
│   ├── components/ # UI components
│   ├── store/      # State management
│   └── lib/        # Utilities
server/
├── src/            # API source code
logic-circuit-engine/
├── src/            # Rust source
lce-ts-bindings/
├── index.ts        # TypeScript bindings
```

### Adding New Gate Types

1. Add to `GateType` enum in Rust (`logic-circuit-engine/src/lib.rs`)
2. Implement evaluation logic in `Gate::evaluate()`
3. Add to TypeScript types (`lce-ts-bindings/index.ts`)
4. Update Component List UI
5. Add tests for new gate type

### Performance Considerations

- **Simulation**: Runs in separate thread/WASM module
- **Rendering**: Only updates changed components
- **State Updates**: Batched using XState atoms
- **WebSocket**: Debounced updates to prevent flooding

## Testing Strategy

### Unit Tests
- Rust logic engine: `cargo test`
- TypeScript components: `npm test`

### Integration Tests
- API endpoints: Postman/Jest
- WebSocket: ws client testing

### E2E Tests
- Electron app: Spectron/Playwright
- Full circuit simulation scenarios

## Deployment

### Development
```bash
docker-compose up
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Scaling Considerations

- **Horizontal Scaling**: API servers behind load balancer
- **Database**: Move from in-memory to PostgreSQL/MongoDB
- **WebSocket**: Redis pub/sub for multi-server setup
- **CDN**: Static assets served via CDN

## Security Considerations

- **Input Validation**: All API inputs validated
- **CORS**: Configured for specific origins
- **WebSocket**: Authentication via JWT tokens
- **Circuit Validation**: Size limits and complexity checks

## Future Enhancements

1. **Subcircuits**: Reusable circuit modules
2. **Truth Tables**: Automatic generation
3. **Timing Diagrams**: Signal visualization
4. **Export Formats**: Verilog, VHDL generation
5. **Collaborative Editing**: Real-time multi-user support
6. **Mobile Support**: Touch-friendly interface
7. **Cloud Storage**: User accounts and cloud saves