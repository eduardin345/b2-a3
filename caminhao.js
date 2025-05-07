// Classe Caminhao (Herda de Veiculo)
// Depende da classe Veiculo
class Caminhao extends Veiculo {
    constructor(modelo, cor, capacidadeCarga, cargaAtual = 0, id = null) {
        super(modelo, cor, id, 'Caminhao');
        // Garante que capacidade e carga sejam números não negativos
        this.capacidadeCarga = Math.max(0, parseFloat(capacidadeCarga) || 0);
        this.cargaAtual = Math.max(0, parseFloat(cargaAtual) || 0);
    }

    // Valida o peso a ser carregado/descarregado
    _validarPeso(peso) {
         const pesoNumerico = parseFloat(peso);
         if (isNaN(pesoNumerico) || pesoNumerico <= 0) {
             exibirNotificacao('Peso inválido. Insira um número positivo.', 'error');
             return null; // Retorna null se inválido
         }
         return pesoNumerico;
    }

    carregar(peso) {
        const pesoNumerico = this._validarPeso(peso);
        if (pesoNumerico === null) return; // Sai se peso inválido

        if (this.cargaAtual + pesoNumerico <= this.capacidadeCarga) {
            this.cargaAtual += pesoNumerico;
            exibirNotificacao(`Caminhão carregado com ${pesoNumerico.toLocaleString('pt-BR')} kg. Carga atual: ${this.cargaAtual.toLocaleString('pt-BR')} kg.`, 'success');
            atualizarInfoVeiculoNoModal(this.id);
            salvarGaragem(); // Persiste mudança
        } else {
            const espacoLivre = this.capacidadeCarga - this.cargaAtual;
            exibirNotificacao(`Carga (${pesoNumerico.toLocaleString('pt-BR')}kg) excede a capacidade! Espaço livre: ${espacoLivre.toLocaleString('pt-BR')}kg.`, 'error');
        }
    }

    descarregar(peso) {
        const pesoNumerico = this._validarPeso(peso);
         if (pesoNumerico === null) return; // Sai se peso inválido

        if (this.cargaAtual >= pesoNumerico) {
            this.cargaAtual -= pesoNumerico;
            exibirNotificacao(`Caminhão descarregado em ${pesoNumerico.toLocaleString('pt-BR')} kg. Carga atual: ${this.cargaAtual.toLocaleString('pt-BR')} kg.`, 'success');
            atualizarInfoVeiculoNoModal(this.id);
            salvarGaragem(); // Persiste mudança
        } else {
            exibirNotificacao(`Não é possível descarregar ${pesoNumerico.toLocaleString('pt-BR')}kg. Carga atual é ${this.cargaAtual.toLocaleString('pt-BR')}kg.`, 'error');
        }
    }

    // Sobrescreve para adicionar info da carga
    getInfoEspecificaHTML() {
        const percentualCarga = this.capacidadeCarga > 0 ? (this.cargaAtual / this.capacidadeCarga) * 100 : 0;
        return `
            <p><strong>Capacidade:</strong> ${this.capacidadeCarga.toLocaleString('pt-BR')} kg</p>
            <p><strong>Carga Atual:</strong> ${this.cargaAtual.toLocaleString('pt-BR')} kg (${percentualCarga.toFixed(1)}%)</p>
            <!-- Opcional: Barra de progresso da carga -->
            <progress value="${this.cargaAtual}" max="${this.capacidadeCarga}" style="width: 100%; height: 15px;"></progress>
        `;
    }

    // Sobrescreve toJSON para incluir propriedades do caminhão
    toJSON() {
        const json = super.toJSON();
        json.capacidadeCarga = this.capacidadeCarga;
        json.cargaAtual = this.cargaAtual;
        return json;
    }
}