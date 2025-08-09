// Importa as dependências principais

import express from 'express';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(cors());
const PORT = 3000;

// Rota principal da API
app.get('/api/scrape', async (req, res) => {
  const keyword = req.query.keyword as string;

  // Verifica se a palavra-chave foi informada
  if (!keyword) return res.status(400).json({ error: 'Keyword is required' });

// Monta a URL da Amazon com a palavra-chave pesquisada
  const url = `https://www.amazon.com.br/s?k=${encodeURIComponent(keyword)}`;
  try {
    // Faz a requisição HTTP para a Amazon
    console.log(`Fazendo scraping da URL: ${url}`);
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Upgrade-Insecure-Requests': '1',
        'DNT': '1',
        'Referer': 'https://www.amazon.com.br/',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
      }
    });

    // Cria um DOM a partir do HTML retornado
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Seleciona todos os itens de resultado de produto na primeira página
    const items = [...document.querySelectorAll('div.s-result-item')];
    if (items.length === 0) {
      return res.status(404).json({ error: 'Nenhum produto encontrado' });
    }
    // Mapeia e extrai os dados de cada produto
    const results = items.map((item) => {
      const rawTitle = item.querySelector('h2[aria-label]')?.getAttribute('aria-label') || '';
      const title = rawTitle.replace(/^Anúncio patrocinado\s*[-–—]?\s*/i, '');
      const rating = item.querySelector('.a-icon-alt')?.textContent?.trim() || '';
      const reviews = item.querySelector('span.a-size-base')?.textContent?.trim() || '';
      const image = item.querySelector('img.s-image')?.getAttribute('src') || '';
      const relativeUrl = item.querySelector('h2 a')?.getAttribute('href') || '';
      const fullUrl = relativeUrl ? `https://www.amazon.com${relativeUrl}` : '';
      
      // Apenas retorna se houver título e imagem (validação mínima)
      if (title && image) {
        return { title, rating, reviews, image };
      }
      // Se não houver título ou imagem, retorna nulo
      return null;
    }).filter(Boolean);// Remove entradas nulas

    await new Promise(resolve => setTimeout(resolve, 3000)); // espera 3 segundos

    res.json(results);// Retorna os produtos como JSON

  } catch (error) {
    // Retorna erro em caso de falha no scraping
    console.error('Erro ao fazer scraping:', (error as Error).message);
    res.status(500).json({ error: 'Erro ao fazer scraping', message: (error as Error).message });
  }
});
// Inicia o servidor
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
