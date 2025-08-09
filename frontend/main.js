// Wait for the DOM to load before executing the code
document.addEventListener('DOMContentLoaded', () => {
  // Selects DOM elements
  const searchBtn = document.getElementById('searchBtn');
  const keywordInput = document.getElementById('keyword');
  const resultsDiv = document.getElementById('results');

  // Add event to search button
  searchBtn.addEventListener('click', async () => {
    const keyword = keywordInput.value.trim();

    // Validate user input
    if (!keyword) {
      alert('⚠️ Digite uma palavra-chave para buscar.');
      return;
    }

    //Display message while fetching data
    resultsDiv.innerHTML = '<p>🔄 Buscando produtos...</p>';

    try {
      // Request to the backend API passing the keyword
      const response = await fetch(`http://localhost:3000/api/scrape?keyword=${encodeURIComponent(keyword)}`);

      // If the response is invalid, throw an error
      if (!response.ok) {
        throw new Error('Erro na requisição à API.');
      }

      const data = await response.json();

      // If there is no data, show message
      if (!data || data.length === 0) {
        resultsDiv.innerHTML = '<p>🙁 Nenhum produto encontrado.</p>';
        return;
      }

      // Clear previous results
      resultsDiv.innerHTML = '';

      // For each product, create a visual card in HTML
      data.forEach((product) => {
        const card = document.createElement('div');
        card.classList.add('product-card');

        // Fill in the card with the product data
        card.innerHTML = `
          <img src="${product.image}" alt="${product.title}" />
          <h3>${product.title}</a></h3>
          <p>⭐ ${product.rating || 'Sem avaliação'}<br>📝 ${product.reviews || '0'} avaliações</p>
        `;

        resultsDiv.appendChild(card);
      });
    } catch (err) {
      // Show error if something fails
      console.error('Erro no frontend:', err);
      resultsDiv.innerHTML = `<p>❌ Erro ao buscar produtos: ${err.message}</p>`;
    }
  });
});
