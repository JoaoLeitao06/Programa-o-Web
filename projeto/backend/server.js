const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares Globais - Têm de vir antes das rotas!
app.use(cors());
app.use(express.json());

// Importar as Rotas
app.use('/api/auth', require('./routes/auth'));

app.use('/api/planos', require('./routes/planos'));

// Conexão ao MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Conectado com sucesso!'))
  .catch(err => console.error('Erro ao ligar ao MongoDB:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});