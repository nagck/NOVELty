var isAuthenticated = require("../config/middleware/isAuthenticated"); 

module.exports = function(app) {
// index page - login or singup
  app.get('/', (req,res)=>{
    res.render('index', {});
  });

  // login page
  app.get('/login', (req,res)=>{
    res.render('login', {});
  });

  // signup page
  app.get('/signup', (req,res)=>{
    res.render('signup', {});
  });

  app.get('/home',isAuthenticated, (req,res)=>{
    res.render('home', {});
  });

  app.get('/community',isAuthenticated, (req,res)=>{
    res.render('community', {});
  });

  // Do we need a profile page so that they can change their password?
  app.get('/profile',isAuthenticated, (req,res)=>{
    res.render('profile', {});
  });
  

}