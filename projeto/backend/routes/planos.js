const express = require('express');
const router = express.Router();
const Plano = require('../models/Plano');

// Rota para guardar um novo plano
router.post('/add', async (req, res) => {
    try {
        const novoPlano = new Plano(req.body);
        await novoPlano.save();
        res.status(201).json({ msg: 'Plano guardado no MongoDB!' });
    } catch (err) {
        res.status(500).json({ msg: 'Erro ao guardar plano', error: err.message });
    }
});

// Rota para listar todos os planos
router.get('/all', async (req, res) => {
    try {
        const planos = await Plano.find().sort({ _id: -1 }); // Mais recentes primeiro
        res.json(planos);
    } catch (err) {
        res.status(500).json({ msg: 'Erro ao obter planos' });
    }
});

// Rota para eliminar um plano pelo ID
router.delete('/:id', async (req, res) => {
    try {
        await Plano.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Plano eliminado com sucesso!' });
    } catch (err) {
        res.status(500).json({ msg: 'Erro ao eliminar o plano' });
    }
});

module.exports = router;