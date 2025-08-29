// Local: backend/sever.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import Veiculo from './models/Veiculo.js';
import Manutencao from './models/Manutencao.js';

dotenv.config();
const app = express();
const PORTA = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Conectado!"))
    .catch(err => console.error("❌ Erro de conexão com MongoDB:", err));

// === CRUD DE VEÍCULOS ===
app.post('/api/veiculos', async (req, res) => { /* ... código CREATE ... */ });
app.get('/api/veiculos', async (req, res) => { /* ... código READ ... */ });
app.put('/api/veiculos/:id', async (req, res) => { /* ... código UPDATE ... */ });
app.delete('/api/veiculos/:id', async (req, res) => { /* ... código DELETE ... */ });

// === CRUD DE MANUTENÇÕES (SUB-RECURSO) ===
app.post('/api/veiculos/:veiculoId/manutencoes', async (req, res) => { /* ... código CREATE Manutencao ... */ });
app.get('/api/veiculos/:veiculoId/manutencoes', async (req, res) => { /* ... código READ Manutencao ... */ });

// (Cole o código completo que te enviei nas respostas anteriores aqui, já está pronto)

app.listen(PORTA, () => {
    console.log(`🚀 Servidor rodando na porta ${PORTA}`);
});