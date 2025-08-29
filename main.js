// --- Gerenciamento da Garagem e LocalStorage ---
let garagem = []; // Array para armazenar as instâncias dos veículos
const STORAGE_KEY = 'minhaGaragemInteligente_v2'; // Mudar a chave se a estrutura de dados mudar significativamente

function salvarGaragem() {
    try {
        // Usa o método toJSON de cada veículo para garantir a serialização correta
        const garagemJSON = JSON.stringify(garagem.map(v => v.toJSON()));
        localStorage.setItem(STORAGE_KEY, garagemJSON);
        // console.log("Garagem salva:", garagemJSON); // Log para debug (pode ser extenso)
    } catch (error) {
        console.error("Erro crítico ao salvar garagem no LocalStorage:", error);
        // Tenta notificar o usuário sobre o problema
        exibirNotificacao("ERRO GRAVE: Não foi possível salvar os dados da garagem. Alterações recentes podem ser perdidas ao fechar.", 'error', 0); // 0 = não esconder automaticamente
    }
}

function carregarGaragem() {
    try {
        const garagemJSON = localStorage.getItem(STORAGE_KEY);
        if (garagemJSON) {
            const garagemGenerica = JSON.parse(garagemJSON);
            // Reidrata os objetos: transforma JSON genérico em instâncias de classes
            // Depende do método estático Veiculo.fromJSON
            garagem = garagemGenerica.map(veiculoJSON => Veiculo.fromJSON(veiculoJSON))
                                    .filter(v => v !== null); // Filtra veículos que falharam na reidratação

            // console.log(`Garagem carregada: ${garagem.length} veículos.`); // Log para debug
             if (garagem.length !== garagemGenerica.length) {
                console.warn("Alguns veículos não puderam ser carregados corretamente do LocalStorage.");
                exibirNotificacao("Aviso: Alguns dados de veículos podem não ter sido carregados corretamente.", 'warning');
             }
        } else {
            garagem = []; // Inicia vazia se não houver nada salvo
            // console.log("Nenhuma garagem salva encontrada. Iniciando vazia.");
        }
    } catch (error) {
        console.error("Erro ao carregar ou parsear garagem do LocalStorage:", error);
        exibirNotificacao("Erro ao carregar dados da garagem. Verifique o console para detalhes. Iniciando com garagem vazia.", 'error');
        garagem = []; // Reseta em caso de erro grave de parse para evitar mais problemas
        // Opcional: tentar limpar o localStorage corrompido
        // localStorage.removeItem(STORAGE_KEY);
    }
    // Atualiza a UI após carregar/falhar
    renderizarGaragem();
    renderizarAgendamentosFuturos();
    verificarAgendamentosProximos(); // Verifica lembretes ao iniciar
}

// --- Funções de Renderização da UI ---

function renderizarGaragem() {
    const listaVeiculosDiv = document.getElementById('listaVeiculos');
    listaVeiculosDiv.innerHTML = ''; // Limpa a lista atual

    if (garagem.length === 0) {
        listaVeiculosDiv.innerHTML = '<p style="text-align: center; color: #777;">Sua garagem está vazia. Adicione um veículo acima!</p>';
        return;
    }

    // Ordena a garagem (ex: por modelo) antes de renderizar - opcional
    garagem.sort((a, b) => a.modelo.localeCompare(b.modelo));

    garagem.forEach(veiculo => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('vehicle-item');
        itemDiv.setAttribute('data-id', veiculo.id); // Adiciona ID para referência futura
        itemDiv.innerHTML = `
            <span><strong style="color: #2980b9;">${veiculo.modelo}</strong> (${veiculo.tipoVeiculo}) - Cor: ${veiculo.cor}</span>
            <div class="actions">
                <button onclick="abrirModalDetalhes('${veiculo.id}')" title="Ver detalhes, histórico e agendar manutenção">Detalhes / Manutenção</button>
                <button class="warning" onclick="removerVeiculo('${veiculo.id}')" title="Remover veículo permanentemente">Remover</button>
            </div>
        `;
        listaVeiculosDiv.appendChild(itemDiv);
    });
}

function renderizarHistoricoManutencaoModal(veiculoId) {
    const veiculo = garagem.find(v => v.id === veiculoId);
    const historicoDiv = document.getElementById('modalHistoricoManutencao');

    if (!veiculo) {
        console.error("Veículo não encontrado para renderizar histórico:", veiculoId);
        historicoDiv.innerHTML = '<p>Erro: Veículo não encontrado.</p>';
        return;
    }
    // Usa o método getHistoricoHTML da classe Veiculo
    historicoDiv.innerHTML = veiculo.getHistoricoHTML();
}


function renderizarAgendamentosFuturos() {
    const listaAgendamentosDiv = document.getElementById('listaAgendamentosFuturos');
    listaAgendamentosDiv.innerHTML = '';
    const agora = new Date();
    let agendamentos = [];

    // Coleta todos os agendamentos futuros de todos os veículos
    garagem.forEach(veiculo => {
        veiculo.historicoManutencao.forEach(manutencao => {
            // Verifica se a data é válida e futura
            if (manutencao.data instanceof Date && !isNaN(manutencao.data.getTime()) && manutencao.data > agora) {
                agendamentos.push({ veiculo: veiculo, manutencao: manutencao });
            }
        });
    });

    // Ordena por data (mais próximo primeiro)
    agendamentos.sort((a, b) => a.manutencao.data - b.manutencao.data);

    if (agendamentos.length === 0) {
        listaAgendamentosDiv.innerHTML = '<p style="text-align: center; color: #777;">Nenhum agendamento futuro.</p>';
        return;
    }

    agendamentos.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('schedule-item');
         itemDiv.setAttribute('data-id', item.manutencao.id);
        // Formata a manutenção incluindo o nome do veículo
        // Depende do método formatar da classe Manutencao
        itemDiv.innerHTML = `
             <span>${item.manutencao.formatar(true, `${item.veiculo.modelo} (${item.veiculo.cor})`)}</span>
             <button class="small-warning" onclick="removerManutencao('${item.veiculo.id}', '${item.manutencao.id}')" title="Cancelar este agendamento">Cancelar</button>
        `;
        listaAgendamentosDiv.appendChild(itemDiv);
    });
}

// --- Funções do Modal e Ações do Veículo ---

const modal = document.getElementById('modalDetalhesVeiculo');
const modalContent = modal.querySelector('.modal-content'); // Para animação de fechar

function abrirModalDetalhes(veiculoId) {
    const veiculo = garagem.find(v => v.id === veiculoId);
    if (!veiculo) {
        exibirNotificacao("Erro: Veículo não encontrado.", "error");
        return;
    }

    document.getElementById('modalTituloVeiculo').textContent = `Detalhes: ${veiculo.modelo} (${veiculo.cor})`;
    document.getElementById('manutencaoVeiculoId').value = veiculoId; // Associa formulário ao veículo

    atualizarInfoVeiculoNoModal(veiculoId); // Popula infos e botões de ação
    renderizarHistoricoManutencaoModal(veiculoId); // Popula histórico e agendamentos do veículo

    // Limpa e configura formulário de manutenção
    const formManutencao = document.getElementById('formManutencao');
    formManutencao.reset();
    // Configura o datepicker para o campo de data (Assume que flatpickr está carregado)
    if (typeof flatpickr !== 'undefined') {
        flatpickr("#manutencaoData", {
            enableTime: true,
            dateFormat: "Y-m-d H:i", // Formato ISO compatível com new Date()
            minDate: "today", // Impede agendar no passado (opcional)
            locale: "pt" // Usa localização em português (requer script de localização)
        });
    }

    modal.style.display = 'block';
    // Adiciona classe para animação de entrada (se houver)
    modalContent.classList.add('animate-in'); // Crie a animação CSS correspondente
}

function fecharModal() {
    // Adiciona classe para animação de saída (opcional)
    modalContent.classList.add('animate-out');

    // Espera a animação terminar antes de esconder o modal (ajuste o tempo se necessário)
    // setTimeout(() => {
        modal.style.display = 'none';
        modalContent.classList.remove('animate-in', 'animate-out'); // Limpa classes de animação
    // }, 300); // Tempo deve corresponder à duração da animação CSS 'animate-out'
}

// Fecha o modal se clicar fora do conteúdo (no fundo escuro)
window.onclick = function(event) {
    if (event.target == modal) {
        fecharModal();
    }
}
// Fecha o modal ao pressionar a tecla ESC
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        fecharModal();
    }
});

function atualizarInfoVeiculoNoModal(veiculoId) {
    // Só atualiza se o modal estiver visível e for o veículo correto
    if (modal.style.display !== 'block' || document.getElementById('manutencaoVeiculoId').value !== veiculoId) {
        return;
    }

    const veiculo = garagem.find(v => v.id === veiculoId);
    if (!veiculo) return; // Segurança extra

    const infoDiv = document.getElementById('modalInfoVeiculo');
    const acoesDiv = document.getElementById('modalAcoesVeiculo');

    // Usa o método exibirInformacoesCompletaHTML da classe Veiculo (e suas filhas)
    infoDiv.innerHTML = veiculo.exibirInformacoesCompletaHTML();
    acoesDiv.innerHTML = ''; // Limpa ações anteriores para reconstruir

    // Botões de Ação Comuns
    if (!veiculo.ligado) {
        acoesDiv.innerHTML += `<button onclick="executarAcaoVeiculo('${veiculo.id}', 'ligar')" title="Ligar o motor"><span role="img" aria-label="Chave">🔑</span> Ligar</button>`;
    } else {
        acoesDiv.innerHTML += `<button onclick="executarAcaoVeiculo('${veiculo.id}', 'desligar')" title="Desligar o motor"><span role="img" aria-label="Botão Power Off">🔌</span> Desligar</button>`;
        acoesDiv.innerHTML += `<button onclick="executarAcaoVeiculo('${veiculo.id}', 'acelerar', 10)" title="Aumentar velocidade em 10 km/h"><span role="img" aria-label="Pedal">💨</span> Acelerar (+10)</button>`;
    }
    acoesDiv.innerHTML += `<button onclick="executarAcaoVeiculo('${veiculo.id}', 'buzinar')" title="Tocar a buzina"><span role="img" aria-label="Megafone">📣</span> Buzinar</button>`;

    // Botões de Ação Específicos por Tipo
    if (veiculo instanceof CarroEsportivo) {
        if (!veiculo.turbo) {
            acoesDiv.innerHTML += `<button onclick="executarAcaoVeiculo('${veiculo.id}', 'ativarTurbo')" title="Ativar o turbo (requer motor ligado)"><span role="img" aria-label="Foguete">🚀</span> Ativar Turbo</button>`;
        } else {
            acoesDiv.innerHTML += `<button onclick="executarAcaoVeiculo('${veiculo.id}', 'desativarTurbo')" title="Desativar o turbo"><span role="img" aria-label="Caracol">🐌</span> Desativar Turbo</button>`;
        }
    } else if (veiculo instanceof Caminhao) {
        // Cria um container flex para os controles de carga
        const cargaContainer = document.createElement('div');
        cargaContainer.style.display = 'flex';
        cargaContainer.style.alignItems = 'center';
        cargaContainer.style.marginTop = '10px'; // Espaçamento
        cargaContainer.innerHTML = `
            <input type="number" id="pesoCargaModal_${veiculo.id}" placeholder="Peso (kg)" min="1" style="width: 120px; margin-right: 5px; padding: 8px;" title="Digite o peso para carregar ou descarregar">
            <button onclick="executarAcaoVeiculo('${veiculo.id}', 'carregar')" title="Adicionar carga ao caminhão"><span role="img" aria-label="Seta para cima">⬆️</span> Carregar</button>
            <button onclick="executarAcaoVeiculo('${veiculo.id}', 'descarregar')" title="Remover carga do caminhão"><span role="img" aria-label="Seta para baixo">⬇️</span> Descarregar</button>
        `;
         acoesDiv.appendChild(cargaContainer);
    }
}

// Função genérica para chamar métodos do veículo a partir da UI
function executarAcaoVeiculo(veiculoId, acao, param = null) {
    const veiculo = garagem.find(v => v.id === veiculoId);
    if (!veiculo) {
         exibirNotificacao("Erro interno: Veículo não encontrado para executar ação.", "error");
         return;
     }

    // Tratamento especial para carregar/descarregar caminhão para pegar o valor do input
    if ((acao === 'carregar' || acao === 'descarregar') && veiculo instanceof Caminhao) {
        const inputPeso = document.getElementById(`pesoCargaModal_${veiculo.id}`);
        if (!inputPeso) {
            console.error("Input de peso não encontrado no modal para caminhão.");
            return;
        }
        param = inputPeso.value; // Pega o valor atual do input
         inputPeso.value = ''; // Limpa o campo após usar (ou não, dependendo da preferência)
    }

    // Verifica se o método existe no objeto veículo
    if (typeof veiculo[acao] === 'function') {
        try {
            veiculo[acao](param); // Chama o método correspondente
            // A responsabilidade de atualizar UI/salvar está dentro dos métodos das classes agora
        } catch (error) {
             console.error(`Erro ao executar ação '${acao}' no veículo ${veiculo.id}:`, error);
             exibirNotificacao(`Erro ao executar ${acao}: ${error.message}`, 'error');
        }
    } else {
        console.error(`Ação '${acao}' não é uma função válida no veículo ${veiculo.id}`);
        exibirNotificacao(`Erro interno: Ação '${acao}' desconhecida.`, 'error');
    }
}

// --- Manipulação de Formulários e Eventos ---

// Formulário Adicionar Veículo
const formAdicionarVeiculo = document.getElementById('formAdicionarVeiculo');
formAdicionarVeiculo.addEventListener('submit', function(event) {
    event.preventDefault(); // Impede recarregamento da página

    const tipo = document.getElementById('tipoVeiculo').value;
    const modelo = document.getElementById('modeloVeiculo').value;
    const cor = document.getElementById('corVeiculo').value;

    if (!tipo || !modelo.trim() || !cor.trim()) {
         exibirNotificacao("Por favor, preencha tipo, modelo e cor do veículo.", 'warning');
         return;
    }

    let novoVeiculo;
    try {
        // Depende das classes Carro, CarroEsportivo, Caminhao
        switch (tipo) {
            case 'Carro':
                novoVeiculo = new Carro(modelo, cor);
                break;
            case 'CarroEsportivo':
                novoVeiculo = new CarroEsportivo(modelo, cor);
                break;
            case 'Caminhao':
                const capacidadeInput = document.getElementById('capacidadeCargaVeiculo');
                const capacidade = capacidadeInput.value;
                if (!capacidade || isNaN(parseFloat(capacidade)) || parseFloat(capacidade) < 0) {
                    exibirNotificacao("Capacidade de carga inválida para o caminhão.", 'error');
                    capacidadeInput.focus();
                    return;
                }
                novoVeiculo = new Caminhao(modelo, cor, capacidade);
                break;
            default:
                exibirNotificacao("Tipo de veículo selecionado é inválido.", 'error');
                return;
        }

        garagem.push(novoVeiculo);
        salvarGaragem();
        renderizarGaragem(); // Atualiza a lista na tela principal
        exibirNotificacao(`Veículo ${modelo} adicionado com sucesso!`, 'success');
        formAdicionarVeiculo.reset(); // Limpa o formulário
        document.getElementById('campoCapacidadeCarga').style.display = 'none'; // Esconde campo do caminhão

    } catch (error) {
        console.error("Erro ao criar ou adicionar veículo:", error);
        exibirNotificacao(`Erro ao adicionar veículo: ${error.message}`, 'error');
    }
});

// Mostra/Esconde campo de capacidade ao mudar tipo de veículo
document.getElementById('tipoVeiculo').addEventListener('change', function() {
    const campoCapacidadeDiv = document.getElementById('campoCapacidadeCarga');
    const capacidadeInput = document.getElementById('capacidadeCargaVeiculo');
    const show = (this.value === 'Caminhao');

    campoCapacidadeDiv.style.display = show ? 'block' : 'none';
    capacidadeInput.required = show;
     if (!show) {
         capacidadeInput.value = '';
     }
});

// Formulário Adicionar/Agendar Manutenção (dentro do Modal)
const formManutencao = document.getElementById('formManutencao');
formManutencao.addEventListener('submit', function(event) {
    event.preventDefault();

    const veiculoId = document.getElementById('manutencaoVeiculoId').value;
    const dataInput = document.getElementById('manutencaoData');
    const tipoInput = document.getElementById('manutencaoTipo');
    const custoInput = document.getElementById('manutencaoCusto');
    const descricaoInput = document.getElementById('manutencaoDescricao');

    const veiculo = garagem.find(v => v.id === veiculoId);

    if (!veiculo) {
        exibirNotificacao("Erro: Veículo não encontrado para adicionar manutenção.", 'error');
        return;
    }

    const data = dataInput.value;
    const tipo = tipoInput.value;
    const custo = custoInput.value;
    const descricao = descricaoInput.value;

     if (!data || !tipo.trim() || custo === '' || parseFloat(custo) < 0) {
         exibirNotificacao("Preencha Data, Tipo e Custo (não negativo) corretamente.", 'warning');
         return;
     }

    try {
        // Cria a instância (a classe Manutencao também valida internamente)
        // Depende da classe Manutencao
        const novaManutencao = new Manutencao(data, tipo, custo, descricao);

        // Tenta adicionar ao histórico do veículo
        // Depende do método adicionarManutencao da classe Veiculo
        const adicionadoComSucesso = veiculo.adicionarManutencao(novaManutencao);

        if (adicionadoComSucesso) {
            renderizarHistoricoManutencaoModal(veiculoId); // Atualiza a lista no modal
            renderizarAgendamentosFuturos(); // Atualiza lista geral de agendamentos
            formManutencao.reset(); // Limpa o formulário
            const fpInstance = dataInput._flatpickr;
            if (fpInstance) fpInstance.close();
            verificarAgendamentosProximos(); // Re-verifica lembretes
        }
        // Se não adicionou com sucesso, a notificação de erro já foi exibida por adicionarManutencao

    } catch (error) {
        console.error("Erro ao criar ou adicionar manutenção via formulário:", error);
        exibirNotificacao(`Erro no formulário de manutenção: ${error.message}`, 'error');
    }
});

// Função para remover veículo da garagem
function removerVeiculo(veiculoId) {
    const veiculo = garagem.find(v => v.id === veiculoId);
    if (!veiculo) {
         exibirNotificacao("Erro: Veículo não encontrado para remoção.", "error");
         return;
     }

    if (confirm(`ATENÇÃO!\nTem certeza que deseja remover PERMANENTEMENTE o veículo "${veiculo.modelo} (${veiculo.cor})"?\n\nTodo o histórico de manutenção será perdido.`)) {
        garagem = garagem.filter(v => v.id !== veiculoId);
        salvarGaragem();
        renderizarGaragem();
        renderizarAgendamentosFuturos();
        exibirNotificacao(`Veículo ${veiculo.modelo} removido com sucesso.`, 'success');

        if (modal.style.display === 'block' && document.getElementById('manutencaoVeiculoId').value === veiculoId) {
            fecharModal();
        }
    }
}

// Função para remover uma manutenção/agendamento específico (chamada pelos botões)
function removerManutencao(veiculoId, manutencaoId) {
    const veiculo = garagem.find(v => v.id === veiculoId);
    if (!veiculo) {
         exibirNotificacao("Erro: Veículo não encontrado para remover manutenção.", "error");
         return;
     }

     const manutencao = veiculo.historicoManutencao.find(m => m.id === manutencaoId);
     if (!manutencao) {
         exibirNotificacao("Erro: Registro de manutenção não encontrado.", "error");
         return;
     }

    if (confirm(`Tem certeza que deseja remover o registro:\n"${manutencao.tipo}" em ${manutencao.data.toLocaleDateString()}?`)) {
        // Depende do método removerManutencaoPorId da classe Veiculo
        const removido = veiculo.removerManutencaoPorId(manutencaoId);

        if (removido) {
            exibirNotificacao('Manutenção/Agendamento removido.', 'success');
             if (modal.style.display === 'block' && document.getElementById('manutencaoVeiculoId').value === veiculoId) {
                renderizarHistoricoManutencaoModal(veiculoId); // Atualiza no modal se aberto
             }
            renderizarAgendamentosFuturos(); // Atualiza na lista geral
            verificarAgendamentosProximos(); // Re-verifica lembretes
        } else {
            exibirNotificacao('Não foi possível remover a manutenção.', 'error');
        }
    }
}

// --- Notificações e Lembretes ---
let notificationTimeout; // Armazena o ID do timeout da notificação

function exibirNotificacao(mensagem, tipo = 'info', duracaoMs = 5000) { // Tipos: 'info', 'success', 'warning', 'error'
    const notificacaoDiv = document.getElementById('notificacoes');
    if (!notificacaoDiv) return;

    notificacaoDiv.textContent = mensagem;
    notificacaoDiv.className = '';
    notificacaoDiv.classList.add(tipo);
    notificacaoDiv.classList.add('show');

    clearTimeout(notificationTimeout);

    if (duracaoMs > 0) {
        notificationTimeout = setTimeout(() => {
            notificacaoDiv.classList.remove('show');
        }, duracaoMs);
    }
}

function verificarAgendamentosProximos() {
    const agora = new Date();
    const amanha = new Date(agora);
    amanha.setDate(agora.getDate() + 1);
    const limite = new Date(agora.getTime() + 2 * 24 * 60 * 60 * 1000); // Próximas 48 horas

    let lembretes = [];

    garagem.forEach(veiculo => {
        veiculo.historicoManutencao.forEach(manutencao => {
            if (manutencao.data instanceof Date && !isNaN(manutencao.data.getTime()) &&
                manutencao.data > agora && manutencao.data < limite)
            {
                const dataManutencao = manutencao.data;
                let quando = '';
                const hora = dataManutencao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                 const hojeStr = agora.toDateString();
                 const amanhaStr = amanha.toDateString();
                 const dataManutencaoStr = dataManutencao.toDateString();

                if (dataManutencaoStr === hojeStr) {
                    quando = `HOJE às ${hora}`;
                } else if (dataManutencaoStr === amanhaStr) {
                    quando = `AMANHÃ às ${hora}`;
                } else {
                     quando = `em ${dataManutencao.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })} às ${hora}`;
                 }
                lembretes.push(`🔔 LEMBRETE: ${manutencao.tipo} (${veiculo.modelo}) ${quando}.`);
            }
        });
    });

    if (lembretes.length > 0) {
        exibirNotificacao(lembretes.join('\n'), 'warning', 10000); // Dura 10 segundos
    }
}

// --- Inicialização da Aplicação ---
document.addEventListener('DOMContentLoaded', () => {
    if (typeof flatpickr !== 'undefined' && flatpickr.l10ns && flatpickr.l10ns.pt) {
        flatpickr.localize(flatpickr.l10ns.pt);
    } else {
         console.warn("Flatpickr ou localização 'pt' não encontrados. Datepicker usará inglês.");
    }

    carregarGaragem(); // Carrega os dados e renderiza a UI inicial

    const tipoVeiculoSelect = document.getElementById('tipoVeiculo');
    if (tipoVeiculoSelect.value === 'Caminhao') {
        document.getElementById('campoCapacidadeCarga').style.display = 'block';
        document.getElementById('capacidadeCargaVeiculo').required = true;
    }

    console.log("Garagem Inteligente inicializada.");
});

/**
 * @async
 * @function buscarDetalhesVeiculoAPI
 * @description Busca detalhes extras de um veículo em uma API simulada local (JSON).
 * @param {string} identificadorVeiculo - O ID único do veículo a ser buscado.
 * @returns {Promise<object|null>} Uma Promise que resolve com o objeto contendo
 * os detalhes extras do veículo encontrado, ou null se não encontrado.
 * Lança um erro se a requisição falhar ou o JSON for inválido.
 * @throws {Error} Se ocorrer um erro de rede ou ao processar a resposta.
 * 
 * 
 */

// [Seu JS anterior...]

// <<< COLE A FUNÇÃO buscarDetalhesVeiculoAPI AQUI >>>
/**
 * @async
 * @function buscarDetalhesVeiculoAPI
 * [...] JSDoc
 */
async function buscarDetalhesVeiculoAPI(identificadorVeiculo) {
    // [...] Conteúdo da função buscarDetalhesVeiculoAPI
}
// <<< FIM DA FUNÇÃO buscarDetalhesVeiculoAPI >>>


// A função abrirModalDetalhes começa aqui ou logo abaixo
async function abrirModalDetalhes(veiculoId) {
    // [...]
}


// <<< APAGUE A FUNÇÃO ABRIRMODALDETALHES ANTIGA E COLE ESTA NO LUGAR >>>
async function abrirModalDetalhes(veiculoId) { // Note o 'async'
    // Verifica se o modal foi encontrado...
    if (!modal) { /* ... */ }

    const veiculo = garagem.find(v => v.id === veiculoId);
    if (!veiculo) { /* ... */ }

    // Elementos internos do modal...
    const tituloEl = document.getElementById('modalTituloVeiculo');
    // ...outros elementos...
    const detalhesApiDiv = document.getElementById('modalDetalhesExtrasApi'); // Pega a nova div

    if (!tituloEl /* ... || !detalhesApiDiv */ ) { /* ... */ } // Verifica todos

    // Configuração Inicial do Modal...
    tituloEl.textContent = /* ... */
    // ...outras configs...

    // Atualiza informações principais e histórico PRIMEIRO
    atualizarInfoVeiculoNoModal(veiculoId);
    renderizarHistoricoManutencaoModal(veiculoId);

    // --- Busca e Exibição dos Detalhes da API Simulada ---
    detalhesApiDiv.innerHTML = '<h4>Detalhes da API</h4><p><em>Carregando detalhes extras...</em></p>'; // Mostra carregando

    try {
        const dadosApi = await buscarDetalhesVeiculoAPI(veiculoId); // CHAMA A NOVA FUNÇÃO

        if (dadosApi) {
            // Formata e exibe os dados encontrados
            detalhesApiDiv.innerHTML = `<h4>Detalhes da API</h4> /* ... HTML com os dados ... */ `;
        } else {
            // Informa que não encontrou
            detalhesApiDiv.innerHTML = '<h4>Detalhes da API</h4><p><em>Detalhes extras não encontrados...</em></p>';
        }
    } catch (error) {
        // Exibe a mensagem de erro
        detalhesApiDiv.innerHTML = `<h4>Detalhes da API</h4><p class="error-message">Erro ao buscar...: ${error.message}</p>`;
    }

    // Exibição Final do Modal...
    modal.style.display = 'block';
    // ...animações...
}
// <<< FIM DA FUNÇÃO ABRIRMODALDETALHES ATUALIZADA >>>

// Em main.js ou script.js

// URL do nosso backend
const backendUrl = 'http://localhost:3001'; // Em produção, mude para a URL do Render

// Nova função carregarGaragem (READ)
async function carregarGaragem() {
    try {
        const response = await fetch(`${backendUrl}/api/veiculos`);
        if (!response.ok) throw new Error('Falha ao buscar dados do servidor.');
        
        const veiculosDoBanco = await response.json();
        // Usamos o fromJSON para recriar as instâncias de classe
        garagem = veiculosDoBanco.map(vJson => Veiculo.fromJSON(vJson)).filter(v => v !== null);
    } catch (error) {
        console.error("Erro ao carregar garagem:", error);
        exibirNotificacao(error.message, 'error');
        garagem = [];
    }
    renderizarGaragem();
    renderizarAgendamentosFuturos();
}

// Novo Listener do formulário (CREATE)
formAdicionarVeiculo.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const dadosForm = {
        tipoVeiculo: document.getElementById('tipoVeiculo').value,
        modelo: document.getElementById('modeloVeiculo').value,
        cor: document.getElementById('corVeiculo').value,
        placa: prompt("Digite a placa do veículo (obrigatório):") // Adicionar um campo de placa no HTML é o ideal
    };

    if (dadosForm.tipoVeiculo === 'Caminhao') {
        dadosForm.capacidadeCarga = document.getElementById('capacidadeCargaVeiculo').value;
    }

    try {
        const response = await fetch(`${backendUrl}/api/veiculos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosForm)
        });
        const resultado = await response.json();
        if (!response.ok) throw new Error(resultado.error);

        exibirNotificacao(`Veículo ${resultado.modelo} adicionado com sucesso!`, 'success');
        await carregarGaragem(); // Recarrega a lista do banco
        formAdicionarVeiculo.reset();
        
    } catch (error) {
        exibirNotificacao(`Erro ao adicionar: ${error.message}`, 'error');
    }
});

// Nova função removerVeiculo (DELETE)
async function removerVeiculo(veiculoId) {
    const veiculo = garagem.find(v => v.id === veiculoId);
    if (!veiculo || !confirm(`Remover o veículo ${veiculo.modelo}?`)) return;

    try {
        const response = await fetch(`${backendUrl}/api/veiculos/${veiculoId}`, { method: 'DELETE' });
        const resultado = await response.json();
        if (!response.ok) throw new Error(resultado.error);

        exibirNotificacao(resultado.message, 'success');
        await carregarGaragem();

    } catch (error) {
        exibirNotificacao(`Erro ao remover: ${error.message}`, 'error');
    }
}

// Nova função para editar (UPDATE)
async function editarVeiculo(veiculoId) {
    const veiculo = garagem.find(v => v.id === veiculoId);
    if (!veiculo) return;

    const novaCor = prompt("Digite a nova cor:", veiculo.cor);
    if (!novaCor) return; // Usuário cancelou ou deixou em branco

    try {
        const response = await fetch(`${backendUrl}/api/veiculos/${veiculoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cor: novaCor })
        });
        const resultado = await response.json();
        if (!response.ok) throw new Error(resultado.error);

        exibirNotificacao('Veículo atualizado com sucesso!', 'success');
        await carregarGaragem();
        
    } catch (error) {
        exibirNotificacao(`Erro ao atualizar: ${error.message}`, 'error');
    }
}

// Em `renderizarGaragem`, garanta que os botões chamam as novas funções:
function renderizarGaragem() {
    // ...
    // dentro do forEach...
    itemDiv.innerHTML = `
        <span><strong>${veiculo.modelo}</strong> ... </span>
        <div class="actions">
            <button onclick="editarVeiculo('${veiculo.id}')">Editar Cor</button>
            <button onclick="abrirModalDetalhes('${veiculo.id}')">Detalhes</button>
            <button class="warning" onclick="removerVeiculo('${veiculo.id}')">Remover</button>
        </div>
    `;
    // ...
}



// No início do seu main.js

// Função mestre para navegar entre as telas da nossa SPA
function mostrarTela(idTela) {
    // Esconde todas as divs com a classe 'tela'
    document.querySelectorAll('.tela').forEach(tela => {
        tela.classList.remove('tela-ativa');
    });
    
    // Mostra apenas a tela com o ID que foi pedido
    const telaAtiva = document.getElementById(idTela);
    if (telaAtiva) {
        telaAtiva.classList.add('tela-ativa');
    }
}


// Dentro do seu 'DOMContentLoaded'
document.addEventListener('DOMContentLoaded', () => {
    
    // ...seu código de carregarGaragem(), listeners, etc...

    // Inicia a aplicação mostrando a tela do simulador
    mostrarTela('telaSimulador'); 

    // O resto dos seus listeners já usa `mostrarTela`, então devem funcionar.
});

// Local: /main.js (Na RAIZ do projeto)



function exibirNotificacao(mensagem, tipo = 'info', duracaoMs = 4000) { /* ...código da notificação... */ }
// ... (outras funções de UI como `fecharModal` etc.)

// =================== FUNÇÕES DE COMUNICAÇÃO COM API (CRUD) ===================

// READ VEÍCULOS
async function carregarGaragem() {
    try {
        const response = await fetch(`${backendUrl}/api/veiculos`);
        if (!response.ok) throw new Error('Falha ao buscar veículos do servidor.');
        const veiculosDoBanco = await response.json();
        garagem = veiculosDoBanco.map(vJson => Veiculo.fromJSON(vJson)).filter(v => v !== null);
    } catch (error) {
        exibirNotificacao(error.message, 'error');
        garagem = [];
    }
    renderizarGaragem();
}

// DELETE VEÍCULO
async function removerVeiculo(veiculoId) { /* ...código do fetch DELETE... */ }

// UPDATE VEÍCULO
async function editarVeiculo(veiculoId) { /* ...código do fetch PUT... */ }

// READ MANUTENÇÕES
async function carregarManutencoesDoVeiculo(veiculoId) { /* ...código do fetch GET para manutenções... */ }

// CREATE MANUTENÇÃO
// Adicione este listener DENTRO do 'DOMContentLoaded'
// formManutencao.addEventListener('submit', async function(event) { ...código do fetch POST para manutenções... });

// =================== RENDERIZAÇÃO E EVENTOS ===================
function renderizarGaragem() {
    const listaVeiculosDiv = document.getElementById('listaVeiculos');
    listaVeiculosDiv.innerHTML = '';
    garagem.forEach(veiculo => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'vehicle-item';
        itemDiv.innerHTML = `
            <span><strong>${veiculo.modelo}</strong> (${veiculo.placa}) - Cor: ${veiculo.cor}</span>
            <div class="actions">
                <button onclick="editarVeiculo('${veiculo.id}')">Editar Cor</button>
                <button onclick="abrirModalDetalhes('${veiculo.id}')">Detalhes</button>
                <button class="warning" onclick="removerVeiculo('${veiculo.id}')">Remover</button>
            </div>`;
        listaVeiculosDiv.appendChild(itemDiv);
    });
}

function abrirModalDetalhes(veiculoId) {
    // ... lógica para popular o modal ...
    carregarManutencoesDoVeiculo(veiculoId); // Chave! Busca as manutenções da API
}

document.addEventListener('DOMContentLoaded', () => {
    carregarGaragem(); // Ponto de partida!

    const formAdicionarVeiculo = document.getElementById('formAdicionarVeiculo');
    formAdicionarVeiculo.addEventListener('submit', async function(event) {
        event.preventDefault();
        // ... Lógica de criar objeto com dados do form
        // ... e fazer o fetch POST para '/api/veiculos'
        // ... No final, chamar `await carregarGaragem();`
    });

    const formManutencao = document.getElementById('formManutencao');
    formManutencao.addEventListener('submit', async function(event) {
        event.preventDefault();
        // ... Lógica para pegar veiculoId e dados do form de manutenção
        // ... e fazer o fetch POST para `/api/veiculos/${veiculoId}/manutencoes`
        // ... No final, chamar `await carregarManutencoesDoVeiculo(veiculoId);`
    });
});

// (Cole o código completo do main.js da resposta anterior, já está pronto)