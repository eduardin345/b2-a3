// previsao_tempo_script.js

// --- 1. CONSTANTES E CONFIGURAÇÕES ---
// ATENÇÃO: ARMAZENAR A API KEY DIRETAMENTE NO CÓDIGO FRONTEND É INSEGURO!
// Em uma aplicação real, a chave NUNCA deve ficar exposta aqui.
// A forma correta envolve um backend (Node.js, Serverless) atuando como proxy.
// Para FINS DIDÁTICOS nesta atividade, vamos usá-la aqui temporariamente.
const apiKey = "ad58e4c3d5c1b176fdadd90ac40c9541"; // <<----- REMOVIDO ESPAÇO INICIAL
const forecastApiUrlBase = "https://api.openweathermap.org/data/2.5/forecast"; // <<----- CORRIGIDO: URL BASE SEM PARÂMETROS

// --- 2. SELETORES DO DOM ---
const cidadeInput = document.getElementById('cidade-input');
const verificarClimaBtn = document.getElementById('verificar-clima-btn');
const previsaoResultadoDiv = document.getElementById('previsao-tempo-resultado');
const conselhosGaragemDiv = document.getElementById('conselhos-garagem');
const loadingIndicator = document.getElementById('loading');
const errorMessageDiv = document.getElementById('error-message');

// --- 3. FUNÇÕES UTILITÁRIAS DE UI ---
function toggleLoading(mostrar) {
    if (loadingIndicator) {
        loadingIndicator.style.display = mostrar ? 'block' : 'none';
    }
}

function exibirErro(mensagem) {
    if (errorMessageDiv) {
        errorMessageDiv.textContent = mensagem;
        errorMessageDiv.style.display = 'block';
    }
    if (previsaoResultadoDiv) previsaoResultadoDiv.innerHTML = '';
    if (conselhosGaragemDiv) conselhosGaragemDiv.innerHTML = '';
}

function limparErro() {
    if (errorMessageDiv) {
        errorMessageDiv.textContent = '';
        errorMessageDiv.style.display = 'none';
    }
}

// --- 4. FUNÇÃO DE CHAMADA À API ---
async function buscarPrevisaoDetalhada(cidade) {
    // Agora a URL é construída corretamente
    const url = `${forecastApiUrlBase}?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Erro ${response.status}: ${errorData.message || 'Não foi possível buscar os dados.'}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro ao buscar previsão detalhada:", error);
        throw error;
    }
}

// --- 5. FUNÇÃO DE PROCESSAMENTO DE DADOS ---
function processarDadosForecast(dataApi) {
    if (!dataApi || !dataApi.list || dataApi.list.length === 0) {
        console.warn("Dados da API para processamento estão vazios ou inválidos.");
        return [];
    }

    const previsoesPorDia = {};

    dataApi.list.forEach(item => {
        const diaISO = item.dt_txt.split(' ')[0];
        if (!previsoesPorDia[diaISO]) {
            previsoesPorDia[diaISO] = {
                temps: [],
                weatherObjects: [],
                dt_texts: []
            };
        }
        previsoesPorDia[diaISO].temps.push(item.main.temp);
        previsoesPorDia[diaISO].weatherObjects.push({
            description: item.weather[0].description,
            icon: item.weather[0].icon
        });
        previsoesPorDia[diaISO].dt_texts.push(item.dt_txt);
    });

    const resultadoFinal = Object.keys(previsoesPorDia).map(diaKey => {
        const diaData = previsoesPorDia[diaKey];
        const temp_min = Math.min(...diaData.temps);
        const temp_max = Math.max(...diaData.temps);

        let representativeWeather;
        const middayIndex = diaData.dt_texts.findIndex(dt_txt => dt_txt.includes("12:00:00"));

        if (middayIndex !== -1) {
            representativeWeather = diaData.weatherObjects[middayIndex];
        } else if (diaData.weatherObjects.length > 0) {
            const middleIdx = Math.floor(diaData.weatherObjects.length / 2);
            representativeWeather = diaData.weatherObjects[middleIdx];
        } else {
            representativeWeather = { description: "N/A", icon: "01d" };
        }

        return {
            data: diaKey,
            temp_min: temp_min,
            temp_max: temp_max,
            descricao: representativeWeather.description,
            icone: representativeWeather.icon,
        };
    }).slice(0, 3); // Pega os primeiros 3 dias agrupados (como você já tinha)

    return resultadoFinal;
}

// --- 6. FUNÇÃO DE EXIBIÇÃO NA UI ---
function exibirPrevisaoDetalhada(previsaoDiariaProcessada, nomeCidade) {
    if (!previsaoResultadoDiv) return;
    previsaoResultadoDiv.innerHTML = '';

    if (previsaoDiariaProcessada.length === 0) {
        previsaoResultadoDiv.innerHTML = `<p>Não há dados de previsão para exibir para ${nomeCidade}.</p>`;
        return;
    }

    const titulo = document.createElement('h2');
    titulo.textContent = `Previsão para ${nomeCidade} nos próximos dias:`;
    previsaoResultadoDiv.appendChild(titulo);

    const containerDias = document.createElement('div');
    containerDias.className = 'container-previsao-dias';
    previsaoResultadoDiv.appendChild(containerDias);

    previsaoDiariaProcessada.forEach(dia => {
        const diaDiv = document.createElement('div');
        diaDiv.className = 'dia-previsao-item';

        const dataObj = new Date(dia.data + 'T00:00:00');
        const dataFormatada = dataObj.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });

        const diaHtml = `
            <h3>${dataFormatada}</h3>
            <img src="https://openweathermap.org/img/wn/${dia.icone}@2x.png" alt="${dia.descricao}" title="${dia.descricao}">
            <p class="temperaturas">
                <span class="temp-max">${dia.temp_max.toFixed(1)}°C</span> 
                <span class="temp-min">${dia.temp_min.toFixed(1)}°C</span>  
            </p>
            <p class="descricao-tempo">${dia.descricao}</p>
        `;
        diaDiv.innerHTML = diaHtml;
        containerDias.appendChild(diaDiv);
    });
}

// --- 7. FUNÇÃO DE "CONSELHOS DA GARAGEM" ---
function exibirConselhosGaragem(previsaoDiariaProcessada, nomeCidade) {
    if (!conselhosGaragemDiv) return;
    conselhosGaragemDiv.innerHTML = '';

    if (previsaoDiariaProcessada.length === 0) return;

    let conselhosHTML = '<h3>Dicas da Garagem Inteligente:</h3><ul>';
    let dicasAdicionadas = 0;

    previsaoDiariaProcessada.forEach(dia => {
        const dataObj = new Date(dia.data + 'T00:00:00');
        const diaSemanaCurto = dataObj.toLocaleDateString('pt-BR', { weekday: 'short' });

        if (dia.descricao.toLowerCase().includes('chuva')) {
            conselhosHTML += `<li>🌧️ ${diaSemanaCurto}: Chuva prevista em ${nomeCidade}. Bom manter o carro na garagem!</li>`;
            dicasAdicionadas++;
        }
        // Ajustei para .toFixed(1) aqui também, caso queira usar essas temps nos conselhos
        if (dia.temp_max > 28 && !dia.descricao.toLowerCase().includes('chuva')) {
            conselhosHTML += `<li>☀️ ${diaSemanaCurto}: Dia quente (${dia.temp_max.toFixed(1)}°C) em ${nomeCidade}. Bom para lavar o carro (se não houver restrição de água).</li>`;
            dicasAdicionadas++;
        }
        if (dia.temp_min < 12) {
            conselhosHTML += `<li>❄️ ${diaSemanaCurto}: Manhã/noite fria (${dia.temp_min.toFixed(1)}°C) em ${nomeCidade}. Verifique a bateria do carro se for mais antiga.</li>`;
            dicasAdicionadas++;
        }
    });

    if (dicasAdicionadas === 0) {
        conselhosHTML += '<li>Tempo estável nos próximos dias. Aproveite!</li>';
    }

    conselhosHTML += '</ul>';
    conselhosGaragemDiv.innerHTML = conselhosHTML;
}


// --- 8. FUNÇÃO PRINCIPAL / HANDLER DE EVENTO ---
async function handleVerificarClima() {
    if (!cidadeInput) {
        console.error("Elemento input da cidade não encontrado.");
        return;
    }
    const cidade = cidadeInput.value.trim();

    if (!cidade) {
        exibirErro("Por favor, digite o nome de uma cidade.");
        return;
    }

    limparErro();
    toggleLoading(true);
    if (previsaoResultadoDiv) previsaoResultadoDiv.innerHTML = '';
    if (conselhosGaragemDiv) conselhosGaragemDiv.innerHTML = '';

    try {
        const dadosApi = await buscarPrevisaoDetalhada(cidade);
        const nomeCidadeApi = dadosApi && dadosApi.city && dadosApi.city.name ? dadosApi.city.name : cidade;
        const previsaoProcessada = processarDadosForecast(dadosApi);

        if (previsaoProcessada.length > 0) {
            exibirPrevisaoDetalhada(previsaoProcessada, nomeCidadeApi);
            exibirConselhosGaragem(previsaoProcessada, nomeCidadeApi);
        } else {
             exibirErro(`Não foi possível obter uma previsão válida para "${nomeCidadeApi}". Verifique o nome da cidade ou tente mais tarde.`);
        }

    } catch (error) {
        exibirErro(error.message || "Ocorreu um erro desconhecido ao buscar a previsão.");
    } finally {
        toggleLoading(false);
    }
}

// --- 9. INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    if (verificarClimaBtn) {
        verificarClimaBtn.addEventListener('click', handleVerificarClima);
    } else {
        console.error("Botão 'verificar-clima-btn' não encontrado.");
    }
    if (cidadeInput) {
        cidadeInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleVerificarClima();
            }
        });
    }
});