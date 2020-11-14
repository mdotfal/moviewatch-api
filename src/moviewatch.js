require( 'dotenv' ).config()
const knex = require( 'knex' )
const ItemsService = require( './items-service' );

const knexInstance = knex({
  client: 'pg',
  connection: process.env.DB_URL,
})

ItemsService.getById( knexInstance )
  .then( items => console.log( items ))
  .then( () => 
    ItemsService.insertItem( knexInstance, {
      title: 'test-title',
      isnetflix: true,
      ishulu: true,
      isprime: true,
      rating: "Watch"
    })
  )
  .then( newItem => {
    console.log( newItem )
    return ItemsService.updateItem(
      knexInstance,
      newItem.id,
      { title: 'Updated title' }
    ).then( () => ItemsService.getById( knexInstance, newItem.id ))
  })
  .then( item => {
    return ItemsService.deleteItem( knexInstance, item.id )
  })