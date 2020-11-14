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


  describe( `GET /items`, () => {

    context( `Given no items`, () => {
      it( `responds with 200 and an empty list`, () => {
        return supertest( app )
          .get( '/items' )
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

      it( `GET /items responds with a 200 an all of the articles`, () => {
        return supertest( app )
          .get( '/items' )
          .expect( 200, testItems )
      })
    })
  })

  describe( `GET /items/:item_id`, () => {

    context( `Given no items`, () => {
      it( `responds with 404`, () => {
        const itemId = 123456
        return supertest( app )
          .get( `/items/${ itemId }`)
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
  
      it( `GET /items/:item_id responds with 200 and the specified item`, () => {
        const itemId = 2
        const expectedItem = testItems[ itemId - 1 ]
        return supertest( app )
          .get( `/items/${ itemId }` )
          .expect( 200, expectedItem )
      })
    })
  })

  describe( `POST /items`, () => {
    it( `creates an item, responding with 201 and the new item`, function() {
      this.retries( 3 )
      const newItem = {
        title: 'test title',
        isnetflix: true,
        ishulu: true,
        isprime: true,
        rating: "Watch"
      }
      return supertest( app )
        .post( '/items' )
        .send( newItem )
        .expect( 201 )
        .expect( res => {
          expect( res.body.title ).to.eql( newItem.title )
          expect( res.body.isnetflix ).to.eql( newItem.isnetflix )
          expect( res.body.ishulu ).to.eql( newItem.ishulu )
          expect( res.body.isprime ).to.eql( newItem.isprime )
          expect( res.body.rating ).to.eql( newItem.rating )
          expect( res.body ).to.have.property( 'id' )
          expect( res.headers.location ).to.eql( `/items/${ res.body.id }`)
        })
        .then( postRes => 
          supertest( app )
            .get( `/items/${ postRes.body.id }` )
            .expect( postRes.body )
        )
    })

    const requiredFields = [ 'title', 'isnetflix', 'ishulu', 'isprime', 'rating' ]

    requiredFields.forEach( field => {
      const newItem = {
        title: 'test title',
        isnetflix: true,
        ishulu: true,
        isprime: true,
        rating: "Watch"
      }

      it( `responds with 400 and an error message when the '${ field }' is missing`, () => {
        delete newItem[ field ]
  
        return supertest( app )
          .post( '/items' )
          .send( newItem )
          .expect( 400, {
            error: { message: `Missing '${ field }' in request body` }
          }) 
      })
    })
  })

  describe( `DELETE /items/:items_id`, () => {
    context( `Given no items`, () => {
      it( `responds with 404`, () => {
        const itemId = 123456
        return supertest( app )
          .delete( `/items/${ itemId }` )
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
          .delete( `/items/${ idToRemove }`)
          .expect( 204 )
          .then( res =>
            supertest( app )
              .get( `/items` )
              .expect( expectedItem )
          )
      })
    })
  })



})