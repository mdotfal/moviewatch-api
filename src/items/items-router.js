const path = require( 'path' )
const express = require( 'express')
const ItemsService = require( './items-service' )

const itemsRouter = express.Router()
const jsonParser = express.json()

itemsRouter
  .route( '/' )
  .get( ( req, res, next ) => {
    const knexInstance = req.app.get( 'db' )
    ItemsService.getAllItems( knexInstance )
      .then( items => {
        res.json( items )
      })
      .catch( next )
  })
  .post( jsonParser, ( req, res, next ) => {
    const { title, is_netflix, is_hulu, is_prime, rating } = req.body
    const newItem = { title, is_netflix, is_hulu, is_prime, rating }

    for (const [ key, value ] of Object.entries( newItem )) {
     if ( value == null ) {
        return res.status( 400 ).json({
          error: { message: `Missing '${ key }' in request body` }
        })
      }
    }

    ItemsService.insertItem(
      req.app.get( 'db' ),
      newItem
    )
      .then( item => {
        res
          .status( 201 )
          .location( path.posix.join( req.originalUrl, `/${ item.id }`) )
          .json( item )
      })
      .catch( next )
  })

itemsRouter
  .route( '/:item_id' )
  .all( ( req, res, next ) => {
    const knexInstance = req.app.get( 'db' )
    ItemsService.getById( knexInstance, req.params.item_id )
      .then( item => {
        if( !item ) {
          return res.status( 404 ).json({
            error: { message: `Item doesn't exist` }
          })
        }
        res.item = item
        next()
      })
      .catch( next )
  })
  .get( ( req, res, next) => {
    res.json({
      id: res.item.id,
      title: res.item.title,
      is_netflix: res.item.is_netflix,
      is_hulu: res.item.is_hulu,
      is_prime: res.item.is_prime,
      rating: res.item.rating
    })
  })
  .delete( ( req, res, next ) => {
    ItemsService.deleteItem(
      req.app.get( 'db' ),
      req.params.item_id
    )
      .then( () => {
        res.status( 204 ).end()
      })
      .catch( next )
  })
  .patch( jsonParser, ( req, res, next ) => {
    const { title, is_netflix, is_hulu, is_prime, rating } = req.body
    const itemToUpdate = { title, is_netflix, is_hulu, is_prime, rating }

    const numberOfValues = Object.values( itemToUpdate ).filter( Boolean ).length
    if( numberOfValues === 0) {
      return res.status( 400 ).json({
        error: {
          message: `Request body must contain either 'title', 'is_netflix', 'is_hulu', 'is_prime', or 'rating'`
        }
      })
    }

    ItemsService.updateItem(
      req.app.get( 'db' ),
      req.params.item_id,
      itemToUpdate
    )
      .then( numRowsAffected => {
        res.status( 204 ).end()
      })
      .catch( next )
  })

module.exports = itemsRouter;