// Dependencies
const isAuthenticated = require("../config/middleware/isAuthenticated"); 
const db = require("../models");
const moment = require("moment")

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

  // index page
  app.get('/index',isAuthenticated, (req,res)=>{
    // find the books under the user's list
    db.Readings.findAll({
      where: {
        UserID: req.user.id
      },
      include:[db.Books]
    })
    .then(results =>{
      let books = results.map(el =>{
        return {
          ISBN : el.Book.dataValues.ISBN,
          URL : el.Book.dataValues.URL,
          title : el.Book.dataValues.name,
          reading : el.reading
        }
      })
      res.render('index', {books: books, whichPartial: function() {
        return "header/no-header";
      }});
    })
  });

  // community page
  app.get('/community',isAuthenticated, (req,res)=>{
      db.Reviews.findAll({
          include: [db.Users, db.Books],
          order: [["createdAt", "DESC"]],
          limit: 5
      }).then(results => {
        let reviews = results.map(el =>{
          return {
            time : moment(el.dataValues.createdAt).format('MMM Do, YYYY'),
            content : el.dataValues.content,
            rate : el.dataValues.rate,
            username : el.dataValues.User.name,
            url : el.dataValues.Book.URL,
            title: el.dataValues.Book.name,
            author: el.dataValues.Book.author
          }
        })
        res.render('community', {reviews: reviews, whichPartial: function() {
          return "header/header-community";
        }});
      })
      .catch(err => console.log(err))

    
  });

  app.get('*', (req,res)=>{
    if (req.user) {
      res.redirect("/");
    }
  });


}