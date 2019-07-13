const request = require('supertest');
const {Rental} = require('../../models/rental');
const {Movie} = require('../../models/movie');
const {Customer} = require('../../models/customer');
const {Genre} = require('../../models/genre');
const {User} = require('../../models/user');
const mongoose = require('mongoose');

let server;

describe('/api/rentals', () => {
  beforeEach(async() => { 
    process.env.PORT = 7000;
    server = require('../../index'); 
    await Genre.collection.insertMany([
      { name: 'genre1'},
      { name: 'genre2'}
    ]);

    const genre = await Genre.findOne({ name: 'genre1' });

    await Movie.collection.insertMany([
      { 
        title: 'title1',
        genreId: genre._id,
        numberInStock: 5,
        dailyRentalRate: 7
      },
      { 
        title: 'title2',
        genreId: genre._id,
        numberInStock: 0,
        dailyRentalRate: 7
      }
    ]);

    await Customer.collection.insertMany([
      { name: 'names', phone: '123456' }
    ]);
  })

  afterEach(async() => { 
    server.close();
    await Movie.remove({});
    await Genre.remove({});
    await Customer.remove({});
    await Rental.remove({});
  });

  describe('GET /', () => {
    it('should return all rental', async () => {
      const movie = await Movie.findOne({ title: 'title1' });
      const customer = await Customer.findOne({ name: 'names' });

      await Rental.collection.insertMany([
        { 
          customerId: customer._id,
          movieId: movie._id
         }
      ]);

      const res = await request(server).get('/api/rentals');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });
  });

  describe('GET /:id', () => {
    let rental; 
    let id; 

    const exec = async () => {
      return await request(server)
        .get('/api/rentals/' + id)
        .send();
    };

    beforeEach(async () => {
      const movie = await Movie.findOne({ title: 'title1' });
      const customer = await Customer.findOne({ name: 'names' });

      rental = new Rental({
        customer: {
          _id: customer._id,
          name: customer.name, 
          phone: customer.phone
        },
        movie: {
          _id: movie._id,
          title: movie.title,
          dailyRentalRate: movie.dailyRentalRate
        }
      })
      await rental.save()
      id = rental._id; 
    })

    it('should return a rental if valid id is passed', async () => {
      const res = await exec()

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('customer.name', rental.customer.name);
      expect(res.body).toHaveProperty('movie.title', rental.movie.title);
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
    let customerId;
    let movieId;
    let movie;
    let movieEmpty;
    let customer;

    const exec = async() => {
      return await request(server)
        .post('/api/rentals')
        .set('x-auth-token', token)
        .send({ customerId, movieId });
    }

    beforeEach(async() => {
      movie = await Movie.findOne({ title: 'title1' });
      movieEmpty = await Movie.findOne({ title: 'title2' });
      customer = await Customer.findOne({ name: 'names' });
      token = new User().generateAuthToken();
      customerId = customer._id;
      movieId = movie._id;
    
    })

    it('should return 400 if customerId is invalid', async() => {
      customerId = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(400);
    })
    
    it('should return 400 if customerId is not objectId', async() => {
      customerId = 'notObjectId';

      const res = await exec();

      expect(res.status).toBe(400);
    })

    it('should return 400 if movieId is invalid', async() => {
      movieId = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(400);
    })
    
    it('should return 400 if stock movie is empty', async() => {
      movieId = movieEmpty;

      const res = await exec();
      expect(res.status).toBe(400);
      expect(movieId.numberInStock).toBe(0);
    })
    
    it('should return 400 if movieId is not objectId', async() => {
      movieId = 'notObjectId';

      const res = await exec();

      expect(res.status).toBe(400);
    })
    
    it('should save the rental if it is valid', async() => {
      await exec();

      const rental = await Rental.find({ movie });
      movie.numberInStock--

      expect(rental).not.toBeNull();
    })

  })
})