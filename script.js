// Aguarda o carregamento completo do DOM antes de executar o script
document.addEventListener('DOMContentLoaded', () => {

    // Seleciona os elementos da página com os quais vamos interagir
    const csvFileInput = document.getElementById('csvFile');
    const templateTextarea = document.getElementById('template');
    const generateButton = document.getElementById('generateBtn');
    const printButton = document.getElementById('printBtn');
    const labelsContainer = document.getElementById('labels-container');

    // Adiciona um ouvinte de evento ao botão "Gerar Etiquetas"
    generateButton.addEventListener('click', () => {
        const file = csvFileInput.files[0];
        const template = templateTextarea.value;

        // Validações essenciais
        if (!file) {
            alert('Por favor, carregue um arquivo CSV.');
            return;
        }
        if (template.trim() === '') {
            alert('Por favor, defina um modelo para a etiqueta.');
            return;
        }

        // Usa a biblioteca PapaParse para processar o arquivo CSV
        Papa.parse(file, {
            header: true, // Trata a primeira linha como cabeçalho
            skipEmptyLines: true, // Pula linhas vazias
            transformHeader: header => header.trim(), // Limpa espaços dos nomes das colunas
            // SOLUÇÃO PARA CARACTERES ESPECIAIS:
            // Força o programa a ler o arquivo com a codificação correta para acentos.
            encoding: "ISO-8859-1",
            complete: (results) => {
                generateLabels(results.data, template);
            },
            error: (error) => {
                console.error('Erro ao processar o arquivo CSV:', error);
                alert('Ocorreu um erro ao ler o arquivo CSV. Verifique o console para mais detalhes.');
            }
        });
    });

    // Adiciona um ouvinte de evento ao botão "Imprimir"
    printButton.addEventListener('click', () => {
        if (labelsContainer.children.length > 0 && !labelsContainer.querySelector('.placeholder-text')) {
            window.print();
        } else {
            alert('Gere as etiquetas antes de tentar imprimir.');
        }
    });

    /**
     * Função principal para gerar as etiquetas com base nos dados e no modelo.
     * @param {Array<Object>} data - Array de objetos, onde cada objeto representa uma linha da planilha.
     * @param {string} template - O modelo de texto fornecido pelo usuário.
     */
    function generateLabels(data, template) {
        labelsContainer.innerHTML = ''; // Limpa o conteúdo anterior

        if (!data || data.length === 0) {
            labelsContainer.innerHTML = '<p class="placeholder-text">Nenhum dado encontrado no arquivo.</p>';
            return;
        }

        // Encontra a chave do paciente de forma dinâmica para maior robustez
        const patientKey = Object.keys(data[0] || {}).find(k => k.toLowerCase().includes('paciente')) || 'NOME DO PACIENTE';
        
        const validData = data.filter(row => row[patientKey] && row[patientKey].trim() !== '');

        if (validData.length === 0) {
            labelsContainer.innerHTML = '<p class="placeholder-text">Nenhum dado de paciente válido foi encontrado. Verifique se seu arquivo CSV está limpo e possui uma coluna para o nome do paciente.</p>';
            return;
        }
        
        // Itera sobre cada linha de dados válida
        validData.forEach(row => {
            let labelContent = template;

            // Itera sobre cada coluna da linha de dados
            for (const key in row) {
                const placeholder = `{${key}}`;
                const value = row[key] || '';
                labelContent = labelContent.split(placeholder).join(value);
            }

            // Cria o elemento da etiqueta e o adiciona na tela
            const labelElement = document.createElement('div');
            labelElement.className = 'label';
            labelElement.textContent = labelContent;
            labelsContainer.appendChild(labelElement);
        });
    }
});
