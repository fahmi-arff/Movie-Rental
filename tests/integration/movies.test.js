const request = require('supertest');
const {Genre} = require('../../models/genre');
const {Movie} = require('../../models/movie');
const {User} = require('../../models/user');
const mongoose = require('mongoose');

let server;

describe('/api/movies', () => {
  beforeEach(async() => { 
    process.env.PORT = 6000;
    server = require('../../index'); 
    await Genre.collection.insertMany([
      { name: 'genre1'},
      { name: 'genre2'}
    ])
  })
  afterEach(async() => { 
    server.close();
    await Movie.remove({});
    await Genre.remove({});
  });

  describe('GET /', () => {
    it('should return all movie', async () => {
      await Movie.collection.insertMany([
        { 
          title: 'title1',
          genreId: { name: '12345' },
          numberInStock: 5,
          dailyRentalRate: 7
         }
      ]);

      const res = await request(server).get('/api/movies');
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body.some(g => g.title === 'title1')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    let movie; 
    let id; 
    let genre1;

    const exec = () => {
      return request(server)
        .get('/api/movies/' + id)
        .send();
    };

    beforeEach(async () => {
      genre1 = await Genre.findOne({ name: 'genre1' });
      movie = new Movie({ 
        title: 'Movie1',
        genre: {
          id: genre1._id,
          name: genre1.name
        },
        numberInStock: 5,
        dailyRentalRate: 7 
      });
      await movie.save();
      
      id = movie._id; 
    })

    it('should return a movie if valid id is passed', async () => {
      const res = await exec()

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', movie.title);
      expect(res.body).toHaveProperty('genre.name', movie.genre.name);
    });

    it('should return 404 if invalid id is passed', async () => {
      id = 1;

      const res = await exec()

      expect(res.status).toBe(404);
    });
    
    it('should return 404 if no custumer with the given id exist', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec()

      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let token;
    let title;
    let genreId;
    let numberInStock;
    let dailyRentalRate;
    let genre;

    const exec = () => {
      return request(server)
        .post('/api/movies')
        .set('x-auth-token', token)
        .send({ title, genreId, numberInStock, dailyRentalRate });
    }

    beforeEach(async() => {
      genre = await Genre.findOne({ name: 'genre1' });
      token = new User().generateAuthToken();
      title = 'title1';
      genreId = genre._id;
      numberInStock = 5;
      dailyRentalRate = 7;

    })

    it('should return 401 if client is not logged in', async() => {
      token = "";

      const res = await exec()

      expect(res.status).toBe(401);
    })

    it('should return 400 if movie title is less than 5 characters', async() => {
      title = "bob"

      const res = await exec();

      expect(res.status).toBe(400);
    })
    
    it('should return 400 if genre id is invalid', async() => {
      genreId = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(400);
    })

    it('should save the movie if it is valid', async() => {
      await exec();

      const movie = await Movie.find({ title });

      expect(movie).not.toBeNull();
    })

    it('should return the movie if it is valid', async() => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', 'title1')
    })
  });

  describe('PUT /:id', () => {
    let token; 
    let newTitle; 
    let newgenre; 
    let id; 
    let genre1;
    let genre2;

    const exec = () => {
      return request(server)
        .put('/api/movies/' + id)
        .set('x-auth-token', token)
        .send({ 
          title: newTitle,
          genreId: newgenre, 
          numberInStock: 3, 
          dailyRentalRate: 5, 
        });
    }

    beforeEach(async () => {   
      genre1 = await Genre.findOne({ name: 'genre1' });
      genre2 = await Genre.findOne({ name: 'genre2' });
      movie = new Movie({ 
        title: 'Movie1',
        genre: {
          id: genre1._id,
          name: genre1.name
        },
        numberInStock: 5,
        dailyRentalRate: 7 
      });
      await movie.save();
      
      token = new User().generateAuthToken();     
      id = movie._id; 
      newTitle = 'Movie2',
      newgenre = genre2._id
    })

    it('should return 401 if client is not logged in', async () => {
      token = ''; 

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if movie title is less than 5 characters', async () => {
      newTitle = '1234'; 
      
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if movie title is more than 50 characters', async () => {
      newTitle = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 404 if id is invalid', async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if movie with the given id was not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });
    
    it('should return 400 if genre id is invalid', async () => {
      newgenre = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should update the movie if input is valid', async () => {
      await exec();

      const updateMovie = await Movie.findById(movie._id);

      expect(updateMovie.title).toBe(newTitle);
    });

    it('should return the updated movie if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', newTitle);
      expect(res.body).toHaveProperty('genre.name', 'genre2');
    });
  });

  describe('DELETE /:id', () => {
    let token; 
    let movie; 
    let id; 
    let genre1;

    const exec = () => {
      return request(server)
        .delete('/api/movies/' + id)
        .set('x-auth-token', token)
        .send();
    };

    beforeEach(async () => {
      genre1 = await Genre.findOne({ name: 'genre1' });
      movie = new Movie({ 
        title: 'Movie1',
        genre: {
          id: genre1._id,
          name: genre1.name
        },
        numberInStock: 5,
        dailyRentalRate: 7 
      });
      await movie.save();
      
      id = movie._id; 
      token = new User({ isAdmin: true }).generateAuthToken();     
    })

    it('should return 401 if client is not logged in', async () => {
      token = ''; 

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 403 if the user is not an admin', async () => {
      token = new User({ isAdmin: false }).generateAuthToken(); 

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it('should return 404 if id is invalid', async () => {
      id = 1; 
      
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if no customer with the given id was found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should delete the customer if input is valid', async () => {
      await exec();

      const movieInDb = await Movie.findById(id);

      expect(movieInDb).toBeNull();
    });

    it('should return the removed customer', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id', movie._id.toHexString());
      expect(res.body).toHaveProperty('title', movie.title);
      expect(res.body).toHaveProperty('numberInStock', movie.numberInStock);
    });
  });
});