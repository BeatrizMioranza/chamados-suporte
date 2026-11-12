import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM chamados ORDER BY criado_em DESC');
      return res.status(200).json(rows);
    }

    return res.status(405).json({ erro: 'Método não permitido' });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro no banco de dados' });
  }
}