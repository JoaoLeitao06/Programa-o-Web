const mongoose = require('mongoose');

const PlanoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    erva: { type: String, required: true },
    tipo: { type: String, enum: ['Regular', 'Emergencia', 'Pontual'], required: true },
    detalhes: { type: Object, required: true }, // Guarda tempMin, rega, etc.
    criadoPor: { type: String, required: true },
    dataRegisto: { type: String, default: () => new Date().toLocaleString('pt-PT') }
});

module.exports = mongoose.model('Plano', PlanoSchema);