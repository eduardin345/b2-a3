// backend/server.js
import express from 'express';
import dotenv from 'dotenv'; // Importa dotenv
import axios from 'axios';

dotenv.config(); // <--- ESTA LINHA DEVE ESTAR NO TOPO!

const app = express();
const port = process.env.PORT || 3001;


// ... resto do código ...
// Middleware para loggar requisições (opcional)
app.use((req, res, next) => {
    console.log(`[Servidor Backend] Recebida requisição: ${req.method} ${req.url}`);
    next();
});
dotenv.config();

console.log('[Servidor Backend DEBUG] process.env.OPENWEATHER_API_KEY:', process.env.OPENWEATHER_API_KEY); // Linha de debug
console.log('[Servidor Backend DEBUG] Todas as vars de ambiente (cuidado com segredos):', process.env); // Cuidado ao logar tudo



console.log(const apiKey = process.env.OPENWEATHER_API_KEY;);

// Middleware CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Em produção, restrinja para seu domínio frontend
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Rota Principal de Teste
app.get('/', (req, res) => {
    res.json({ message: 'Bem-vindo ao Backend Proxy da Garagem Inteligente!' });
});

// ENDPOINT DE PREVISÃO DO TEMPO
app.get('/api/previsao/:cidade', async (req, res) => {
    const { cidade } = req.params;

    if (!apiKey) {
        console.error("[Servidor Backend] ERRO: Chave da API OpenWeatherMap não configurada.");
        return res.status(500).json({ error: 'Chave da API OpenWeatherMap não configurada no servidor.' });
    }
    if (!cidade) {
        return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });
    }

    const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        console.log(`[Servidor Backend] Buscando previsão para: ${cidade}`);
        const apiResponse = await axios.get(weatherAPIUrl);
        console.log(`[Servidor Backend] Dados recebidos da OpenWeatherMap para ${cidade}.`);
        res.json(apiResponse.data);
    } catch (error) {
        console.error("[Servidor Backend] Erro ao buscar previsão:", error.response?.data || error.message);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Erro ao buscar previsão do tempo no servidor.';
        res.status(status).json({ error: message });
    }
});

// Middleware para rotas não encontradas (404)
app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint não encontrado no backend.' });
});

// Middleware de tratamento de erros genérico
app.use((err, req, res, next) => {
    console.error('[Servidor Backend] Erro não tratado:', err.stack);
    res.status(500).json({ error: 'Ocorreu um erro inesperado no servidor backend.' });
});

app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
    if (!apiKey) {
        console.warn("[Servidor Backend] ATENÇÃO: OPENWEATHER_API_KEY não está definida no .env!");
    }
});