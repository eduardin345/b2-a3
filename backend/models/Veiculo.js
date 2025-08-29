// Local: backend/models/Veiculo.js
import mongoose from 'mongoose';

// Este é o Schema, a "planta de construção" de um Veículo no banco.
const veiculoSchema = new mongoose.Schema({
    placa: {
        type: String,
        required: [true, 'A placa é obrigatória.'],
        unique: true, // Garante que não teremos placas repetidas
        trim: true,
        uppercase: true
    },
    modelo: {
        type: String,
        required: [true, 'O modelo é obrigatório.'],
        trim: true
    },
    cor: {
        type: String,
        required: [true, 'A cor é obrigatória.'],
        trim: true
    },
    tipoVeiculo: {
        type: String,
        required: true,
        enum: ['Carro', 'CarroEsportivo', 'Caminhao'] // Só aceita esses 3 valores
    },
    capacidadeCarga: { // Campo específico para caminhões
        type: Number,
        // É obrigatório apenas se o tipo for 'Caminhao'
        required: function() { return this.tipoVeiculo === 'Caminhao'; }
    }
}, {
    timestamps: true // Adiciona automaticamente os campos `createdAt` e `updatedAt`
});

// O Modelo é a ferramenta que usaremos para interagir com a coleção 'veiculos' no MongoDB.
const Veiculo = mongoose.model('Veiculo', veiculoSchema);

export default Veiculo;