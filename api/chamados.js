
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  try {
    // GET - lista os chamados, com filtros opcionais
    // exemplo: /api/chamados?categoria=Notas&prioridade=Alta&status=Aberto
    if (req.method === 'GET') {
      const condicoes = [];
      const valores = [];

      // só aceita filtrar por estas colunas (o nome da coluna nunca vem do usuário)
      for (const campo of ['categoria', 'prioridade', 'status']) {
        if (req.query[campo]) {
          valores.push(req.query[campo]);
          condicoes.push(`${campo} = $${valores.length}`);
        }
      }

      const where = condicoes.length > 0
        ? `WHERE ${condicoes.join(' AND ')}`
        : '';

      const { rows } = await pool.query(
        `SELECT * FROM chamados ${where} ORDER BY criado_em DESC`,
        valores
      );

      return res.status(200).json(rows);
    }

    // POST
    if (req.method === 'POST') {
      const {
        matricula,
        aluno,
        email,
        categoria,
        assunto,
        descricao,
        prioridade
      } = req.body;

      const { rows } = await pool.query(
        `INSERT INTO chamados (
          matricula,
          aluno,
          email,
          categoria,
          assunto,
          descricao,
          prioridade
        )
        VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'Média'))
        RETURNING *`,
        [matricula, aluno, email, categoria, assunto, descricao, prioridade]
      );

      return res.status(201).json(rows[0]);
    }

    // PUT
    if (req.method === 'PUT') {
      const { id } = req.query;
      const {
        matricula,
        aluno,
        email,
        categoria,
        assunto,
        descricao,
        prioridade,
        status
      } = req.body;

      const { rows } = await pool.query(
        `UPDATE chamados SET
          matricula = $1,
          aluno = $2,
          email = $3,
          categoria = $4,
          assunto = $5,
          descricao = $6,
          prioridade = $7,
          status = $8,
          resolvido_em = CASE
            WHEN $8 = 'Resolvido' THEN COALESCE(resolvido_em, NOW())
            ELSE NULL
          END
        WHERE id = $9
        RETURNING *`,
        [
          matricula,
          aluno,
          email,
          categoria,
          assunto,
          descricao,
          prioridade,
          status,
          id
        ]
      );

      if (rows.length === 0) {
        return res.status(404).json({ erro: 'Chamado não encontrado' });
      }

      return res.status(200).json(rows[0]);
    }

    // DELETE
    if (req.method === 'DELETE') {
      const { id } = req.query;

      const { rowCount } = await pool.query(
        'DELETE FROM chamados WHERE id = $1',
        [id]
      );

      if (rowCount === 0) {
        return res.status(404).json({ erro: 'Chamado não encontrado' });
      }

      return res.status(200).json({
        mensagem: 'Chamado excluído com sucesso'
      });
    }

    return res.status(405).json({ erro: 'Método não permitido' });

  } catch (erro) {
    // erros de dados enviados pelo usuário: responde 400 com mensagem clara
    if (erro.code === '23502') {
      return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios' });
    }
    if (erro.code === '23514') {
      return res.status(400).json({ erro: 'Valor inválido para categoria, prioridade ou status' });
    }
    if (erro.code === '22P02') {
      return res.status(400).json({ erro: 'Id inválido' });
    }

    console.error(erro);

    return res.status(500).json({
      erro: 'Erro no banco de dados'
    });
  }
}
