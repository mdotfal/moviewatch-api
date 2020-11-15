const ItemsService = require( '../src/items/items-service' );
const knex = require( 'knex' );

describe( `Items service object` , () => {
  let db

  let testItems = [
    {
      id: 1,
      title: 'test-title',
      is_netflix: true,
      is_hulu: true,
      is_prime: true,
      rating: "Watch"
    },
    {
      id: 2,
      title: 'test-title-2',
      is_netflix: true,
      is_hulu: true,
      is_prime: false,
      rating: "Watch"
    },
    {
      id: 3,
      title: 'test-title-3',
      is_netflix: true,
      is_hulu: false,
      is_prime: false,
      rating: "Skip"
    },
  ]

  
  before( () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
  })

  before( () => db( 'moviewatch_items' ).truncate() )

  afterEach( () => db( 'moviewatch_items' ).truncate() )

  after( () => db.destroy() )
  
  context( `Given 'moviewatch_items' has data`, () => {
    beforeEach( () => {
      return db
        .into( 'moviewatch_items' )
        .insert( testItems )
    })

    it( `getAllItems() resolves all items from 'moviewatch_items' table`, () => {
      return ItemsService.getAllItems( db )
        .then( actual => {
          expect( actual ).to.eql( testItems.map( item => ({
            ...item,
          })))
        })
    })

    it( `getById() resolves an item by id from 'moviewatch_items table'`, () => {
      const thirdId = 3
      const thirdTestItem = testItems[ thirdId - 1 ]
      return ItemsService.getById( db, thirdId )
        .then( actual => {
          expect( actual ).to.eql({
            id: thirdId,
            title: thirdTestItem.title,
            is_hulu: thirdTestItem.is_hulu,
            is_netflix: thirdTestItem.is_netflix,
            is_prime: thirdTestItem.is_prime,
            rating: thirdTestItem.rating
          })
        })
    })

    it( `deleteItem() removes an item by id from 'moviewatch_items' table`, () => {
      const itemId = 3
      return ItemsService.deleteItem( db, itemId )
        .then( () => ItemsService.getAllItems( db ))
        .then( allItems => {
          const expected = testItems.filter( item => item.id !== itemId )
          expect( allItems ).to.eql( expected )
        })
    })

    it( `updateItem() updates an item from the 'moviewatch_items' table`, () => {
      const idOfItemToUpdate = 3
      const newItemData = {
        title: 'updated-title',
        is_netflix: true,
        is_hulu: true,
        is_prime: true,
        rating: "Watch"
      }
      return ItemsService.updateItem( db, idOfItemToUpdate, newItemData )
        .then( () => ItemsService.getById( db, idOfItemToUpdate ))
        .then( item => {
          expect( item ).to.eql({
            id: idOfItemToUpdate,
            ...newItemData,
          })
        })
    })

  })

  context( `Given 'moviewatch_items' has no data`, () => {
    it( `getAllItems() resolves an empty array`, () => {
      return ItemsService.getAllItems( db )
        .then( actual => {
          expect( actual ).to.eql( [] )
        })
    })

    it( `insertItem() inserts a new item and resolves the new item with an 'id'`, () => {
      const newItem = {
          title: 'test-title',
          is_netflix: true,
          is_hulu: true,
          is_prime: true,
          rating: "Watch"
      }
      return ItemsService.insertItem( db, newItem )
        .then( actual => {
          expect( actual ).to.eql({
            id: 1,
            title: newItem.title,
            is_netflix: newItem.is_netflix,
            is_hulu: newItem.is_hulu,
            is_prime: newItem.is_prime,
            rating: newItem.rating
          })
        })
    })

  })

})