const knex = require( 'knex' );
const express = require( 'express' );
const app = express();
const { PORT , DB_URL } = require( './config' );

const db = knex({
  client: 'pg',
  connection: DB_URL,
})

app.set( 'db', db )

app.listen( PORT, () => console.log( `Listening on port ${ PORT }` ) );

module.exports = { app };