const client = require('../lib/client');

run();

async function run() {

  try {
    await client.connect();
    
    await client.query(`
            DROP TABLE IF EXISTS users CASCADE;
            DROP TABLE IF EXISTS cocktails;
        `);

  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
