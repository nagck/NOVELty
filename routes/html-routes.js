var isAuthenticated = require("../config/middleware/isAuthenticated"); 

module.exports = function(app) {
// index page - login or singup
  app.get('/', (req,res)=>{
    console.log('hi')
    if (req.user) {
      res.redirect("/home");
    }
    res.render('partials/header/header-block',{layout: 'main'});
  });

  // login page
  app.get('/login', (req,res)=>{
    if (req.user) {
      res.redirect("/home");
    }
    res.render('login', {});
  });

  // signup page
  app.get('/signup', (req,res)=>{
    res.render('signup', {});
  });

    // newuser page
  app.get('/newuser', (req,res)=>{
    res.render('newuser', {});
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