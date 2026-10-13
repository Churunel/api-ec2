const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// "Base de datos" en memoria
let tareas = [
  { id: 1, titulo: 'Crear instancia EC2', completada: true },
  { id: 2, titulo: 'Conectar por SSH', completada: false }
];
let siguienteId = 3;

// Raíz: información del servidor
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API funcionando en AWS EC2',
    host: os.hostname(),
    fecha: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// CRUD de tareas
app.get('/tareas', (req, res) => res.json(tareas));

app.get('/tareas/:id', (req, res) => {
  const tarea = tareas.find(t => t.id === Number(req.params.id));
  if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json(tarea);
});

app.post('/tareas', (req, res) => {
  const { titulo } = req.body;
  if (!titulo) return res.status(400).json({ error: 'El campo "titulo" es obligatorio' });
  const nueva = { id: siguienteId++, titulo, completada: false };
  tareas.push(nueva);
  res.status(201).json(nueva);
});

app.put('/tareas/:id', (req, res) => {
  const tarea = tareas.find(t => t.id === Number(req.params.id));
  if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
  if (req.body.titulo !== undefined) tarea.titulo = req.body.titulo;
  if (req.body.completada !== undefined) tarea.completada = Boolean(req.body.completada);
  res.json(tarea);
});

app.delete('/tareas/:id', (req, res) => {
  const antes = tareas.length;
  tareas = tareas.filter(t => t.id !== Number(req.params.id));
  if (tareas.length === antes) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.status(204).send();
});

// '0.0.0.0' para aceptar conexiones externas (no solo localhost)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API escuchando en http://0.0.0.0:${PORT}`);
});
