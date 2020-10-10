const queries = require('./queries')

module.exports = app => {
  const { existsOrError } = app.api.validation

  const save = (req, res) => {
    const livro = { ...req.body }
    if(req.params.id) livro.id = req.params.id

    try {
      existsOrError(livro.nome, 'Nome não informado')
      existsOrError(livro.descricao, 'Descrição não informado')
      existsOrError(livro.generold, 'Genero não informado')
      existsOrError(livro.usuariold, 'Autor não informado')
      existsOrError(livro.conteudo, 'Consteúdo não informado')
    } catch(msg) {
      res.status(400).send(msg)
    }

    if(livro.id) {
      app.db('livros')
        .update(livro)
        .where({ id: livro.id })
        .then(_ => res.status(204).send())
        .catch(err => res.status(500).send(err))
    } else {
      app.db('livros')
        .insert(livro)
        .then(_ => res.status(204).send())
        .catch(err => res.status(500).send(err))
      }
  }

  const remove = async (req, res) => {
    try {
      const rowsDeleted = await app.db('livros').where({ id: req.params.id }).del()
      try {
        existsOrError(rowsDeleted, 'Livro não foi encontrado')
      } catch(msg) {
        return res.status(400).send(msg)
      }
      res.status(204).send()
    } catch(msg) {
      res.status(500).send(msg)
    }
  }

  const limit = 10

  const get = async (req, res) => {
    const page = req.query.page || 1

    const result = await app.db('livros').count('id').first()

    const count = parseInt(result.count)

    app.db('livros')
      .select('id', 'nome', 'descricao')
      .limit(limit).offset(page * limit - limit)
      .then(livros => res.json({ data: livros, count, limit }))
      .catch(err => res.status(500).send(err))
  }

  const getById = (req, res) => {
    app.db('livros')
      .where({ id: req.params.id })
      .first()
      .then(livro => {
        livro.conteudo = livro.conteudo.toString()
        return res.json(livro)
      })
      .catch(err => res.status(500).send(err))
  }

  const getByGenero = async (req, res) => {
    const generold = req.params.id
    const page = req.query.page || 1
    const generos = await app.db.raw(queries.generoWithChildren, generold)
    const ids = generos.rows.map(c => c.id)

    app.db({a: 'livros', u: 'users'})
      .select('a.id', 'a.nome', 'a.descricao', 'a.imageUrl', { author: 'u.name' })
      .limit(limit).offset(page * limit - limit)
      .whereRaw('?? = ??', ['u.id', 'a.usuariold'])
      .whereIn('generold', ids)
      .orderBy('a.id', 'desc')
      .then(livros => res.json(livros))
      .catch(err => res.status(500).sen(err))
  }

  return { save, remove, get, getById, getByGenero }
}