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
    const { title, isnetflix, ishulu, isprime, rating } = req.body
    const newItem = { title, isnetflix, ishulu, isprime, rating }

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
      isnetflix: res.item.isnetflix,
      ishulu: res.item.ishulu,
      isprime: res.item.isprime,
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
    const { title, isnetflix, ishulu, isprime, rating } = req.body
    const itemToUpdate = { title, isnetflix, ishulu, isprime, rating }

    const numberOfValues = Object.values( itemToUpdate ).filter( Boolean ).length
    if( numberOfValues === 0) {
      return res.status( 400 ).json({
        error: {
          message: `Request body must contain either 'title', 'isNetflix', 'isHulu', 'isPrime', or 'rating'`
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