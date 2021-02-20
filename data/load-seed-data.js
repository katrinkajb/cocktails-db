const client = require('../lib/client');
// import our seed data:
const cocktails = require('./cocktails.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      cocktails.map(cocktail => {
        return client.query(`
                    INSERT INTO cocktails (name, description, category, price, ingredients, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
        [cocktail.name, 
          cocktail.description, 
          cocktail.category, 
          cocktail.price, 
          cocktail.ingredients, 
          user.id,
        ]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
