# 🚗 Garagem Inteligente Unificada 🔧

## Visão Geral

A Garagem Inteligente Unificada é uma aplicação web front-end que simula o gerenciamento de uma garagem de veículos. Desenvolvida com HTML, CSS e JavaScript puro, com forte ênfase em **Programação Orientada a Objetos (OOP)**, esta aplicação permite adicionar diferentes tipos de veículos (Carros, Carros Esportivos, Caminhões), interagir com eles (ligar, desligar, acelerar, buzinar, ações específicas como ativar turbo ou carregar/descarregar carga) e gerenciar um histórico de manutenções para cada veículo.

O projeto demonstra conceitos fundamentais como **Herança**, **Polimorfismo**, **Encapsulamento**, manipulação do **DOM**, gerenciamento de **Eventos**, persistência de dados no navegador usando **LocalStorage** e uma estrutura de código modularizada em arquivos JavaScript separados.

**Este projeto foi desenvolvido como parte de um exercício prático para solidificar e demonstrar o domínio sobre esses conceitos de desenvolvimento web e OOP.**

---

## ✨ Funcionalidades Principais

*   **Adição Dinâmica de Veículos:** Permite adicionar Carros, Carros Esportivos e Caminhões à garagem através de um formulário.
*   **Listagem de Veículos:** Exibe todos os veículos presentes na garagem.
*   **Persistência de Dados:** Salva o estado completo da garagem (veículos e seus históricos) no **LocalStorage** do navegador, permitindo que os dados persistam entre sessões.
*   **Modal de Detalhes Interativo:** Ao clicar em "Detalhes / Manutenção", um modal exibe:
    *   Informações completas do veículo (usando polimorfismo para mostrar dados específicos de cada tipo).
    *   Botões de ação contextualizados (ligar/desligar, acelerar, buzinar, ativar/desativar turbo, carregar/descarregar).
    *   Histórico de manutenções passadas e agendamentos futuros do veículo selecionado.
    *   Formulário para registrar novas manutenções ou agendar futuras.
*   **Gerenciamento de Manutenções:**
    *   Adição de registros de manutenção com data, tipo, custo e descrição.
    *   Utiliza um datepicker (Flatpickr) para facilitar a seleção de data e hora.
    *   Validação dos dados de manutenção.
    *   Remoção de registros de manutenção individuais (histórico ou agendamentos).
*   **Agendamentos Futuros:** Exibe uma lista separada na tela principal com todos os agendamentos futuros de todos os veículos, ordenados por data.
*   **Notificações ao Usuário:** Feedback visual para ações realizadas (ligar/desligar, adicionar veículo, erros, etc.) através de notificações flutuantes.
*   **Lembretes de Agendamento:** Notifica o usuário sobre agendamentos próximos (ex: nas próximas 48h) ao carregar a aplicação.
*   **Estrutura Orientada a Objetos:**
    *   Classe base `Veiculo` com propriedades e métodos comuns.
    *   Classes filhas (`Carro`, `CarroEsportivo`, `Caminhao`) que herdam de `Veiculo` e adicionam/sobrescrevem funcionalidades.
    *   Classe `Manutencao` para representar os registros de serviço.
    *   Uso de `instanceof` para comportamento polimórfico na interface.
*   **Código Modularizado:** Classes separadas em arquivos `.js` distintos (`Veiculo.js`, `Carro.js`, etc.) para melhor organização e manutenção.

---

## 🚀 Demo Ao Vivo

Experimente a Garagem Inteligente Unificada em funcionamento:

**[LINK_DA_SUA_APLICACAO_NA_NUVEM]**

*(Substitua o texto acima pelo link da sua aplicação hospedada na Vercel, Netlify, Render, GitHub Pages, etc.)*

---

## 📸 Screenshots

*(Substitua as URLs abaixo pelas URLs das suas imagens. Faça upload delas para o seu repositório ou use um serviço como Imgur)*

**Tela Principal:**
![Screenshot Principal da Garagem]([URL_DA_IMAGEM_PRINCIPAL])
*Visão geral da garagem com a lista de veículos e agendamentos.*

**Modal de Detalhes (Exemplo Carro Esportivo):**
![Screenshot do Modal de Detalhes]([URL_DA_IMAGEM_MODAL_ESPORTIVO])
*Modal exibindo informações, ações (incluindo turbo), histórico e formulário de manutenção.*

**Modal de Detalhes (Exemplo Caminhão):**
![Screenshot do Modal de Detalhes Caminhão]([URL_DA_IMAGEM_MODAL_CAMINHAO])
*Modal exibindo informações e controles de carga específicos do caminhão.*

---

## 🛠️ Tecnologias Utilizadas

*   **HTML5:** Estruturação do conteúdo da página.
*   **CSS3:** Estilização da interface do usuário, incluindo layout responsivo básico e animações sutis.
*   **JavaScript (ES6+):** Lógica principal da aplicação, manipulação do DOM, eventos e implementação da Programação Orientada a Objetos (Classes, Herança, etc.).
*   **LocalStorage API:** Armazenamento de dados da garagem no navegador do usuário.
*   **Flatpickr:** Biblioteca JavaScript para o seletor de data e hora no formulário de manutenção.
*   **JSDoc:** Formato utilizado para a documentação do código JavaScript.

---

## 📂 Estrutura do Projeto
Use code with caution.
Markdown
garagem-inteligente-unificada/
│
├── index.html # Arquivo principal da aplicação (estrutura HTML)
├── style.css # Folha de estilos principal
├── Manutencao.js # Classe Manutencao (definição e métodos)
├── Veiculo.js # Classe base Veiculo (definição e métodos comuns)
├── Carro.js # Classe Carro (herda de Veiculo)
├── CarroEsportivo.js # Classe CarroEsportivo (herda de Veiculo)
├── Caminhao.js # Classe Caminhao (herda de Veiculo)
├── script.js # Script principal (gerenciamento da garagem, UI, eventos, LocalStorage)
├── README.md # Este arquivo
└── img/ # Pasta (opcional) para imagens usadas no HTML/CSS
├── images.jpg # Exemplo de imagem de carro
└── ... # Outras imagens
*   **`index.html`**: Contém toda a estrutura visual da página única, incluindo formulários, listas e o modal.
*   **`style.css`**: Define a aparência e o layout de todos os elementos da aplicação.
*   **Arquivos `.js` das Classes**: Cada arquivo contém a definição de uma classe específica (`Manutencao`, `Veiculo`, `Carro`, `CarroEsportivo`, `Caminhao`), promovendo modularidade.
*   **`script.js`**: Orquestra a aplicação, interligando as classes com a interface, gerenciando o estado da garagem (array `garagem`), tratando eventos de usuário, e cuidando da persistência com o LocalStorage.

---

## ⚙️ Como Executar Localmente

Não são necessárias ferramentas de build complexas para executar este projeto.

1.  **Clone o repositório:**
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO_GITHUB]
    cd garagem-inteligente-unificada
    ```
    *(Substitua `[URL_DO_SEU_REPOSITORIO_GITHUB]` pela URL do seu repo)*

2.  **Abra o arquivo `index.html`:**
    *   Navegue até a pasta do projeto no seu explorador de arquivos.
    *   Dê um duplo clique no arquivo `index.html` para abri-lo no seu navegador padrão.

Pronto! A aplicação deverá carregar e estar pronta para uso.

---

## 📖 Como Usar

1.  **Adicionar Veículo:**
    *   Selecione o tipo de veículo no menu dropdown ("Carro", "Carro Esportivo", "Caminhão").
    *   Preencha o Modelo e a Cor.
    *   Se for um Caminhão, o campo "Capacidade de Carga" aparecerá; preencha-o com um valor numérico (kg).
    *   Clique em "Adicionar à Garagem". O veículo aparecerá na lista "Garagem".
2.  **Ver Detalhes / Manutenção:**
    *   Na lista "Garagem", clique no botão "Detalhes / Manutenção" do veículo desejado.
    *   O modal será aberto, exibindo informações detalhadas, histórico/agendamentos e ações disponíveis.
3.  **Interagir com o Veículo (no Modal):**
    *   Use os botões de ação (Ligar/Desligar, Acelerar, Buzinar, Ativar/Desativar Turbo, Carregar/Descarregar) para interagir com o veículo selecionado. O estado do veículo será atualizado no modal e salvo.
4.  **Gerenciar Manutenções (no Modal):**
    *   **Visualizar:** Veja o histórico passado e os agendamentos futuros na seção correspondente.
    *   **Adicionar/Agendar:** Preencha o formulário na parte inferior do modal (Data/Hora, Tipo, Custo, Descrição) e clique em "Salvar Manutenção".
    *   **Remover/Cancelar:** Clique no botão "Remover" (para histórico) ou "Cancelar" (para agendamentos) ao lado do registro que deseja excluir. Confirme a ação.
5.  **Agendamentos Futuros:** A lista na tela principal mostra um resumo de todos os agendamentos futuros de todos os veículos.
6.  **Persistência:** Todos os veículos e seus históricos são salvos automaticamente no LocalStorage. Ao fechar e reabrir o navegador, a garagem estará como você a deixou.

---

## 💡 Conceitos Chave Implementados

Este projeto serve como uma demonstração prática dos seguintes conceitos:

*   **Programação Orientada a Objetos (OOP):**
    *   **Classes:** Definição de `Veiculo`, `Carro`, `CarroEsportivo`, `Caminhao`, `Manutencao` como modelos para os objetos.
    *   **Herança:** `Carro`, `CarroEsportivo` e `Caminhao` herdam propriedades e métodos da classe base `Veiculo`, reutilizando código.
    *   **Polimorfismo:** Métodos como `getInfoEspecificaHTML` e `toJSON` são sobrescritos nas classes filhas para fornecer comportamento específico, enquanto a interface (ex: `atualizarInfoVeiculoNoModal`) pode tratar diferentes tipos de veículos de forma unificada.
    *   **Encapsulamento:** As propriedades e a lógica interna de cada veículo/manutenção são gerenciadas dentro de suas respectivas classes.
*   **Manipulação do DOM:** Uso extensivo de `document.getElementById`, `document.createElement`, `element.innerHTML`, `element.appendChild`, `element.classList`, etc., para criar, modificar e remover elementos HTML dinamicamente, atualizando a interface do usuário.
*   **Gerenciamento de Eventos:** Utilização de `addEventListener` e atributos `onclick` para responder a interações do usuário (cliques em botões, envio de formulários, mudanças em selects).
*   **LocalStorage:** Persistência de dados no lado do cliente, salvando o estado da `garagem` como uma string JSON e carregando-a de volta ao iniciar a aplicação.
*   **JSON (Serialização/Desserialização):** Conversão dos objetos complexos da garagem (`Veiculo` e `Manutencao` aninhados) para strings JSON (`JSON.stringify` com métodos `toJSON` customizados) para salvar no LocalStorage, e o processo inverso (`JSON.parse` e o método estático `Veiculo.fromJSON`) para recriar as instâncias das classes ao carregar.
*   **Modularidade:** Separação do código JavaScript em arquivos distintos por classe/funcionalidade, melhorando a organização e a legibilidade.
*   **Manipulação de Datas:** Uso de objetos `Date` para armazenar e formatar datas de manutenção, incluindo a utilização da biblioteca Flatpickr para uma melhor experiência do usuário na seleção de datas/horas.
*   **Validação de Formulários:** Verificações básicas nos formulários antes de criar objetos ou executar ações.
*   **Feedback ao Usuário:** Uso de notificações visuais para informar o usuário sobre o sucesso ou falha das operações.

---

## 🔮 Melhorias Futuras (Sugestões)

*   Adicionar mais tipos de veículos (Moto, Ônibus, etc.).
*   Detalhes mais avançados de manutenção (peças trocadas, quilometragem).
*   Funcionalidade de busca e filtro na lista de veículos.
*   Testes unitários para as classes e funções.
*   Melhor tratamento de erros e validações mais robustas.
*   Interface do usuário mais elaborada e responsiva.
*   Possibilidade de editar informações de um veículo existente.
*   Considerar um backend para persistência mais robusta e compartilhamento de dados (em vez de LocalStorage).
*   Implementar paginação se a lista de veículos/manutenções ficar muito grande.

---

## 📜 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo `LICENSE` (se existir) para mais detalhes.

*(Você pode escolher outra licença se preferir. MIT é uma escolha comum para projetos didáticos)*
*Exemplo:*
Copyright (c) [ANO] [SEU_NOME]

---

## 👋 Contato (Opcional)

*   **Nome:** [SEU_NOME]
*   **GitHub:** [https://github.com/SEU_USUARIO_GITHUB]
*   **Email:** [SEU_EMAIL@EXEMPLO.COM]