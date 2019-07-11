const request = require('supertest');
const {User} = require('../../models/user');

let server;
let token;
let name;

describe('auth middleware', () => {
  beforeEach(() => { 
    server = require('../../index'); 
    token = new User().generateAuthToken();
  })
  afterEach(async() => { 
    server.close();
  })
  
  const exec = async() => {
    return await request(server)
      .post('/api/genres')
      .set('x-auth-token', token)
      .send({ name });
  }

  it('should return 401 if no token is provided', async() => {
    token = "";

    const res = await exec();

    expect(res.status).toBe(401);
  })
})