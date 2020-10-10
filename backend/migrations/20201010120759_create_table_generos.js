exports.up = function(knex, Promise) {
  return knex.schema.createTable('generos', table => {
    table.increments('id').primary()
    table.string('nome').notNull()
    table.integer('relacaold').references('id').inTable('generos')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('generos')
};
