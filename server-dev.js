// Servidor só para testar a pasta api/ no computador (substitui o "vercel dev").
// No Vercel ele não é usado: lá a pasta api/ vira função automaticamente.
// Rodar com: npm run dev:api
import http from 'node:http';
import handler from './api/chamados.js';

const PORTA = 3001;

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORTA}`);
    if (url.pathname !== '/api/chamados') {
      res.writeHead(404).end('Rota não encontrada');
      return;
    }

    // lê o corpo da requisição (POST e PUT mandam JSON)
    let corpo = '';
    for await (const parte of req) corpo += parte;

    // deixa req e res iguais aos do Vercel: req.query, req.body, res.status(), res.json()
    req.query = Object.fromEntries(url.searchParams);
    try {
      req.body = corpo ? JSON.parse(corpo) : {};
    } catch {
      req.body = {};
    }
    res.status = (codigo) => {
      res.statusCode = codigo;
      return res;
    };
    res.json = (dados) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(dados));
      return res;
    };

    await handler(req, res);
  })
  .listen(PORTA, () => console.log(`API local em http://localhost:${PORTA}/api/chamados`));
