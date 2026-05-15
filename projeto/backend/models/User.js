const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    username: { type: String, required: true, unique: true, lowercase: true },
    role: { type: String, default: 'Pendente' },
    password: { type: String, required: true }
});

// Middleware para encriptar a password antes de guardar
UserSchema.pre('save', async function() {
    // 'this' refere-se ao utilizador que está a ser guardado
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
        throw new Error('Erro na encriptação: ' + err.message);
    }
});

module.exports = mongoose.model('User', UserSchema);