require( 'dotenv').config();
const express = require( 'express' );
const morgan = require( 'morgan' );
const cors = require( 'cors' );
const { CLIENT_ORIGIN } = require( './config' );
const helmet = require( 'helmet' );
const { NODE_ENV } = require( './config');
const ItemsService = require( './items/items-service' );
const itemsRouter = require('./items/items-router');

const app = express();
const jsonParser = express.json()

const morganOption = ( NODE_ENV === 'production' )
  ? 'tiny'
  : 'common';

app.use( morgan( morganOption ));
app.use( helmet() );
app.use( 
  cors({
    origin: CLIENT_ORIGIN
  }) 
);

app.use( '/items', itemsRouter )

app.get( '/', ( req, res ) => {
  res.send( 'Hello, world!' )
})

app.get( '/xss', ( req, res ) => {
  res.cookie( 'secretToken', '1234567890' );
  res.sendFile( __dirname + '/xss-example.html' );
})

app.use( errorHandler = ( error, req, res, next) => {
  let response;
  if( NODE_ENV === 'production' ) {
    response = { error: { message: 'server error' }}
  } else {
    console.log( error );
    response = { message: error.message, error }
  }
  res.status( 500 ).json( response );
})

module.exports = app;
