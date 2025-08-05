// Logic Builder Server - RESTful API and WebSocket server for circuit management
// Provides endpoints for CRUD operations on circuits and real-time collaboration

import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for cross-origin requests from the frontend
app.use(cors());
// Parse JSON request bodies
app.use(express.json());

// Circuit data structure representing a saved logic circuit
interface Circuit {
  id: string;                    // Unique circuit identifier
  name: string;                  // User-friendly circuit name
  description: string;           // Circuit description/notes
  data: {
    gates: any[];                // Array of logic gates
    wires: any[];                // Array of wire connections
  };
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last modification timestamp
}

// Simulation session for running circuit simulations
interface SimulationSession {
  id: string;                    // Session identifier
  circuitId: string;             // Associated circuit ID
  status: 'running' | 'paused' | 'stopped';  // Current simulation state
  currentStep: number;           // Current simulation step/iteration
  results: any[];                // Simulation output results
}

// In-memory storage for circuits and simulation sessions
// In production, replace with a proper database (PostgreSQL, MongoDB, etc.)
const circuits = new Map<string, Circuit>();
const sessions = new Map<string, SimulationSession>();

// Health check endpoint for monitoring and Docker health checks
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/circuits', (req, res) => {
  const circuitList = Array.from(circuits.values()).map(({ data, ...circuit }) => circuit);
  res.json(circuitList);
});

app.get('/api/circuits/:id', (req, res) => {
  const circuit = circuits.get(req.params.id);
  if (!circuit) {
    return res.status(404).json({ error: 'Circuit not found' });
  }
  res.json(circuit);
});

// Create a new circuit
app.post('/api/circuits', (req, res) => {
  const { name, description, data } = req.body;
  
  // Validate required fields
  if (!name || !data) {
    return res.status(400).json({ error: 'Name and data are required' });
  }

  const circuit: Circuit = {
    id: uuidv4(),
    name,
    description: description || '',
    data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  circuits.set(circuit.id, circuit);
  res.status(201).json(circuit);
});

app.put('/api/circuits/:id', (req, res) => {
  const circuit = circuits.get(req.params.id);
  if (!circuit) {
    return res.status(404).json({ error: 'Circuit not found' });
  }

  const { name, description, data } = req.body;
  
  if (name !== undefined) circuit.name = name;
  if (description !== undefined) circuit.description = description;
  if (data !== undefined) circuit.data = data;
  circuit.updatedAt = new Date();

  circuits.set(circuit.id, circuit);
  res.json(circuit);
});

app.delete('/api/circuits/:id', (req, res) => {
  const circuit = circuits.get(req.params.id);
  if (!circuit) {
    return res.status(404).json({ error: 'Circuit not found' });
  }

  circuits.delete(req.params.id);
  
  const sessionsToDelete = Array.from(sessions.entries())
    .filter(([_, session]) => session.circuitId === req.params.id)
    .map(([id]) => id);
  
  sessionsToDelete.forEach(id => sessions.delete(id));
  
  res.status(204).send();
});

// Start a new simulation session for a circuit
app.post('/api/simulate', (req, res) => {
  const { circuitId, inputs } = req.body;
  
  // Validate circuit ID
  if (!circuitId) {
    return res.status(400).json({ error: 'Circuit ID is required' });
  }

  const circuit = circuits.get(circuitId);
  if (!circuit) {
    return res.status(404).json({ error: 'Circuit not found' });
  }

  const session: SimulationSession = {
    id: uuidv4(),
    circuitId,
    status: 'running',
    currentStep: 0,
    results: [],
  };

  sessions.set(session.id, session);
  
  setTimeout(() => {
    session.status = 'stopped';
    session.results = [
      { step: 0, outputs: { output1: true, output2: false } },
      { step: 1, outputs: { output1: false, output2: true } },
    ];
  }, 100);

  res.json({ sessionId: session.id });
});

app.get('/api/simulate/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session);
});

app.post('/api/simulate/:sessionId/stop', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  session.status = 'stopped';
  res.json({ status: 'stopped' });
});

const server = createServer(app);
const wss = new WebSocketServer({ server });

// WebSocket connection handler for real-time collaboration
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  // Handle incoming WebSocket messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      switch (data.type) {
        case 'subscribe':
          // Client subscribes to circuit updates
          ws.send(JSON.stringify({ type: 'subscribed', circuitId: data.circuitId }));
          break;
        
        case 'update':
          // Broadcast circuit updates to other connected clients
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'circuit-update',
                circuitId: data.circuitId,
                changes: data.changes,
              }));
            }
          });
          break;
        
        default:
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
      }
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

server.listen(port, () => {
  console.log(`Logic Builder Server running on port ${port}`);
});