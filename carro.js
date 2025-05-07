// Classe Carro (Herda de Veiculo)
// Depende da classe Veiculo
class Carro extends Veiculo {
    constructor(modelo, cor, id = null) {
        super(modelo, cor, id, 'Carro'); // Passa o tipoVeiculo específico
    }
    // Não precisa sobrescrever getInfoEspecificaHTML se não houver info extra
    // O toJSON da classe pai (Veiculo) é suficiente se não houver props extras
}