require( 'dotenv' ).config()
const knex = require( 'knex' )
const ItemsService = require( './items/items-service' );

const knexInstance = knex({
  client: 'pg',
  connection: process.env.DB_URL,
})

ItemsService.getAllItems( knexInstance )
  .then( items => console.log( items ))
  .then( () => 
    ItemsService.insertItem( knexInstance, {
      title: 'test title',
      is_netflix: true,
      is_hulu: true,
      is_prime: false,
      rating: "Watch"
    })
  )
  .then( newItem => {
    console.log( newItem )
    return ItemsService.updateItem(
      knexInstance,
      newItem.id,
      {
        title: 'Updated title',
        is_netflix: true,
        is_hulu: true,
        is_prime: true,
        rating: "Watch"
      }
    ).then( () => ItemsService.getById( knexInstance, newItem.id ))
  })
  .then( item => {
    return ItemsService.deleteItem( knexInstance, item.id )
  })
  .catch( error => console.log( error ))