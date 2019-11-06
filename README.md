# Movie-Rental
Movie Rental API with express, mongodb with jest integrating testing and tdd 

try my API with postman
https://murmuring-ocean-16180.herokuapp.com

Endpoint 
* /api/users
* /api/auth
* /api/genres
* /api/customers
* /api/movies
* /api/rentals

## How to use
1. Make sure to register first and login to get token
2. Place the token in header with key **x-auth-token** and token as your value
3. login user can **post & put data**
4. Non login user only can see the **get data**
5. Only **admin** who can delete data
