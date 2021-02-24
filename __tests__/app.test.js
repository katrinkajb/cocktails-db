require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    // POST test
    test('creates a new cocktail in the list', async() => {
      const newCocktail = {
        name: 'Manhattan',
        description: 'A strong whiskey drink',
        category: 'strong',
        price: 9,
        ingredients: 'Whiskey, sweet vermouth, bitters. Garnish: orange peel, maraschino cherry',
      };
      
      const expectation = {
        ...newCocktail,
        id: 9,
        owner_id: 1,
      };
  
      const data = await fakeRequest(app)
        .post('/cocktails')
        .send(newCocktail)
        .expect('Content-Type', /json/)
        .expect(200);
  
      expect(data.body).toEqual(expectation);

      const allCocktails = await fakeRequest(app)
        .get('/cocktails')
        .expect('Content-Type', /json/)
        .expect(200);

      const manhattan = allCocktails.body.find(cocktail => cocktail.name === 'Manhattan'); 

      expect(manhattan).toEqual(expectation);
    });

    // PUT update to single cocktail test
    test('updates a cocktail with the matching id', async() => {
      const newCocktail = {
        name: 'Old Fashioned',
        description: 'A strong bourbon drink',
        category: 'strong',
        price: 8,
        ingredients: 'Bourbon, simple syrup, bitters. Garnish: orange peel',
      };

      const expectation = {
        ...newCocktail,
        id: 1,
        owner_id: 1,
      };

      await fakeRequest(app)
        .put('/cocktails/1')
        .send(newCocktail)
        .expect('Content-Type', /json/)
        .expect(200);

      const updatedCocktail = await fakeRequest(app)
        .get('/cocktails/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(updatedCocktail.body).toEqual(expectation);
    });

    // GET single cocktail test
    test('returns a single cocktail with the matching id', async() => {
      const expectation = {
        'id': 1,
        'name': 'Old Fashioned',
        'description': 'A strong bourbon drink',
        'category': 'strong',
        'price': 8,
        'ingredients': 'Bourbon, simple syrup, bitters. Garnish: orange peel',
        'owner_id': 1
      };

      const data = await fakeRequest(app)
        .get('/cocktails/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    // DELETE single cocktail test
    test('deletes a cocktail with the matching id', async() => {  
      const expectation = {
        id: 9,
        name: 'Manhattan',
        description: 'A strong whiskey drink',
        category: 'strong',
        price: 9,
        ingredients: 'Whiskey, sweet vermouth, bitters. Garnish: orange peel, maraschino cherry',
        owner_id: 1,
      };

      const data = await fakeRequest(app)
        .delete('/cocktails/9')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);

      const deleted = await fakeRequest(app)
        .get('/cocktails/9')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(deleted.body).toEqual('');
    });

    // GET all cocktails test
    test('returns cocktails', async() => {
      const expectation = [
        {
          'id': 2,
          'name': 'White Russian',
          'description': 'A creamy vodka drink',
          'category': 'creamy',
          'price': 9,
          'ingredients': 'Vodka, coffee liqueur, half and half',
          'owner_id': 1
        },
        {
          'id': 3,
          'name': 'French 75',
          'description': 'A gin and champagne drink',
          'category': 'bubbles',
          'price': 11,
          'ingredients': 'Gin, lemon juice, simple syrup, champagne. Garnish: lemon twist',
          'owner_id': 1
        },
        {
          'id': 4,
          'name': 'Mojito',
          'description': 'A refreshing rum drink',
          'category': 'refreshing',
          'price': 10,
          'ingredients': 'White rum, mint, lime, simple syrup, club soda. Garnish: lime wedge, mint',
          'owner_id': 1
        },
        {
          'id': 5,
          'name': 'Cadillac Margarita',
          'description': 'A strong tequila drink',
          'category': 'strong',
          'price': 9,
          'ingredients': 'Tequila, orange liqueur, lime juice. Garnish: lime slice',
          'owner_id': 1
        },
        {
          'id': 6,
          'name': 'Gimlet',
          'description': 'A refreshing gin and lime drink',
          'category': 'refreshing',
          'price': 8,
          'ingredients': 'Gin, lime juice, simple syrup. Garnish: lime wheel',
          'owner_id': 1
        },
        {
          'id': 7,
          'name': 'Martini',
          'description': 'A strong gin drink',
          'category': 'strong',
          'price': 11,
          'ingredients': 'Gin, dry vermouth. Garnish: olives or lemon twist',
          'owner_id': 1
        },
        {
          'id': 8,
          'name': 'Greyhound',
          'description': 'A refreshing vodka drink',
          'category': 'refreshing',
          'price': 7,
          'ingredients': 'Vodka, grapefruit juice. Garnish: grapefruit wedge',
          'owner_id': 1
        },
        {
          'id': 1,
          'name': 'Old Fashioned',
          'description': 'A strong bourbon drink',
          'category': 'strong',
          'price': 8,
          'ingredients': 'Bourbon, simple syrup, bitters. Garnish: orange peel',
          'owner_id': 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/cocktails')
        .expect('Content-Type', /json/)
        .expect(200);
        
      expect(data.body).toEqual(expectation);
    });
  });
});

