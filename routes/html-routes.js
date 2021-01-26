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
    console.log(req.user.id)
    db.Readings.findAll({
      where: {
        UserID: req.user.id
      },
      include:[db.Books]
    })
    .then(results =>{
      console.log('logging in')
      let books = results.map(el =>{
        console.log(el)
        return {
          ISBN : el.Book.dataValues.ISBN,
          URL : el.Book.dataValues.URL,
          title : el.Book.dataValues.name,
          reading : el.reading
        }
      })
      console.log(books)
      res.render('index', {books: books, whichPartial: function() {
        return "header/no-header";
      }});
    })
    
  });

  app.get('/community',isAuthenticated, (req,res)=>{

      db.Reviews.findAll({
          include: [db.Users, db.Books],
          order: [["createdAt", "DESC"]],
          limit: 5
      }).then(results => {
        let reviews = results.map(el =>{
          console.log(el)
          return {
            time : el.dataValues.createdAt,
            content : el.dataValues.content,
            rate : el.dataValues.rate,
            username : el.dataValues.User.name,
            url : el.dataValues.Book.URL,
            title: el.dataValues.Book.name
          }
        })
        console.log(reviews)
        res.render('community', {reviews: reviews, whichPartial: function() {
          return "header/header-community";
        }});
      })
      .catch(err => console.log(err))

    
  });

  // Do we need a profile page so that they can change their password?
  app.get('/profile',isAuthenticated, (req,res)=>{
    res.render('profile', {});
  });
  

}