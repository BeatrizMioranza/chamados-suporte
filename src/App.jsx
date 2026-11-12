
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const API_URL = '/api/chamados';

  const formularioInicial = {
    matricula: '',
    aluno: '',
    email: '',
    categoria: 'Acesso',
    assunto: '',
    descricao: '',
    prioridade: 'Média',
    status: 'Aberto'
  };

  const [chamados, setChamados] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [editando, setEditando] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('sucesso'); // 'sucesso' ou 'erro'

  // transforma "Em andamento" em "em-andamento" e "Média" em "media" (para as classes CSS)
  function classeCss(texto) {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-');
  }

  // GET - Buscar chamados
  async function carregarChamados() {
    try {
      const resposta = await fetch(API_URL);

      if (!resposta.ok) {
        throw new Error('Erro ao buscar chamados');
      }

      const dados = await resposta.json();
      setChamados(dados);

    } catch (erro) {
      setTipoMensagem('erro');
      setMensagem(erro.message);
    }
  }

  useEffect(() => {
    carregarChamados();
  }, []);

  // Atualizar os campos do formulário
  function handleChange(e) {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value
    });
  }

  // POST e PUT - Salvar chamado
  async function handleSubmit(e) {
    e.preventDefault();
    setCarregando(true);
    setMensagem('');

    try {
      const metodo = editando ? 'PUT' : 'POST';

      const url = editando
        ? `${API_URL}?id=${editando}`
        : API_URL;

      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formulario)
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro ao salvar chamado');
      }

      setTipoMensagem('sucesso');
      setMensagem(
        editando
          ? 'Chamado atualizado com sucesso!'
          : 'Chamado cadastrado com sucesso!'
      );

      setFormulario(formularioInicial);
      setEditando(null);

      await carregarChamados();

    } catch (erro) {
      setTipoMensagem('erro');
      setMensagem(erro.message);

    } finally {
      setCarregando(false);
    }
  }

  // EDITAR - Preencher formulário
  function editarChamado(chamado) {
    setEditando(chamado.id);

    setFormulario({
      matricula: chamado.matricula,
      aluno: chamado.aluno,
      email: chamado.email,
      categoria: chamado.categoria,
      assunto: chamado.assunto,
      descricao: chamado.descricao || '',
      prioridade: chamado.prioridade,
      status: chamado.status
    });

    setMensagem('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Cancelar edição
  function cancelarEdicao() {
    setEditando(null);
    setFormulario(formularioInicial);
    setMensagem('');
  }

  // DELETE - Excluir chamado
  async function excluirChamado(id) {
    const confirmar = window.confirm(
      'Tem certeza que deseja excluir este chamado?'
    );

    if (!confirmar) return;

    try {
      const resposta = await fetch(`${API_URL}?id=${id}`, {
        method: 'DELETE'
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro ao excluir chamado');
      }

      setTipoMensagem('sucesso');
      setMensagem('Chamado excluído com sucesso!');

      if (editando === id) {
        cancelarEdicao();
      }

      await carregarChamados();

    } catch (erro) {
      setTipoMensagem('erro');
      setMensagem(erro.message);
    }
  }

  return (
    <main className="container">

      <header className="cabecalho">
        <h1>Central de Chamados</h1>
        <p>Gerencie suas solicitações em um só lugar.</p>
      </header>

      {/* FORMULÁRIO */}
      <section className="card">

        <h2>
          {editando ? 'Editar chamado' : 'Abrir novo chamado'}
        </h2>

        {mensagem && (
          <div className={`mensagem ${tipoMensagem}`}>
            {mensagem}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            <div className="campo">
              <label className="obrigatorio">Matrícula</label>
              <input
                type="text"
                name="matricula"
                value={formulario.matricula}
                onChange={handleChange}
                maxLength={20}
                required
              />
            </div>

            <div className="campo">
              <label className="obrigatorio">Nome do aluno</label>
              <input
                type="text"
                name="aluno"
                value={formulario.aluno}
                onChange={handleChange}
                required
              />
            </div>

            <div className="campo">
              <label className="obrigatorio">E-mail</label>
              <input
                type="email"
                name="email"
                value={formulario.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="campo">
              <label className="obrigatorio">Categoria</label>
              <select
                name="categoria"
                value={formulario.categoria}
                onChange={handleChange}
                required
              >
                <option value="Acesso">Acesso</option>
                <option value="Notas">Notas</option>
                <option value="Prazos">Prazos</option>
                <option value="Conteúdo">Conteúdo</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div className="campo">
              <label className="obrigatorio">Assunto</label>
              <input
                type="text"
                name="assunto"
                value={formulario.assunto}
                onChange={handleChange}
                required
              />
            </div>

            <div className="campo">
              <label>Prioridade</label>
              <select
                name="prioridade"
                value={formulario.prioridade}
                onChange={handleChange}
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>

            {/* o status só pode ser alterado na edição: chamado novo nasce sempre "Aberto" */}
            {editando && (
              <div className="campo">
                <label>Status</label>
                <select
                  name="status"
                  value={formulario.status}
                  onChange={handleChange}
                >
                  <option value="Aberto">Aberto</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Resolvido">Resolvido</option>
                </select>
              </div>
            )}

            <div className="campo campo-completo">
              <label>Descrição</label>
              <textarea
                name="descricao"
                value={formulario.descricao}
                onChange={handleChange}
                rows="4"
              />
            </div>

          </div>

          <p className="nota-obrigatorio">* Campos obrigatórios</p>

          <div className="botoes-formulario">

            <button
              type="submit"
              className="btn-principal"
              disabled={carregando}
            >
              {carregando
                ? 'Salvando...'
                : editando
                  ? 'Salvar alterações'
                  : 'Abrir chamado'}
            </button>

            {editando && (
              <button
                type="button"
                className="btn-cancelar"
                onClick={cancelarEdicao}
              >
                Cancelar edição
              </button>
            )}

          </div>

        </form>
      </section>

      {/* LISTA DE CHAMADOS */}
      <section className="card">

        <div className="titulo-lista">
          <h2>Chamados cadastrados</h2>
          <span>{chamados.length} chamados</span>
        </div>

        <button
          className="btn-atualizar"
          onClick={carregarChamados}
        >
          Atualizar lista
        </button>

        {chamados.length === 0 ? (
          <p className="vazio">
            Nenhum chamado cadastrado.
          </p>
        ) : (

          <div className="lista-chamados">

            {chamados.map((chamado) => (

              <article className="chamado" key={chamado.id}>

                <div className="chamado-topo">
                  <div>
                    <h3>{chamado.assunto}</h3>
                    <small>Chamado #{chamado.id}</small>
                  </div>

                  <div className="etiquetas">
                    <span className={`status ${classeCss(chamado.status)}`}>
                      {chamado.status}
                    </span>
                    <span className={`prioridade ${classeCss(chamado.prioridade)}`}>
                      {chamado.prioridade}
                    </span>
                  </div>
                </div>

                <div className="informacoes">
                  <p><strong>Aluno:</strong> {chamado.aluno}</p>
                  <p><strong>Matrícula:</strong> {chamado.matricula}</p>
                  <p><strong>E-mail:</strong> {chamado.email}</p>
                  <p><strong>Categoria:</strong> {chamado.categoria}</p>
                  <p><strong>Descrição:</strong> {chamado.descricao || 'Não informada'}</p>
                  <p>
                    <strong>Criado em:</strong>{' '}
                    {new Date(chamado.criado_em).toLocaleString('pt-BR')}
                  </p>
                </div>

                <div className="botoes-chamado">

                  <button
                    className="btn-editar"
                    onClick={() => editarChamado(chamado)}
                  >
                    Editar
                  </button>

                  <button
                    className="btn-excluir"
                    onClick={() => excluirChamado(chamado.id)}
                  >
                    Excluir
                  </button>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}

export default App;
