const { expect } = require( 'chai' )
const knex = require( 'knex' )
const supertest = require('supertest')
const app = require( '../src/app' )
const { makeItemsArray } = require( './items.fixtures' )

describe( `Items Endpoints`, () => {
  let db

  before( 'make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set( 'db', db )
  })

  after( `disconnect from db`, () => db.destroy() )

  before( `clean the table`, () => db( 'moviewatch_items' ).truncate() )

  afterEach( `cleanup`, () => db( 'moviewatch_items' ).truncate() )


  describe( `GET /api/items`, () => {

    context( `Given no items`, () => {
      it( `responds with 200 and an empty list`, () => {
        return supertest( app )
          .get( '/api/items' )
          .expect( 200, [] )
      })
    })

    context( `Given there are items in the database`, () => {
      const testItems = makeItemsArray()
  
      beforeEach( `insert items`, () => {
        return db
          .into( 'moviewatch_items' )
          .insert( testItems )
      })

      it( `GET /api/items responds with a 200 an all of the articles`, () => {
        return supertest( app )
          .get( '/api/items' )
          .expect( 200, testItems )
      })
    })
  })

  describe( `GET /api/items/:item_id`, () => {

    context( `Given no items`, () => {
      it( `responds with 404`, () => {
        const itemId = 123456
        return supertest( app )
          .get( `/api/items/${ itemId }`)
          .expect( 404, { error: { message: `Item doesn't exist` } })
      })
    })

    context( `Given there are items in the database`, () => {
      const testItems = makeItemsArray()
  
      beforeEach( `insert items`, () => {
        return db
          .into( 'moviewatch_items' )
          .insert( testItems )
      })
  
      it( `GET /api/items/:item_id responds with 200 and the specified item`, () => {
        const itemId = 2
        const expectedItem = testItems[ itemId - 1 ]
        return supertest( app )
          .get( `/api/items/${ itemId }` )
          .expect( 200, expectedItem )
      })
    })
  })

  describe( `POST /api/items`, () => {
    it( `creates an item, responding with 201 and the new item`, function() {
      this.retries( 3 )
      const newItem = {
        title: 'test title',
        is_netflix: true,
        is_hulu: true,
        is_prime: true,
        rating: "Watch"
      }
      return supertest( app )
        .post( '/api/items' )
        .send( newItem )
        .expect( 201 )
        .expect( res => {
          expect( res.body.title ).to.eql( newItem.title )
          expect( res.body.is_netflix ).to.eql( newItem.is_netflix )
          expect( res.body.is_hulu ).to.eql( newItem.is_hulu )
          expect( res.body.is_prime ).to.eql( newItem.is_prime )
          expect( res.body.rating ).to.eql( newItem.rating )
          expect( res.body ).to.have.property( 'id' )
          expect( res.headers.location ).to.eql( `/api/items/${ res.body.id }`)
        })
        .then( postRes => 
          supertest( app )
            .get( `/api/items/${ postRes.body.id }` )
            .expect( postRes.body )
        )
    })

    const requiredFields = [ 'title', 'is_netflix', 'is_hulu', 'is_prime', 'rating' ]

    requiredFields.forEach( field => {
      const newItem = {
        title: 'test title',
        is_netflix: true,
        is_hulu: true,
        is_prime: true,
        rating: "Watch"
      }

      it( `responds with 400 and an error message when the '${ field }' is missing`, () => {
        delete newItem[ field ]
  
        return supertest( app )
          .post( '/api/items' )
          .send( newItem )
          .expect( 400, {
            error: { message: `Missing '${ field }' in request body` }
          }) 
      })
    })
  })

  describe( `DELETE /api/items/:items_id`, () => {
    context( `Given no items`, () => {
      it( `responds with 404`, () => {
        const itemId = 123456
        return supertest( app )
          .delete( `/api/items/${ itemId }` )
          .expect( 404, { error: { message: `Item doesn't exist` } })
      })
    })

    context( `Given there are items in the database`, () => {
      const testItems = makeItemsArray()

      beforeEach( 'insert items', () => {
        return db
          .into( 'moviewatch_items' )
          .insert( testItems )
      })

      it( `responds with 204 and removes the items`, () => {
        const idToRemove = 2
        const expectedItem = testItems.filter( item => item.id !== idToRemove )
        return supertest( app )
          .delete( `/api/items/${ idToRemove }`)
          .expect( 204 )
          .then( res =>
            supertest( app )
              .get( `/api/items` )
              .expect( expectedItem )
          )
      })
    })
  })

  describe( `PATCH /api/items/:item_id`, () => {
    context( `Given no items`, () => {
      it( `responds with 404`, () => {
        const itemId = 123456
        return supertest( app )
          .patch( `/api/items/${ itemId }` )
          .expect( 404, { error: { message: `Item doesn't exist` } })
      } )
    })

    context( `Given there are no items in the database`, () => {
      const testItems = makeItemsArray()

      beforeEach( `insert items`, () => {
        return db
          .into( 'moviewatch_items' )
          .insert( testItems )
      })

      it( `responds with 204 and updates the article`, () => {
        const idToUpdate = 2
          const updateItem = {
            title: 'updated item title',
            is_netflix: true,
            is_hulu: true,
            is_prime: true,
            rating: "Watch"
          }
          const expectedItem = {
            ...testItems[ idToUpdate -1 ],
            ...updateItem
          }
          return supertest( app )
            .patch( `/api/items/${ idToUpdate }`)
            .send( updateItem )
            .expect( 204 )
            .then( res =>
              supertest( app )
                .get( `/api/items/${ idToUpdate }`)
                .expect( expectedItem ) 
            )
      })

      it( `responds with 400 when no required fields supported`, () => {
        const idToUpdate = 2
        return supertest( app )
          .patch( `/api/items/${ idToUpdate }` )
          .send( { irrelevantField: 'foo' })
          .expect( 400, {
            error: {
              message: `Request body must contain either 'title', 'is_netflix', 'is_hulu', 'is_prime', or 'rating'`
            }
          })
      })

      it( `responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2
        const updateItem = {
          title: 'updated item title',
        }
        const expectedItem = {
          ...testItems[ idToUpdate - 1 ],
          ...updateItem
        }

        return supertest( app )
          .patch( `/api/items/${ idToUpdate }` )
          .send({
            ...updateItem,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect( 204 )
          .then( res => 
            supertest( app )
              .get( `/api/items/${ idToUpdate }` )
              .expect( expectedItem )  
          )
      })
    })
  })
})