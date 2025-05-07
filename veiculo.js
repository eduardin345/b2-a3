// --- Classe Veiculo (Base) ---
// Depende da classe Manutencao
class Veiculo {
    constructor(modelo, cor, id = null, tipoVeiculo = 'Veiculo') {
        this.id = id || `veh-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
        this.modelo = modelo.trim();
        this.cor = cor.trim();
        this.ligado = false;
        this.velocidade = 0;
        this.historicoManutencao = []; // Array para objetos Manutencao
        this.tipoVeiculo = tipoVeiculo; // Essencial para reidratação
    }

    ligar() {
        if (this.ligado) {
            exibirNotificacao(`${this.modelo} já está ligado.`, 'warning');
            return;
        }
        this.ligado = true;
        exibirNotificacao(`${this.modelo} ligado.`, 'info');
        atualizarInfoVeiculoNoModal(this.id); // Atualiza modal se aberto para este veículo
        salvarGaragem(); // Persiste a mudança de estado
    }

    desligar() {
        if (!this.ligado) {
            exibirNotificacao(`${this.modelo} já está desligado.`, 'warning');
            return;
        }
        this.ligado = false;
        this.velocidade = 0; // Resetar velocidade ao desligar
        exibirNotificacao(`${this.modelo} desligado.`, 'info');
        atualizarInfoVeiculoNoModal(this.id);
        salvarGaragem();
    }

    acelerar(incremento = 10) { // Valor padrão para incremento
        if (!this.ligado) {
            exibirNotificacao(`${this.modelo} não pode acelerar, está desligado.`, 'error');
            return; // Importante retornar para não continuar
        }
        this.velocidade += incremento;
         // Limitar velocidade máxima (opcional)
         // const VELOCIDADE_MAXIMA = 180;
         // if (this.velocidade > VELOCIDADE_MAXIMA) this.velocidade = VELOCIDADE_MAXIMA;

        exibirNotificacao(`${this.modelo} acelerou para ${this.velocidade} km/h.`, 'info');
        atualizarInfoVeiculoNoModal(this.id);
        // Opcional: salvarGaragem(); // Evitar salvar em ações muito frequentes
    }

    buzinar() {
        exibirNotificacao(`${this.modelo} buzinou: 📣 Beep beep!`, 'info');
    }

    // Método genérico para exibir informações básicas em HTML
    getInfoBasicaHTML() {
        return `
            <p><strong>ID:</strong> ${this.id}</p>
            <p><strong>Tipo:</strong> ${this.tipoVeiculo}</p>
            <p><strong>Modelo:</strong> ${this.modelo}</p>
            <p><strong>Cor:</strong> ${this.cor}</p>
            <p><strong>Ligado:</strong> <span class="${this.ligado ? 'status-on' : 'status-off'}">${this.ligado ? 'Sim' : 'Não'}</span></p>
            <p><strong>Velocidade:</strong> ${this.velocidade} km/h</p>
        `;
        // Adicionar classes CSS 'status-on' e 'status-off' para estilizar
    }

    // Método a ser sobrescrito pelas classes filhas para infos específicas
    getInfoEspecificaHTML() {
        return ''; // Vazio por padrão
    }

    // Combina informações básicas e específicas para exibição completa no modal
    exibirInformacoesCompletaHTML() {
        return this.getInfoBasicaHTML() + this.getInfoEspecificaHTML();
    }

    // Adiciona um objeto Manutencao ao histórico
    adicionarManutencao(manutencao) {
        // Verifica se a classe Manutencao existe antes de usar instanceof
        if (typeof Manutencao === 'undefined' || !(manutencao instanceof Manutencao)) {
            console.error("Objeto inválido ou classe Manutencao não definida ao adicionar:", manutencao);
            exibirNotificacao("Erro interno: Tentativa de adicionar manutenção inválida.", 'error');
            return false; // Falha
        }


        const erros = manutencao.validar();
        if (erros.length > 0) {
            exibirNotificacao(`Erro ao adicionar/agendar: ${erros.join(' ')}`, 'error');
            return false; // Falha devido a dados inválidos
        }

        this.historicoManutencao.push(manutencao);
        // Ordena sempre por data (mais recente primeiro, ou mais antiga - decida a ordem)
        this.historicoManutencao.sort((a, b) => b.data - a.data); // Mais recente primeiro
        // this.historicoManutencao.sort((a, b) => a.data - b.data); // Mais antiga primeiro

        const acao = manutencao.data > new Date() ? 'agendada' : 'registrada';
        exibirNotificacao(`Manutenção (${manutencao.tipo}) ${acao} para ${this.modelo}.`, 'success');
        salvarGaragem(); // Salva o estado atualizado da garagem
        return true; // Sucesso
    }

     // Remove uma manutenção pelo ID
     removerManutencaoPorId(manutencaoId) {
        const tamanhoAntes = this.historicoManutencao.length;
        this.historicoManutencao = this.historicoManutencao.filter(m => m.id !== manutencaoId);
        const removido = this.historicoManutencao.length < tamanhoAntes;
        if (removido) {
            salvarGaragem(); // Salva após remover
        }
        return removido; // Retorna true se removeu, false caso contrário
    }


    // Retorna o histórico formatado (string HTML)
    getHistoricoHTML() {
        if (this.historicoManutencao.length === 0) {
            return '<p>Nenhum registro de manutenção.</p>';
        }

        const agora = new Date();
        let html = '';

        // Ordenado por data (a ordem depende do sort em adicionarManutencao)
        // Separar por Passado e Futuro para clareza
        const passadas = this.historicoManutencao.filter(m => m.data && m.data <= agora); // Verifica se m.data existe
        const futuras = this.historicoManutencao.filter(m => m.data && m.data > agora); // Verifica se m.data existe

        if (passadas.length > 0) {
            html += '<h4>Histórico Passado</h4>';
            passadas.forEach(m => {
                 // Adiciona o botão remover no item de histórico
                 // Verifica se m.formatar é uma função
                 const itemFormatado = (typeof m.formatar === 'function') ? m.formatar() : `Registro ${m.id || m.tipo} inválido`;
                 html += `<div class="maintenance-item" data-id="${m.id}">
                           <span>${itemFormatado}</span>
                           <button class="small-warning" onclick="removerManutencao('${this.id}', '${m.id}')" title="Remover este registro">Remover</button>
                         </div>`;
            });
        }

        if (futuras.length > 0) {
            html += '<h4>Agendamentos Futuros</h4>';
            futuras.forEach(m => {
                 // Adiciona o botão cancelar no item de agendamento
                 // Verifica se m.formatar é uma função
                 const itemFormatado = (typeof m.formatar === 'function') ? m.formatar() : `Registro ${m.id || m.tipo} inválido`;
                 html += `<div class="schedule-item" data-id="${m.id}">
                            <span>${itemFormatado}</span>
                            <button class="small-warning" onclick="removerManutencao('${this.id}', '${m.id}')" title="Cancelar este agendamento">Cancelar</button>
                          </div>`;
            });
        }

         if (!html) { // Caso só tenha manutenções com data inválida (raro)
             return '<p>Nenhum registro de manutenção válido encontrado.</p>';
         }

        return html;
    }

    // Método estático para reidratação a partir de JSON genérico
    // Depende das classes Carro, CarroEsportivo, Caminhao e Manutencao
    static fromJSON(json) {
        // Verifica se as classes necessárias estão definidas
        if (typeof Carro === 'undefined' || typeof CarroEsportivo === 'undefined' || typeof Caminhao === 'undefined' || typeof Manutencao === 'undefined') {
            console.error("Classes de veículo ou Manutencao não definidas globalmente ao chamar Veiculo.fromJSON.");
            return null;
        }

        if (!json || !json.tipoVeiculo) {
            console.error("Tentativa de reidratar veículo a partir de JSON inválido:", json);
            return null; // Retorna null se o JSON for inválido
        }


        let veiculo;
        try {
            // Cria a instância da classe correta
            switch (json.tipoVeiculo) {
                case 'Carro':
                    veiculo = new Carro(json.modelo, json.cor, json.id);
                    break;
                case 'CarroEsportivo':
                    veiculo = new CarroEsportivo(json.modelo, json.cor, json.turbo, json.id);
                    break;
                case 'Caminhao':
                    veiculo = new Caminhao(json.modelo, json.cor, json.capacidadeCarga, json.cargaAtual, json.id);
                    // Carga atual pode precisar de fallback se não existir no JSON antigo
                    veiculo.cargaAtual = json.cargaAtual || 0;
                    break;
                default:
                    console.warn(`Tipo de veículo desconhecido no JSON: ${json.tipoVeiculo}. Criando como Veiculo base.`);
                    // Cria como Veiculo base, mas mantém o tipo original para evitar perda de dados
                    veiculo = new Veiculo(json.modelo, json.cor, json.id, json.tipoVeiculo);
            }

            // Restaura propriedades comuns
            veiculo.ligado = json.ligado || false;
            veiculo.velocidade = json.velocidade || 0;

            // Reidrata o histórico de manutenção
            if (json.historicoManutencao && Array.isArray(json.historicoManutencao)) {
                veiculo.historicoManutencao = json.historicoManutencao.map(mJson => {
                    if (!mJson || !mJson.tipo) { // Simplificado: checa apenas tipo (data será verificada depois)
                        console.warn("Registro de manutenção inválido (sem tipo) encontrado no JSON:", mJson);
                        return null; // Ignora registros inválidos
                    }
                    // Cria nova instância de Manutencao a partir do JSON
                    const manutencao = new Manutencao(mJson.data, mJson.tipo, mJson.custo, mJson.descricao);
                     // Restaura o ID original da manutenção, se existir
                     if (mJson.id) {
                         manutencao.id = mJson.id;
                     }
                     // Verifica se a data foi carregada corretamente APÓS a criação
                     if (!(manutencao.data instanceof Date) || isNaN(manutencao.data.getTime())) {
                         console.warn(`Manutenção ${manutencao.id || mJson.tipo} carregada com data inválida. Será mantida como inválida.`);
                         // Não retorna null aqui, deixa a validação/formatação lidar com isso
                     }
                    return manutencao;
                }).filter(m => m !== null); // Remove os nulos (inválidos por falta de tipo)

                // Reordena após carregar (tentará ordenar mesmo com datas inválidas, o que é ok)
                veiculo.historicoManutencao.sort((a, b) => {
                    const dateA = (a.data instanceof Date && !isNaN(a.data)) ? a.data.getTime() : -Infinity;
                    const dateB = (b.data instanceof Date && !isNaN(b.data)) ? b.data.getTime() : -Infinity;
                    return dateB - dateA; // Mais recente primeiro (inválidas ficam no final)
                });
            } else {
                veiculo.historicoManutencao = []; // Garante que seja um array vazio
            }

            return veiculo;

        } catch (error) {
            console.error(`Erro ao reidratar veículo ${json.id || '(sem id)'} do tipo ${json.tipoVeiculo}:`, error);
            // Em caso de erro na reidratação, retorna null para evitar quebrar a aplicação
            return null;
        }
    }

    // Método para serialização em JSON (garante que tipoVeiculo seja salvo)
    // Depende do método toJSON da classe Manutencao
    toJSON() {
        return {
            id: this.id,
            modelo: this.modelo,
            cor: this.cor,
            ligado: this.ligado,
            velocidade: this.velocidade,
            // Mapeia cada manutenção usando seu próprio toJSON
            historicoManutencao: this.historicoManutencao.map(m => {
                 // Verifica se m.toJSON é uma função antes de chamar
                 return (typeof m.toJSON === 'function') ? m.toJSON() : null;
             }).filter(m => m !== null), // Filtra nulos caso toJSON não exista
            tipoVeiculo: this.tipoVeiculo // Essencial para fromJSON funcionar
        };
    }
}