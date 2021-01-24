const isAuthenticated = require("../config/middleware/isAuthenticated"); 
const db = require("../models");

module.exports = function(app) {
// index page - login or singup
  app.get('/', (req,res)=>{
    if (req.user) {
      res.redirect("index");
    }
    res.render('home',{whichPartial: function() {
      return "header/header-block";
    }});
  });

  // login page
  app.get('/login', (req,res)=>{
    if (req.user) {
      res.redirect("index");
    }
    res.render('home', {whichPartial: function() {
      return "login/login-block";
    }});
  });

  // signup page
  app.get('/signup', (req,res)=>{
    res.render('home', {whichPartial: function() {
      return "signup/signup-block";
    }});
  });

  // These need to be changed
    // newuser page
  app.get('/newuser', (req,res)=>{
    res.render('newuser', {});
    });

  app.get('/index',isAuthenticated, (req,res)=>{
    db.Readings.findAll({
      where: {
        UserID: req.user.id
      }
    })
    .then(results =>{
      console.log('logging in')
      console.log(results)
      res.render('index', {whichPartial: function() {
        return "header/no-header";
      }});
    })
    
  });

  app.get('/community',isAuthenticated, (req,res)=>{
    res.render('community', {});
  });

  // Do we need a profile page so that they can change their password?
  app.get('/profile',isAuthenticated, (req,res)=>{
    res.render('profile', {});
  });
  

}