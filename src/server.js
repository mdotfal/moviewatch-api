const knex = require( 'knex' );
const express = require( 'express' );
const app = express();
const { PORT , DB_URL } = require( './config' );

const db = knex({
  client: 'pg',
  connection: DB_URL,
})

app.set( 'db', db )

const PORT = process.env.PORT || 3000;

app.get(' /api/*', ( req, res ) => {
  res.json( { ok: true } );
});

app.listen( PORT, () => console.log( `Listening on port ${ PORT }` ) );

module.exports = { app };