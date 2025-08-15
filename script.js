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

        // Validações básicas
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
            complete: (results) => {
                // Função chamada quando o parsing é concluído com sucesso
                console.log("Colunas encontradas:", results.meta.fields);
                console.log("Dados brutos:", results.data);
                generateLabels(results.data, template);
            },
            error: (error) => {
                // Função chamada em caso de erro no parsing
                console.error('Erro ao processar o arquivo CSV:', error);
                alert('Ocorreu um erro ao ler o arquivo CSV. Verifique o console para mais detalhes.');
            }
        });
    });

    // Adiciona um ouvinte de evento ao botão "Imprimir"
    printButton.addEventListener('click', () => {
        if (labelsContainer.children.length > 0) {
            window.print();
        } else {
            alert('Gere as etiquetas antes de tentar imprimir.');
        }
    });

    /**
     * Função para gerar as etiquetas com base nos dados e no modelo.
     * @param {Array<Object>} data - Array de objetos, onde cada objeto representa uma linha da planilha.
     * @param {string} template - O modelo de texto fornecido pelo usuário.
     */
    function generateLabels(data, template) {
        labelsContainer.innerHTML = '';

        // Filtra os dados para usar apenas linhas que realmente têm um paciente.
        const validData = data.filter(row => row['NOME DO PACIENTE'] && row['NOME DO PACIENTE'].trim() !== '');

        if (validData.length === 0) {
            labelsContainer.innerHTML = '<p>Nenhum dado de paciente válido foi encontrado. Verifique se o arquivo CSV está limpo e se a coluna se chama exatamente "NOME DO PACIENTE".</p>';
            return;
        }
        
        // Itera sobre cada linha de dados VÁLIDA da planilha
        validData.forEach(row => {
            let labelContent = template;

            // Para cada coluna na linha, substitui o placeholder no modelo
            for (const key in row) {
                const cleanKey = key.trim();
                const placeholder = `{${cleanKey}}`;
                const value = row[key];
                
                // CORREÇÃO: Usando split e join para uma substituição de texto segura.
                // Este método não se confunde com caracteres especiais como a barra '/'
                // e substitui todas as ocorrências do placeholder.
                labelContent = labelContent.split(placeholder).join(value);
            }

            const labelElement = document.createElement('div');
            labelElement.className = 'label';
            labelElement.textContent = labelContent;
            labelsContainer.appendChild(labelElement);
        });
    }
});
