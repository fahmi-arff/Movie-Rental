const request = require('supertest');
const mongoose = require('mongoose');
const {User} = require('../../models/user');
const {Genre} = require('../../models/genre');
const bcrypt = require('bcrypt');

let server;
let token;
let email;
let password;

afterAll(async () => {
  await mongoose.disconnect();
})

describe('auth middleware', () => {
  beforeEach(() => { 
    process.env.PORT = 3002;
    server = require('../../index'); 
    token = new User().generateAuthToken();
  })
  afterEach(async() => { 
    server.close();
    await Genre.remove({});
  })
  
  const exec = async() => {
    return await request(server)
      .post('/api/genres')
      .set('x-auth-token', token)
      .send({ name: 'genre1' });
  }

  it('should return 401 if no token is provided', async() => {
    token = "";

    const res = await exec();

    expect(res.status).toBe(401);
  })
  
  it('should return 400 if token is invalid', async() => {
    token = "a";

    const res = await exec();

    expect(res.status).toBe(400);
  })
  
  it('should return 200 if token is valid', async() => {
    const res = await exec();

    expect(res.status).toBe(200);
  })
})

describe('auth user login', () => {
  beforeEach(() => { server = require('../../index'); })
  afterEach(async() => { 
    server.close();
    await User.remove({});
  })
  
  const exec = () => {
    return request(server)
      .post('/api/users')
      .send({ name:'name1', email, password});
  }

  const auth = () => {
    return request(server)
      .post('/api/auth')
      .send({ email, password})
  }

  beforeEach(async() => {
    email = 'name@email.com'
    password = '12345'
    await exec();
  })

  it('should return 400 if email is less than 5 characters', async() => {
    email = "imel"

    const res = await auth();

    expect(res.status).toBe(400);
  })
  
  it('should return 400 if email not right format', async() => {
    email = 'thisEmail'
    
    const res = await auth()

    expect(res.status).toBe(400);
  })
  
  it('should return 400 if email is invalid', async() => {
    email = 'fahmi@gmail.com';
    const res = await auth()
    
    await User.findOne({ email });
    
    expect(res.status).toBe(400);
  })
  
  it('should return 400 if password is less than 5 characters', async() => {
    password = "1234"
    
    const res = await auth()

    expect(res.status).toBe(400);
  })

  it('should return 400 if password is invalid', async() => {
    password = "12346"

    const res = await auth()
    const user = await User.findOne({ email });
    
    await bcrypt.compare(password, user.password);

    expect(res.status).toBe(400);
  })

  it('should return 200 if login sucess', async() => {
    const res = await auth()

    expect(res.status).toBe(200);
  })
})