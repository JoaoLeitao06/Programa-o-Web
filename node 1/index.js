const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const minhas_notas = [20, 10, 15, 17];

app.get('/', (req, res) => {
  res.status(200).json(minhas_notas);
});

app.get('/:pos', (req, res) => {
  const pos = parseInt(req.params.pos, 10);
  if (Number.isNaN(pos) || pos < 0 || pos >= minhas_notas.length) {
    return res.status(400).json({ error: 'Posição inválida ou nota não encontrada' });
  }
  res.status(200).json({ nota: minhas_notas[pos] });
});

app.post('/', (req, res) => {
  const valor = parseInt(req.body.valor, 10);
  if (Number.isNaN(valor)) {
    return res.status(400).json({ error: 'Valor inválido' });
  }
  minhas_notas.push(valor);
  res.status(200).json({ message: 'Nota adicionada', notas: minhas_notas });
});

app.post('/:valor', (req, res) => {
  const valor = parseInt(req.params.valor, 10);
  if (Number.isNaN(valor)) {
    return res.status(400).json({ error: 'Valor inválido' });
  }
  minhas_notas.push(valor);
  res.status(200).json({ message: 'Nota adicionada', notas: minhas_notas });
});

app.patch('/:pos', (req, res) => {
  const pos = parseInt(req.params.pos, 10);
  const valor = parseInt(req.body.valor, 10);
  if (Number.isNaN(pos) || pos < 0 || pos >= minhas_notas.length || Number.isNaN(valor)) {
    return res.status(400).json({ error: 'Posição ou valor inválido' });
  }
  minhas_notas[pos] = valor;
  res.status(200).json({ message: 'Nota atualizada', notas: minhas_notas });
});

app.delete('/:pos', (req, res) => {
  const pos = parseInt(req.params.pos, 10);
  if (Number.isNaN(pos) || pos < 0 || pos >= minhas_notas.length) {
    return res.status(400).json({ error: 'Posição inválida' });
  }
  minhas_notas.splice(pos, 1);
  res.status(200).json({ message: 'Nota removida', notas: minhas_notas });
});

app.delete('/', (req, res) => {
  minhas_notas.length = 0;
  res.status(200).json({ message: 'Todas as notas foram removidas', notas: minhas_notas });
});

app.listen(PORT, () => {
  console.log('Aplicação ExpressJS rodando em http://localhost:' + PORT);
});
