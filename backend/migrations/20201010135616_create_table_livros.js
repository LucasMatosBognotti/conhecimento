exports.up = function(knex, Promise) {
  return knex.schema.createTable('livros', table => {
    table.increments('id').primary()
    table.string('nome').notNull()
    table.string('descricao', 1000).notNull()
    table.string('imageUrl', 1000)
    table.binary('conteudo').notNull()
    table.integer('usuariold').references('id').inTable('users').notNull()
    table.integer('generold').references('id').inTable('generos').notNull()
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('livros')
};
