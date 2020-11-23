const ItemsService = {

  getAllItems( knex ) {
    return knex
      .select( '*' )
      .from( 'moviewatch_items' );
  },
  insertItem( knex, newItem ) {
    return knex
      .insert( newItem )
      .into( 'moviewatch_items' )
      .returning( '*' )
      .then( rows => {
        return rows[ 0 ]
      });
  },
  getById( knex, id ) {
    return knex
      .select( '*' )
      .from( 'moviewatch_items' )
      .where( 'id', id )
      .first();
  },
  deleteItem( knex, id ) {
    return knex( 'moviewatch_items' )
      .where( { id } )
      .delete();
  },
  updateItem( knex, id, newItemFields ) {
    return knex( 'moviewatch_items' )
      .where( { id } )
      .update( newItemFields );
  }
};

module.exports = ItemsService;