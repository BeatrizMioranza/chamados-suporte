# Central de Chamados

Aplicação web para abrir e acompanhar chamados de suporte de alunos, com as operações de CRUD executadas no back-end em um banco de dados relacional.

- **Aplicação:** https://chamados-suporte-tau.vercel.app
- **Autora:** Beatriz Mioranza

## Tecnologias

- **Front-end:** React + Vite
- **Back-end:** Node.js (função do Vercel em `api/chamados.js`)
- **Banco de dados:** PostgreSQL (Supabase), acessado com a biblioteca `pg`
- **Hospedagem:** Vercel, com deploy automático a cada push

## API (CRUD)

| Ação | Rota | SQL |
|---|---|---|
| Listar e filtrar | `GET /api/chamados?categoria=&prioridade=&status=` | `SELECT ... WHERE ... ORDER BY criado_em DESC` |
| Criar | `POST /api/chamados` | `INSERT INTO chamados ... RETURNING *` |
| Atualizar | `PUT /api/chamados?id=1` | `UPDATE chamados SET ... WHERE id = $n` |
| Excluir | `DELETE /api/chamados?id=1` | `DELETE FROM chamados WHERE id = $1` |

As consultas usam parâmetros (`$1`, `$2`, ...) para evitar SQL injection. Chamados novos são criados com status Aberto, e dados inválidos retornam erro 400 com uma mensagem explicativa.

## Como rodar localmente

1. `npm install`
2. Crie um arquivo `.env` na raiz com `DATABASE_URL=` e a conexão do banco (Transaction pooler do Supabase).
3. Em um terminal, rode `npm run dev:api` (API na porta 3001).
4. Em outro terminal, rode `npm run dev` e acesse http://localhost:5173.

## Declaração de uso de Inteligência Artificial

Utilizei o assistente **Claude (Anthropic)** como apoio neste trabalho:

- **Esclarecimento de dúvidas pontuais** durante o desenvolvimento e **suporte técnico na configuração do ambiente**: ajuste da conexão com o banco e criação de um servidor de teste local, devido a uma limitação do Windows para executar o `vercel dev`.
- **Geração de partes do código:** estilos da interface (CSS), filtros por categoria, prioridade e status (consulta com WHERE), tratamento de erros de validação na API, ajustes no formulário e o arquivo README.
- **Testes:** conferência das operações de CRUD na versão local e na publicada.

Todo o código sugerido foi lido, testado e revisado por mim antes de ser incorporado ao projeto, e assumo integral responsabilidade pelo conteúdo entregue.
