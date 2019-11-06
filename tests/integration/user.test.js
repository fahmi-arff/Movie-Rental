const request = require('supertest');
const {User} = require('../../models/user');
const mongoose = require('mongoose');

let server;

afterAll(async (done) => {
  await mongoose.disconnect();
  done()
})

describe('/api/users', () => {
  beforeEach(() => { 
    process.env.PORT = 8000;
    server = require('../../index'); 
  })
  afterEach(async() => { 
    server.close();
    await User.remove({});
  })

  describe('GET /me', () => {
    let token;

    const exec = () => {
      return request(server)
        .get('/api/users/me')
        .set('x-auth-token', token)
    }
    beforeEach(async() => {
      token = new User().generateAuthToken(); 

      const user = new User({ 
        name: 'name1', 
        email: 'user@email.com',
        password: '12345'
      });
      await user.save();
    })

    it('should return the user if token provided', async () => {
      const res = await exec()

      expect(res.status).toBe(200);
    })

    it('should return 401 if no token provided', async () => {
      token = "";

      const res = await exec()

      expect(res.status).toBe(401);
    })

    it('should return 400 if token is invalid', async () => {
      token = "a";

      const res = await exec()

      expect(res.status).toBe(400);
    })
  })

  describe('POST /', () => {
    let name;
    let email;
    let password;

    const exec = () => {
      return request(server)
        .post('/api/users')
        .send({ name , email, password});
    }

    beforeEach(() => {
      name = 'name1';
      email = 'name@email.com'
      password = '12345'
    })

    it('should return 400 if user name is less than 5 characters', async() => {
      name = "name"

      const res = await exec();

      expect(res.status).toBe(400);
    })
    
    it('should return 400 if user name is more than 50 characters', async() => {
      name = new Array(52).join('a');
      
      const res = await exec()

      expect(res.status).toBe(400);
    })
    
    it('should return 400 if user email is less than 5 characters', async() => {
      email = "imel"

      const res = await exec();

      expect(res.status).toBe(400);
    })
    
    it('should return 400 if user email not right format', async() => {
      email = 'thisEmail'
      
      const res = await exec()

      expect(res.status).toBe(400);
    })
    
    it('should return 400 if user password is less than 5 characters', async() => {
      password = "1234"
      
      const res = await exec()

      expect(res.status).toBe(400);
    })

    it('should save the user if it is valid', async() => {
      await exec();

      const user = await User.find({ name: 'name1', email: 'name@email.com' });

      expect(user).not.toBeNull();
    })

    it('should return the user if it is valid', async() => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'name1');
      expect(res.body).toHaveProperty('email', 'name@email.com');
    })
    
    it('should return 400 if the email already registered', async() => {
      await exec();
      name = 'fahmi';
      const res = await exec();

      expect(res.status).toBe(400);
    })
  })
})