// --- Classes de Veículos (Versão SIMPLES) ---
class Veiculo {
    constructor(modelo, cor) {
        this.modelo = modelo;
        this.cor = cor;
        this.ligado = false;
        this.velocidade = 0;
    }

    ligar() {
        if(this.ligado) {
             this.exibirMensagem(`${this.modelo} já está ligado.`);
             return;
        }
        this.ligado = true;
        this.exibirMensagem(`${this.modelo} ligado.`);
        console.log(`${this.modelo} ligado.`);
        atualizarInformacoes(); // Atualiza a UI correspondente
    }

    desligar() {
        if(!this.ligado) {
             this.exibirMensagem(`${this.modelo} já está desligado.`);
             return;
        }
        this.ligado = false;
        this.velocidade = 0;
        this.exibirMensagem(`${this.modelo} desligado.`);
        console.log(`${this.modelo} desligado.`);
        atualizarInformacoes();
    }

    acelerar(incremento = 10) { // Adiciona incremento padrão
        if (this.ligado) {
            this.velocidade += incremento;
            this.exibirMensagem(`${this.modelo} acelerou para ${this.velocidade} km/h.`);
            console.log(`${this.modelo} acelerou para ${this.velocidade} km/h.`);
            atualizarInformacoes();
        } else {
            this.exibirMensagem(`${this.modelo} não pode acelerar. Está desligado.`);
            console.log(`${this.modelo} não pode acelerar. Está desligado.`);
        }
    }

    buzinar() {
        this.exibirMensagem(`${this.modelo} buzinou: Beep beep!`);
        console.log('Beep beep!');
    }

    // Função para exibir mensagens na tela (associada ao elemento #mensagem)
    exibirMensagem(mensagemTexto) {
        const mensagemDiv = document.getElementById('mensagem');
        if (mensagemDiv) {
             mensagemDiv.textContent = mensagemTexto;
             mensagemDiv.style.display = 'block'; // Mostra a div
             // Opcional: esconder depois de um tempo
            // setTimeout(() => { mensagemDiv.style.display = 'none'; }, 3000);
        } else {
            console.warn("Elemento #mensagem não encontrado para exibir:", mensagemTexto);
        }
    }
}

// Classe CarroEsportivo (Herda de Veiculo - Versão SIMPLES)
class CarroEsportivo extends Veiculo {
    constructor(modelo, cor, turbo = false) {
        super(modelo, cor);
        this.turbo = turbo;
    }

    ativarTurbo() {
         if (this.turbo) {
             this.exibirMensagem('Turbo já está ativado!');
             return;
         }
         if (!this.ligado) {
             this.exibirMensagem('Ligue o carro antes de ativar o turbo!');
             return;
         }
        this.turbo = true;
        this.exibirMensagem('🚀 Turbo ativado!');
        console.log('Turbo ativado!');
        atualizarInformacoes();
    }

    desativarTurbo() {
         if (!this.turbo) {
             this.exibirMensagem('Turbo já está desativado.');
             return;
         }
        this.turbo = false;
        this.exibirMensagem('Turbo desativado.');
        console.log('Turbo desativado.');
        atualizarInformacoes();
    }
}

// Classe Caminhao (Herda de Veiculo - Versão SIMPLES)
class Caminhao extends Veiculo {
    constructor(modelo, cor, capacidadeCarga, cargaAtual = 0) {
        super(modelo, cor);
        this.capacidadeCarga = parseFloat(capacidadeCarga) || 0;
        this.cargaAtual = parseFloat(cargaAtual) || 0;
    }

    carregar(peso) {
        const pesoNumerico = parseFloat(peso);
        if (isNaN(pesoNumerico) || pesoNumerico <=0){
            this.exibirMensagem('Peso inválido para carregar.');
            return;
        }

        if (this.cargaAtual + pesoNumerico <= this.capacidadeCarga) {
            this.cargaAtual += pesoNumerico;
            this.exibirMensagem(`Caminhão carregado com ${pesoNumerico} kg. Carga atual: ${this.cargaAtual} kg.`);
            console.log(`Caminhão carregado com ${pesoNumerico} kg. Carga atual: ${this.cargaAtual} kg.`);
            atualizarInformacoes();
        } else {
            const espaco = this.capacidadeCarga - this.cargaAtual;
            this.exibirMensagem(`Carga (${pesoNumerico}kg) excedeu a capacidade! Espaço livre: ${espaco}kg.`);
            console.log('Carga excedeu a capacidade máxima!');
        }
    }

     // Método descarregar (faltava na versão simples)
     descarregar(peso) {
         const pesoNumerico = parseFloat(peso);
         if (isNaN(pesoNumerico) || pesoNumerico <=0){
             this.exibirMensagem('Peso inválido para descarregar.');
             return;
         }

         if (this.cargaAtual >= pesoNumerico) {
             this.cargaAtual -= pesoNumerico;
             this.exibirMensagem(`Caminhão descarregado em ${pesoNumerico} kg. Carga atual: ${this.cargaAtual} kg.`);
             console.log(`Caminhão descarregado em ${pesoNumerico} kg. Carga atual: ${this.cargaAtual} kg.`);
             atualizarInformacoes();
         } else {
             this.exibirMensagem(`Não é possível descarregar ${pesoNumerico}kg. Carga atual é ${this.cargaAtual}kg.`);
         }
     }
}

// --- Instâncias FIXAS dos veículos ---
const meuCarro = new Veiculo('Sedan', 'Prata');
const meuCarroEsportivo = new CarroEsportivo('Super Carro', 'Vermelho');
const meuCaminhao = new Caminhao('Volvo FH', 'Branco', 10000); // Exemplo de caminhão

// --- Funções de Controle da Interface (Versão SIMPLES) ---

// Função para mostrar/esconder telas
function mostrarTela(telaId) {
    // Esconde todas as telas
    document.querySelectorAll('.tela').forEach(tela => {
        tela.style.display = 'none';
        tela.classList.remove('tela-ativa');
    });
    // Mostra a tela desejada
    const telaAlvo = document.getElementById(telaId);
    if (telaAlvo) {
        telaAlvo.style.display = 'block';
        telaAlvo.classList.add('tela-ativa');
        console.log(`Mostrando tela: ${telaId}`);
    } else {
        console.error(`Tela com ID ${telaId} não encontrada!`);
    }
     // Limpa a mensagem ao trocar de tela
     const mensagemDiv = document.getElementById('mensagem');
     if(mensagemDiv) mensagemDiv.style.display = 'none';
}

// Funções para atualizar as informações de cada veículo na sua respectiva tela
function atualizarInfoCarro() {
    const carroInfoDiv = document.getElementById('infoCarro');
    if (carroInfoDiv) {
        carroInfoDiv.innerHTML = `
            <p><strong>Modelo:</strong> ${meuCarro.modelo}</p>
            <p><strong>Cor:</strong> ${meuCarro.cor}</p>
            <p><strong>Ligado:</strong> ${meuCarro.ligado ? 'Sim' : 'Não'}</p>
            <p><strong>Velocidade:</strong> ${meuCarro.velocidade} km/h</p>
        `;
    }
}

function atualizarInfoEsportivo() {
    const esportivoInfoDiv = document.getElementById('infoEsportivo');
    if (esportivoInfoDiv) {
        esportivoInfoDiv.innerHTML = `
            <p><strong>Modelo:</strong> ${meuCarroEsportivo.modelo}</p>
            <p><strong>Cor:</strong> ${meuCarroEsportivo.cor}</p>
            <p><strong>Ligado:</strong> ${meuCarroEsportivo.ligado ? 'Sim' : 'Não'}</p>
            <p><strong>Velocidade:</strong> ${meuCarroEsportivo.velocidade} km/h</p>
            <p><strong>Turbo:</strong> ${meuCarroEsportivo.turbo ? 'Ativado' : 'Desativado'}</p>
        `;
    }
}

function atualizarInfoCaminhao() {
    const caminhaoInfoDiv = document.getElementById('infoCaminhao');
    if (caminhaoInfoDiv) {
        caminhaoInfoDiv.innerHTML = `
            <p><strong>Modelo:</strong> ${meuCaminhao.modelo}</p>
            <p><strong>Cor:</strong> ${meuCaminhao.cor}</p>
            <p><strong>Ligado:</strong> ${meuCaminhao.ligado ? 'Sim' : 'Não'}</p>
            <p><strong>Velocidade:</strong> ${meuCaminhao.velocidade} km/h</p>
            <p><strong>Capacidade:</strong> ${meuCaminhao.capacidadeCarga} kg</p>
            <p><strong>Carga Atual:</strong> ${meuCaminhao.cargaAtual} kg</p>
             <!-- Opcional: Barra de progresso -->
             <progress value="${meuCaminhao.cargaAtual}" max="${meuCaminhao.capacidadeCarga}" style="width: 100%; height: 15px; margin-top: 5px;"></progress>
        `;
    }
}

// Função genérica para chamar as atualizações de UI corretas
function atualizarInformacoes() {
    // Descobre qual tela está ativa para atualizar apenas ela
    const telaAtiva = document.querySelector('.tela-ativa');
    if (!telaAtiva) return;

    switch (telaAtiva.id) {
        case 'telaCarro':
            atualizarInfoCarro();
            break;
        case 'telaEsportivo':
            atualizarInfoEsportivo();
            break;
        case 'telaCaminhao':
            atualizarInfoCaminhao();
            break;
    }
}

// --- Event Listeners (Versão SIMPLES) ---
document.addEventListener('DOMContentLoaded', () => {

    // Navegação inicial
    mostrarTela('telaPrincipal');

    // Botões de Navegação Principal
    document.getElementById('irParaCarro')?.addEventListener('click', () => {
        mostrarTela('telaCarro');
        atualizarInfoCarro(); // Atualiza ao entrar na tela
    });
    document.getElementById('irParaEsportivo')?.addEventListener('click', () => {
        mostrarTela('telaEsportivo');
        atualizarInfoEsportivo(); // Atualiza ao entrar na tela
    });
    document.getElementById('irParaCaminhao')?.addEventListener('click', () => {
        mostrarTela('telaCaminhao');
        atualizarInfoCaminhao(); // Atualiza ao entrar na tela
    });

    // Botões de Voltar
    document.getElementById('voltarParaGaragemCarro')?.addEventListener('click', () => mostrarTela('telaPrincipal'));
    document.getElementById('voltarParaGaragemEsportivo')?.addEventListener('click', () => mostrarTela('telaPrincipal'));
    document.getElementById('voltarParaGaragemCaminhao')?.addEventListener('click', () => mostrarTela('telaPrincipal'));

    // --- Ações do Carro ---
    document.getElementById('ligarCarro')?.addEventListener('click', () => meuCarro.ligar());
    document.getElementById('desligarCarro')?.addEventListener('click', () => meuCarro.desligar());
    document.getElementById('acelerarCarro')?.addEventListener('click', () => meuCarro.acelerar(10));
    document.getElementById('buzinarCarro')?.addEventListener('click', () => meuCarro.buzinar());

    // --- Ações do Carro Esportivo ---
    document.getElementById('ligarEsportivo')?.addEventListener('click', () => meuCarroEsportivo.ligar());
    document.getElementById('desligarEsportivo')?.addEventListener('click', () => meuCarroEsportivo.desligar());
    document.getElementById('acelerarEsportivo')?.addEventListener('click', () => meuCarroEsportivo.acelerar(20)); // Acelera mais rápido
    document.getElementById('buzinarEsportivo')?.addEventListener('click', () => meuCarroEsportivo.buzinar());
    document.getElementById('ativarTurbo')?.addEventListener('click', () => meuCarroEsportivo.ativarTurbo());
    document.getElementById('desativarTurbo')?.addEventListener('click', () => meuCarroEsportivo.desativarTurbo());

    // --- Ações do Caminhão ---
    document.getElementById('ligarCaminhao')?.addEventListener('click', () => meuCaminhao.ligar());
    document.getElementById('desligarCaminhao')?.addEventListener('click', () => meuCaminhao.desligar());
    document.getElementById('acelerarCaminhao')?.addEventListener('click', () => meuCaminhao.acelerar(5)); // Acelera mais devagar
    document.getElementById('buzinarCaminhao')?.addEventListener('click', () => meuCaminhao.buzinar());
    document.getElementById('carregarCaminhao')?.addEventListener('click', () => {
        const pesoInput = document.getElementById('pesoCarga');
        if (pesoInput && pesoInput.value) {
            meuCaminhao.carregar(pesoInput.value);
            // pesoInput.value = ''; // Limpa o campo após carregar
        } else {
             meuCaminhao.exibirMensagem('Digite um peso para carregar.');
        }
    });
     // Adiciona listener para descarregar (se você adicionar o botão no HTML)
     // document.getElementById('descarregarCaminhao')?.addEventListener('click', () => { ... });

    console.log("Simulador de Veículos (Versão Simples) inicializado.");
});