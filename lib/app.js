const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this protected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/cocktails', async(req, res) => {
  try {
    const data = await client.query(`SELECT cocktails.id, cocktails.name, cocktails.description, cocktails.category_id, cocktails.price, cocktails.ingredients, cocktails.owner_id FROM cocktails 
    JOIN categories ON cocktails.category_id = categories.id`);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/cocktails/:id', async(req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query('SELECT cocktails.id, cocktails.name, cocktails.description, cocktails.category_id, cocktails.price, cocktails.ingredients, cocktails.owner_id FROM cocktails JOIN categories ON cocktails.category_id = categories.id WHERE cocktails.id=$1', [id]);
    console.log('HELLO', data.rows[0]);
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/categories', async(req, res) => {
  try {
    const data = await client.query('SELECT * from categories');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/cocktails', async(req, res) => {
  try {
    const data = await client.query(`
      insert into cocktails (name, description, category_id, price, ingredients, owner_id) 
      values ($1, $2, $3, $4, $5, $6) 
      returning * 
      `,

    [
      req.body.name, 
      req.body.description, 
      req.body.category_id, 
      req.body.price, 
      req.body.ingredients,
      1, 
    ]);

    res.json(data.rows[0]);
  } catch(e) {
  
    res.status(500).json({ error: e.message });
  }
});

app.put('/cocktails/:id', async(req, res) => {
  const id = req.params.id;
  // console.log('HELLO', id);
  try {
    const data = await client.query(`
      UPDATE cocktails
      SET name = $1, description = $2, category_id = $3, price = $4, ingredients = $5
      WHERE id=$6
      returning * 
      `,
      
    [
      req.body.name, 
      req.body.description, 
      req.body.category_id, 
      req.body.price, 
      req.body.ingredients, 
      id,
    ]);

    res.json(data.rows[0]);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});

app.delete('/cocktails/:id', async(req, res) => {
  
  try {
    const id = req.params.id;
    const data = await client.query(`
      DELETE from cocktails where id=$1
      returning *`, [id]);

    res.json(data.rows[0]);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
