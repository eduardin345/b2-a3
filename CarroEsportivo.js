// Classe CarroEsportivo (Herda de Veiculo)
// Depende da classe Veiculo
class CarroEsportivo extends Veiculo {
    constructor(modelo, cor, turbo = false, id = null) {
        super(modelo, cor, id, 'CarroEsportivo');
        this.turbo = turbo;
    }

    ativarTurbo() {
        if (this.turbo) {
            exibirNotificacao('Turbo já está ativado!', 'warning');
            return;
        }
         if (!this.ligado) {
             exibirNotificacao('Ligue o carro esportivo antes de ativar o turbo!', 'error');
             return;
         }
        this.turbo = true;
        exibirNotificacao('🚀 Turbo ativado!', 'success');
        atualizarInfoVeiculoNoModal(this.id);
        salvarGaragem(); // Persiste mudança
    }

    desativarTurbo() {
        if (!this.turbo) {
            exibirNotificacao('Turbo já está desativado!', 'warning');
            return;
        }
        this.turbo = false;
        exibirNotificacao('Turbo desativado.', 'info');
        atualizarInfoVeiculoNoModal(this.id);
        salvarGaragem(); // Persiste mudança
    }

    // Sobrescreve para adicionar info do turbo
    getInfoEspecificaHTML() {
        return `<p><strong>Turbo:</strong> <span class="status-${this.turbo ? 'on' : 'off'}">${this.turbo ? 'Ativado' : 'Desativado'}</span></p>`;
    }

    // Sobrescreve toJSON para incluir a propriedade 'turbo'
    toJSON() {
        const json = super.toJSON(); // Pega o JSON da classe pai
        json.turbo = this.turbo;    // Adiciona a propriedade específica
        return json;
    }
}