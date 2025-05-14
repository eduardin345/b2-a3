// previsao_tempo_script.js

// --- 1. CONSTANTES E CONFIGURAÇÕES ---
const apiKey = "ad58e4c3d5c1b176fdadd90ac40c9541"; // SUA CHAVE AQUI
const forecastApiUrlBase = "https://api.openweathermap.org/data/2.5/forecast";

// --- 2. SELETORES DO DOM ---
// (Os seletores permanecem os mesmos da sua última versão, apenas garantindo que estão corretos)
const cidadeInput = document.getElementById('cidade-input');
const verificarClimaBtn = document.getElementById('verificar-clima-btn');
const previsaoResultadoDiv = document.getElementById('previsao-tempo-resultado');
const conselhosGaragemDiv = document.getElementById('conselhos-garagem');
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessageDiv = document.getElementById('error-message');

const modalPrevisaoHoraria = document.getElementById('modal-previsao-horaria');
const modalTituloData = document.getElementById('modal-titulo-data');
const modalPrevisaoHorariaContainer = document.getElementById('previsao-horaria-container');
const fecharModalBtn = document.getElementById('fechar-modal-btn');

let dadosCompletosDaApi = null;

// --- 3. FUNÇÕES UTILITÁRIAS DE UI ---
function toggleLoading(mostrar) {
    loadingSpinner.style.display = mostrar ? 'flex' : 'none';
}

function exibirErro(mensagem) {
    errorMessageDiv.textContent = mensagem;
    errorMessageDiv.style.display = 'block';
    previsaoResultadoDiv.innerHTML = '';
    conselhosGaragemDiv.innerHTML = '';
}

function limparErro() {
    errorMessageDiv.style.display = 'none';
    errorMessageDiv.textContent = '';
}

// --- 4. FUNÇÃO DE CHAMADA À API --- (sem alterações)
async function buscarPrevisaoDetalhada(cidade) {
    const url = `${forecastApiUrlBase}?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Erro ${response.status}: ${errorData.message || 'Não foi possível buscar os dados.'}`);
        }
        dadosCompletosDaApi = await response.json();
        return dadosCompletosDaApi;
    } catch (error) {
        console.error("Erro ao buscar previsão detalhada:", error);
        dadosCompletosDaApi = null;
        throw error;
    }
}

// --- 5. FUNÇÃO DE PROCESSAMENTO DE DADOS DIÁRIOS --- (sem alterações na lógica principal)
function processarDadosForecastDiario(dataApi) {
    if (!dataApi || !dataApi.list || dataApi.list.length === 0) return [];
    const previsoesPorDia = {};
    dataApi.list.forEach(item => {
        const diaISO = item.dt_txt.split(' ')[0];
        if (!previsoesPorDia[diaISO]) {
            previsoesPorDia[diaISO] = { temps: [], weatherObjects: [], dt_texts: [], hourlyData: [] };
        }
        previsoesPorDia[diaISO].temps.push(item.main.temp);
        previsoesPorDia[diaISO].weatherObjects.push({ description: item.weather[0].description, icon: item.weather[0].icon, main: item.weather[0].main.toLowerCase() });
        previsoesPorDia[diaISO].dt_texts.push(item.dt_txt);
        previsoesPorDia[diaISO].hourlyData.push(item);
    });

    return Object.keys(previsoesPorDia).map(diaKey => {
        const diaData = previsoesPorDia[diaKey];
        const temp_min = Math.min(...diaData.temps);
        const temp_max = Math.max(...diaData.temps);
        let representativeWeather;
        const middayIndex = diaData.dt_texts.findIndex(dt_txt => dt_txt.includes("12:00:00"));
        if (middayIndex !== -1) {
            representativeWeather = diaData.weatherObjects[middayIndex];
        } else {
            representativeWeather = diaData.weatherObjects[Math.floor(diaData.weatherObjects.length / 2)] || { description: "N/A", icon: "01d", main: "clear" };
        }
        return {
            data: diaKey,
            temp_min, temp_max,
            descricao: representativeWeather.description,
            icone: representativeWeather.icon,
            mainCondition: representativeWeather.main, // 'clear', 'clouds', 'rain', etc.
            hourlyDataForThisDay: diaData.hourlyData
        };
    }).slice(0, 5); // Exibir 5 dias por padrão
}

// Função auxiliar para classe de ícone baseada na condição
function getWeatherIconClass(mainCondition) {
    if (mainCondition.includes('clear')) return 'sol';
    if (mainCondition.includes('clouds')) return 'nuvem';
    if (mainCondition.includes('rain') || mainCondition.includes('drizzle')) return 'chuva';
    if (mainCondition.includes('thunderstorm')) return 'tempestade';
    if (mainCondition.includes('snow')) return 'neve';
    return ''; // Default
}

// --- 6. FUNÇÃO DE EXIBIÇÃO NA UI (DIÁRIA) ---
function exibirPrevisaoDetalhada(previsaoDiariaProcessada, nomeCidade) {
    previsaoResultadoDiv.innerHTML = '';
    if (previsaoDiariaProcessada.length === 0) {
        previsaoResultadoDiv.innerHTML = `<p>Não foi possível encontrar dados para <span class="nome-cidade">${nomeCidade}</span>.</p>`;
        return;
    }

    const tituloH2 = document.createElement('h2');
    tituloH2.innerHTML = `Previsão para <span class="nome-cidade">${nomeCidade}</span> (Próximos ${previsaoDiariaProcessada.length} dias):`;
    previsaoResultadoDiv.appendChild(tituloH2);

    const containerDias = document.createElement('div');
    containerDias.className = 'container-previsao-dias';
    previsaoResultadoDiv.appendChild(containerDias);

    previsaoDiariaProcessada.forEach(dia => {
        const diaDiv = document.createElement('div');
        diaDiv.className = 'dia-previsao-item';
        diaDiv.setAttribute('data-dia-iso', dia.data);

        const dataObj = new Date(dia.data + 'T00:00:00');
        const nomeDiaSemana = dataObj.toLocaleDateString('pt-BR', { weekday: 'long' });
        const dataCurtaFormatada = dataObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
        const iconClass = getWeatherIconClass(dia.mainCondition);

        diaDiv.innerHTML = `
            <h3>${nomeDiaSemana}</h3>
            <span class="data-curta">${dataCurtaFormatada}</span>
            <img class="weather-icon-daily ${iconClass}" src="https://openweathermap.org/img/wn/${dia.icone}@4x.png" alt="${dia.descricao}" title="${dia.descricao}">
            <p class="temperaturas">
                <span class="temp-max">${dia.temp_max.toFixed(1)}°C</span> |
                <span class="temp-min">${dia.temp_min.toFixed(1)}°C</span>
            </p>
            <p class="descricao-tempo">${dia.descricao}</p>
        `;
        containerDias.appendChild(diaDiv);
        diaDiv.addEventListener('click', () => abrirModalPrevisaoHoraria(dia.data, dia.hourlyDataForThisDay));
    });
}

// --- FUNÇÕES DO MODAL ---
function abrirModalPrevisaoHoraria(diaISO, hourlyData) {
    const dataObj = new Date(diaISO + 'T00:00:00');
    modalTituloData.textContent = `Detalhes para ${dataObj.toLocaleDateString('pt-BR', {dateStyle: 'full'})}`;
    modalPrevisaoHorariaContainer.innerHTML = '';

    if (!hourlyData || hourlyData.length === 0) {
        modalPrevisaoHorariaContainer.innerHTML = "<p>Não há dados horários detalhados para este dia.</p>";
    } else {
        hourlyData.forEach(itemHora => {
            const hora = new Date(itemHora.dt_txt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const iconClass = getWeatherIconClass(itemHora.weather[0].main.toLowerCase());
            const itemHtml = `
                <div class="item-previsao-horaria">
                    <p class="hora">${hora}</p>
                    <img class="weather-icon-horaria ${iconClass}" src="https://openweathermap.org/img/wn/${itemHora.weather[0].icon}@2x.png" alt="${itemHora.weather[0].description}">
                    <p class="temp">${itemHora.main.temp.toFixed(1)}°C</p>
                    <p class="desc-horaria">${itemHora.weather[0].description}</p>
                </div>
            `;
            modalPrevisaoHorariaContainer.innerHTML += itemHtml;
        });
    }
    modalPrevisaoHoraria.style.display = 'block';
    // Adiciona classe para animar abertura (opcional)
    // document.body.classList.add('modal-open-body'); // Se quiser travar scroll do body
}

function fecharModal() {
    modalPrevisaoHoraria.style.display = 'none';
    // document.body.classList.remove('modal-open-body');
}

if (fecharModalBtn) fecharModalBtn.onclick = fecharModal;
window.onclick = (event) => { if (event.target == modalPrevisaoHoraria) fecharModal(); }
document.addEventListener('keydown', (event) => { if (event.key === "Escape") fecharModal(); });


// --- 7. FUNÇÃO DE "CONSELHOS DA GARAGEM" ---
function exibirConselhosGaragem(previsaoDiariaProcessada, nomeCidade) {
    if (!conselhosGaragemDiv) return;
    conselhosGaragemDiv.innerHTML = '';

    if (previsaoDiariaProcessada.length === 0) return;
    let conselhosHTML = '<h3><span role="img" aria-label="Ideia">💡</span> Dicas da Garagem Hiperconectada:</h3><ul>';
    let dicasAdicionadas = 0;
    // Lógica dos conselhos (igual à anterior, só o H3 mudou)
     previsaoDiariaProcessada.forEach(dia => {
        const dataObj = new Date(dia.data + 'T00:00:00');
        const diaSemanaCurto = dataObj.toLocaleDateString('pt-BR', { weekday: 'short' });

        if (dia.mainCondition.includes('rain') || dia.mainCondition.includes('thunderstorm')) {
            conselhosHTML += `<li><span role="img" aria-label="Chuva">🌧️</span> ${diaSemanaCurto}: Atenção à ${dia.descricao.toLowerCase()} em ${nomeCidade}. Carro na garagem é uma boa!</li>`;
            dicasAdicionadas++;
        }
        if (dia.temp_max > 29 && !dia.mainCondition.includes('rain')) {
            conselhosHTML += `<li><span role="img" aria-label="Sol">☀️</span> ${diaSemanaCurto}: Dia quente (${dia.temp_max.toFixed(1)}°C) em ${nomeCidade}. Evite deixar objetos sensíveis no carro ao sol.</li>`;
            dicasAdicionadas++;
        }
        if (dia.temp_min < 10) {
            conselhosHTML += `<li><span role="img" aria-label="Frio">❄️</span> ${diaSemanaCurto}: Noite/manhã fria (${dia.temp_min.toFixed(1)}°C) em ${nomeCidade}. Bateria do carro pode sentir o frio.</li>`;
            dicasAdicionadas++;
        }
        if(dia.mainCondition.includes('clear') && dia.temp_max > 20 && dia.temp_max < 29 && dicasAdicionadas < 2){ // Dica extra para tempo bom
             conselhosHTML += `<li><span role="img" aria-label="Paisagem">🏞️</span> ${diaSemanaCurto}: Tempo agradável! Perfeito para um passeio de carro ou cuidar da garagem.</li>`;
            dicasAdicionadas++;
        }
    });

    if (dicasAdicionadas === 0) {
        conselhosHTML += '<li>Tempo estável previsto. Aproveite com responsabilidade!</li>';
    }
    conselhosHTML += '</ul>';
    conselhosGaragemDiv.innerHTML = conselhosHTML;
}

// --- 8. FUNÇÃO PRINCIPAL / HANDLER DE EVENTO --- (sem alterações na lógica)
async function handleVerificarClima() {
    if (!cidadeInput) return;
    const cidade = cidadeInput.value.trim();
    if (!cidade) {
        exibirErro("Por favor, digite o nome de uma cidade.");
        cidadeInput.focus();
        return;
    }
    limparErro();
    toggleLoading(true);
    previsaoResultadoDiv.innerHTML = '';
    conselhosGaragemDiv.innerHTML = '';
    try {
        const dadosApiCompletos = await buscarPrevisaoDetalhada(cidade);
        const nomeCidadeApi = dadosApiCompletos?.city?.name || cidade;
        const previsaoProcessadaDiaria = processarDadosForecastDiario(dadosApiCompletos);
        if (previsaoProcessadaDiaria.length > 0) {
            exibirPrevisaoDetalhada(previsaoProcessadaDiaria, nomeCidadeApi);
            exibirConselhosGaragem(previsaoProcessadaDiaria, nomeCidadeApi);
        } else {
             exibirErro(`Não foi possível obter uma previsão para "${nomeCidadeApi}". Verifique o nome da cidade.`);
        }
    } catch (error) {
        exibirErro(error.message || "Um erro inesperado ocorreu.");
    } finally {
        toggleLoading(false);
    }
}

// --- 9. INICIALIZAÇÃO --- (sem alterações)
document.addEventListener('DOMContentLoaded', () => {
    // Adiciona a classe ao body para aplicar os estilos da página de previsão
    // document.body.classList.add('previsao-page'); // Já fiz isso no HTML
    if (verificarClimaBtn) verificarClimaBtn.addEventListener('click', handleVerificarClima);
    if (cidadeInput) {
        cidadeInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleVerificarClima();
            }
        });
    }
});