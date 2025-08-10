// Import the main dependencies

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

// Main API route
app.get('/api/scrape', async (req, res) => {
  const keyword = req.query.keyword as string;

// Check if the keyword was entered
  if (!keyword) return res.status(400).json({ error: 'Keyword is required' });

// Builds the Amazon URL with the searched keyword
  const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;
  try {
   // Makes the HTTP request to Amazon
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
        'Referer': 'https://www.amazon.com/',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
      }
    });

    // Create a DOM from the returned HTML
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Select all product result items on the first page
    const items = [...document.querySelectorAll('div.s-result-item')];
    if (items.length === 0) {
      return res.status(404).json({ error: 'No products found' });
    }
    // Maps and extracts data for each product
    const results = items.map((item) => {
      const rawTitle = item.querySelector('h2[aria-label]')?.getAttribute('aria-label') || '';
      const title = rawTitle.replace(/^Anúncio patrocinado\s*[-–—]?\s*/i, '');
      const rating = item.querySelector('.a-icon-alt')?.textContent?.trim() || '';
      const reviews = item.querySelector('span.a-size-base')?.textContent?.trim() || '';
      const image = item.querySelector('img.s-image')?.getAttribute('src') || '';
      const relativeUrl = item.querySelector('h2 a')?.getAttribute('href') || '';
      const fullUrl = relativeUrl ? `https://www.amazon.com${relativeUrl}` : '';
      
      // Only returns if there is a title and image (minimal validation)
      if (title && image) {
        return { title, rating, reviews, image };
      }
      // If there is no title or image, returns null
      return null;
    }).filter(Boolean);// Remove null entries

    await new Promise(resolve => setTimeout(resolve, 3000)); // wait 3 seconds

    res.json(results);// Returns products as JSON

  } catch (error) {
    // Returns error if scraping fails
    console.error('Error while scraping:', (error as Error).message);
    res.status(500).json({ error: 'Error while scraping', message: (error as Error).message });
  }
});
// Start the server
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
