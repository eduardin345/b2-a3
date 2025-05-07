// --- Classe Manutencao ---
class Manutencao {
    constructor(data, tipo, custo, descricao = '') {
        // Armazena a data como objeto Date internamente
        this.data = data instanceof Date ? data : new Date(data);
        // Garante que mesmo uma data inválida seja armazenada como Invalid Date
        if (isNaN(this.data.getTime())) {
            console.warn("Data fornecida resultou em data inválida:", data);
            // this.data = null; // Ou mantém como Invalid Date
        }
        this.tipo = tipo.trim();
        this.custo = parseFloat(custo) || 0; // Garante que custo seja número, 0 se inválido
        this.descricao = descricao.trim();
        // ID único mais robusto
        this.id = `man-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
    }

    validar() {
        const erros = [];
        // Verifica se a data é um objeto Date válido
        if (!(this.data instanceof Date) || isNaN(this.data.getTime())) {
            erros.push("Data inválida.");
        }
        if (!this.tipo) { // Verifica se tipo não é vazio após trim
            erros.push("Tipo de serviço é obrigatório.");
        }
        // Custo pode ser zero (ex: serviço na garantia), mas não negativo
        if (this.custo < 0) {
            erros.push("Custo não pode ser negativo.");
        }
        return erros; // Retorna array de erros (vazio se válido)
    }

    formatar(incluirVeiculo = false, nomeVeiculo = '') {
        let dataFormatada = "Data inválida";
        if (this.data instanceof Date && !isNaN(this.data.getTime())) {
             dataFormatada = this.data.toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        }

        const custoFormatado = this.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        let str = `<strong>${this.tipo}</strong> em ${dataFormatada} - ${custoFormatado}`;
        if (this.descricao) {
            str += ` <em>(${this.descricao})</em>`;
        }
         if (incluirVeiculo && nomeVeiculo) {
            str += ` - [Veículo: ${nomeVeiculo}]`;
        }
        return str;
    }

    // Método para serialização em JSON (salva data como ISO string)
    toJSON() {
        return {
            // Salva a data como string ISO 8601 se for válida, senão null
            data: (this.data instanceof Date && !isNaN(this.data.getTime())) ? this.data.toISOString() : null,
            tipo: this.tipo,
            custo: this.custo,
            descricao: this.descricao,
            id: this.id // Inclui o ID na serialização
        };
    }
}