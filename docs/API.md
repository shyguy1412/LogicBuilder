# Logic Builder API Documentation

## Base URL

Development: `http://localhost:3001`  
Production: `https://your-domain.com/api`

## Authentication

Currently, the API is open without authentication. In production, implement JWT or OAuth2.

## Response Format

All responses follow this structure:

### Success Response
```json
{
  "data": { ... },
  "status": "success"
}
```

### Error Response
```json
{
  "error": "Error message",
  "status": "error",
  "code": 400
}
```

## Endpoints

### Health Check

Check if the server is running and healthy.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Circuits

#### List All Circuits

Get a list of all saved circuits (without circuit data).

**Endpoint:** `GET /api/circuits`

**Response:**
```json
[
  {
    "id": "uuid-1234",
    "name": "AND Gate Example",
    "description": "Simple AND gate demonstration",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Get Circuit Details

Get complete circuit data including gates and wires.

**Endpoint:** `GET /api/circuits/:id`

**Parameters:**
- `id` (string): Circuit UUID

**Response:**
```json
{
  "id": "uuid-1234",
  "name": "AND Gate Example",
  "description": "Simple AND gate demonstration",
  "data": {
    "gates": [
      {
        "id": 1,
        "type": "and",
        "position": { "x": 10, "y": 10 },
        "inputs": [0, 1],
        "outputs": [2]
      }
    ],
    "wires": [
      {
        "id": 0,
        "from": { "gateId": -1, "pin": 0 },
        "to": { "gateId": 1, "pin": 0 }
      }
    ]
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Create Circuit

Save a new circuit design.

**Endpoint:** `POST /api/circuits`

**Request Body:**
```json
{
  "name": "My Circuit",
  "description": "Circuit description",
  "data": {
    "gates": [...],
    "wires": [...]
  }
}
```

**Response:**
```json
{
  "id": "uuid-5678",
  "name": "My Circuit",
  "description": "Circuit description",
  "data": { ... },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Update Circuit

Modify an existing circuit.

**Endpoint:** `PUT /api/circuits/:id`

**Parameters:**
- `id` (string): Circuit UUID

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "data": {
    "gates": [...],
    "wires": [...]
  }
}
```

**Response:**
```json
{
  "id": "uuid-5678",
  "name": "Updated Name",
  "description": "Updated description",
  "data": { ... },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T01:00:00.000Z"
}
```

#### Delete Circuit

Remove a circuit from the database.

**Endpoint:** `DELETE /api/circuits/:id`

**Parameters:**
- `id` (string): Circuit UUID

**Response:** `204 No Content`

---

### Simulation

#### Start Simulation

Begin a new simulation session for a circuit.

**Endpoint:** `POST /api/simulate`

**Request Body:**
```json
{
  "circuitId": "uuid-1234",
  "inputs": {
    "0": true,
    "1": false
  }
}
```

**Response:**
```json
{
  "sessionId": "session-uuid-9012"
}
```

#### Get Simulation Status

Check the status and results of a simulation session.

**Endpoint:** `GET /api/simulate/:sessionId`

**Parameters:**
- `sessionId` (string): Simulation session UUID

**Response:**
```json
{
  "id": "session-uuid-9012",
  "circuitId": "uuid-1234",
  "status": "completed",
  "currentStep": 5,
  "results": [
    {
      "step": 0,
      "outputs": { "output1": true, "output2": false }
    },
    {
      "step": 1,
      "outputs": { "output1": false, "output2": true }
    }
  ]
}
```

#### Stop Simulation

Terminate a running simulation session.

**Endpoint:** `POST /api/simulate/:sessionId/stop`

**Parameters:**
- `sessionId` (string): Simulation session UUID

**Response:**
```json
{
  "status": "stopped"
}
```

---

## WebSocket API

Connect to the WebSocket server for real-time collaboration.

**Connection URL:** `ws://localhost:3001` (development)

### Message Types

#### Subscribe to Circuit

Subscribe to real-time updates for a specific circuit.

**Send:**
```json
{
  "type": "subscribe",
  "circuitId": "uuid-1234"
}
```

**Receive:**
```json
{
  "type": "subscribed",
  "circuitId": "uuid-1234"
}
```

#### Send Circuit Update

Broadcast circuit changes to other connected clients.

**Send:**
```json
{
  "type": "update",
  "circuitId": "uuid-1234",
  "changes": {
    "gates": [...],
    "wires": [...]
  }
}
```

#### Receive Circuit Update

Receive updates from other clients.

**Receive:**
```json
{
  "type": "circuit-update",
  "circuitId": "uuid-1234",
  "changes": {
    "gates": [...],
    "wires": [...]
  }
}
```

---

## Data Models

### Gate Object

```typescript
interface Gate {
  id: number;                    // Unique gate identifier
  type: GateType;                // Gate type (and, or, not, etc.)
  position: {                    // Visual position on grid
    x: number;
    y: number;
  };
  inputs: number[];              // Wire IDs connected to inputs
  outputs: number[];             // Wire IDs connected to outputs
}
```

### Wire Object

```typescript
interface Wire {
  id: number;                    // Unique wire identifier
  from: {                        // Source connection
    gateId: number;              // Source gate ID (-1 for external input)
    pin: number;                 // Output pin number
  };
  to: {                          // Target connection
    gateId: number;              // Target gate ID
    pin: number;                 // Input pin number
  };
}
```

### Gate Types

```typescript
type GateType = 
  | 'and'    // AND gate
  | 'or'     // OR gate
  | 'not'    // NOT gate
  | 'nand'   // NAND gate
  | 'nor'    // NOR gate
  | 'xor'    // XOR gate
  | 'xnor'   // XNOR gate
  | 'buffer' // Buffer
  | 'input'  // Input source
  | 'output' // Output display
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid input data |
| 404  | Not Found - Resource doesn't exist |
| 409  | Conflict - Resource already exists |
| 500  | Internal Server Error |

---

## Rate Limiting

Currently not implemented. In production, consider:
- 100 requests per minute per IP
- 1000 WebSocket messages per hour per connection

---

## Examples

### Creating a Simple AND Gate Circuit

```bash
curl -X POST http://localhost:3001/api/circuits \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Simple AND Gate",
    "description": "Two-input AND gate",
    "data": {
      "gates": [
        {
          "id": 0,
          "type": "input",
          "position": { "x": 5, "y": 5 }
        },
        {
          "id": 1,
          "type": "input",
          "position": { "x": 5, "y": 10 }
        },
        {
          "id": 2,
          "type": "and",
          "position": { "x": 15, "y": 7 }
        },
        {
          "id": 3,
          "type": "output",
          "position": { "x": 25, "y": 7 }
        }
      ],
      "wires": [
        {
          "id": 0,
          "from": { "gateId": 0, "pin": 0 },
          "to": { "gateId": 2, "pin": 0 }
        },
        {
          "id": 1,
          "from": { "gateId": 1, "pin": 0 },
          "to": { "gateId": 2, "pin": 1 }
        },
        {
          "id": 2,
          "from": { "gateId": 2, "pin": 0 },
          "to": { "gateId": 3, "pin": 0 }
        }
      ]
    }
  }'
```

### WebSocket Connection Example (JavaScript)

```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  // Subscribe to circuit updates
  ws.send(JSON.stringify({
    type: 'subscribe',
    circuitId: 'uuid-1234'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'subscribed':
      console.log('Subscribed to circuit:', data.circuitId);
      break;
    case 'circuit-update':
      console.log('Circuit updated:', data.changes);
      // Update local circuit state
      break;
  }
};

// Send an update
function updateCircuit(changes) {
  ws.send(JSON.stringify({
    type: 'update',
    circuitId: 'uuid-1234',
    changes: changes
  }));
}
```