const client = require('../lib/client');

// async/await needs to run in a function
run();

async function run() {

  try {
    // initiate connecting to db
    await client.connect();

    // run a query to create tables
    await client.query(`
                CREATE TABLE users (
                  id SERIAL PRIMARY KEY,
                  email VARCHAR(256) NOT NULL,
                  hash VARCHAR(256) NOT NULL
                );           
                CREATE TABLE cocktails (
                  id SERIAL PRIMARY KEY NOT NULL,
                  name VARCHAR(256) NOT NULL,
                  description VARCHAR(256) NOT NULL,
                  
                  category_id INTEGER NOT NULL REFERENCES categories(id),
                  price integer NOT NULL,
                  ingredients VARCHAR(256) NOT NULL,
                  owner_id INTEGER NOT NULL REFERENCES users(id)
                );
                CREATE TABLE categories (
                  id SERIAL PRIMARY KEY NOT NULL,
                  name VARCHAR(256) NOT NULL,
                );
        `);

  }
  catch(err) {
    // problem? let's see the error...
  }
  finally {
    // success or failure, need to close the db connection
    client.end();
  }

}
