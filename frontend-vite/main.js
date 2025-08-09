// Aguarda o carregamento do DOM antes de executar o código
document.addEventListener('DOMContentLoaded', () => {
  // Seleciona os elementos do DOM
  const searchBtn = document.getElementById('searchBtn');
  const keywordInput = document.getElementById('keyword');
  const resultsDiv = document.getElementById('results');

  // Adiciona evento ao botão de busca
  searchBtn.addEventListener('click', async () => {
    const keyword = keywordInput.value.trim();

    // Valida a entrada do usuário
    if (!keyword) {
      alert('⚠️ Digite uma palavra-chave para buscar.');
      return;
    }

    // Mostra mensagem enquanto busca os dados
    resultsDiv.innerHTML = '<p>🔄 Buscando produtos...</p>';

    try {
      // Requisição para a API backend passando a palavra-chave
      const response = await fetch(`http://localhost:3000/api/scrape?keyword=${encodeURIComponent(keyword)}`);

      // Se a resposta for inválida, lança erro
      if (!response.ok) {
        throw new Error('Erro na requisição à API.');
      }

      const data = await response.json();

      // Se não houver dados, mostra mensagem
      if (!data || data.length === 0) {
        resultsDiv.innerHTML = '<p>🙁 Nenhum produto encontrado.</p>';
        return;
      }

      // Limpa resultados anteriores
      resultsDiv.innerHTML = '';

      // Para cada produto, cria um cartão visual no HTML
      data.forEach((product) => {
        const card = document.createElement('div');
        card.classList.add('product-card');

        // Preenche o cartão com os dados do produto
        card.innerHTML = `
          <img src="${product.image}" alt="${product.title}" />
          <h3>${product.title}</a></h3>
          <p>⭐ ${product.rating || 'Sem avaliação'}<br>📝 ${product.reviews || '0'} avaliações</p>
        `;

        resultsDiv.appendChild(card);
      });
    } catch (err) {
      // Mostra erro amigável se algo falhar
      console.error('Erro no frontend:', err);
      resultsDiv.innerHTML = `<p>❌ Erro ao buscar produtos: ${err.message}</p>`;
    }
  });
});
