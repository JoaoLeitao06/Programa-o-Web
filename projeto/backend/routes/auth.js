const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Importa o modelo que criaste
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ROTA DE REGISTO: POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { nome, username, password } = req.body;

        // Verificar se o utilizador já existe
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ msg: 'Este utilizador já existe' });

        // Criar e guardar o utilizador
        user = new User({ nome, username, password });
        await user.save();

        res.status(201).json({ msg: 'Utilizador registado com sucesso!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor ao registar');
    }
});

// ROTA DE LOGIN: POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ msg: 'Credenciais inválidas' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Credenciais inválidas' });

        // Gerar o Token JWT para a sessão
        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

        res.json({ token, user: { nome: user.nome, role: user.role } });
    } catch (err) {
        res.status(500).send('Erro no servidor ao fazer login');
    }
});

module.exports = router;


// Rota para listar todos os utilizadores (Apenas para o Admin ver)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Retorna todos menos a password
        res.json(users);
    } catch (err) {
        res.status(500).send('Erro ao obter utilizadores');
    }
});

// Rota para atualizar o perfil de um utilizador
router.put('/update-role/:id', async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        res.json({ msg: `Perfil de ${user.nome} atualizado para ${role}` });
    } catch (err) {
        res.status(500).send('Erro ao atualizar perfil');
    }
});