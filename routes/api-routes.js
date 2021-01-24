// Dependencies
const db = require("../models");
const fetch = require('node-fetch');
const passport = require("../config/passport");
const request = require('request');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// function to get the list of recommendations from tasteDive api
// it takes in a array titles and for the first title that it can find recommendations, it will run the cb function
// this is a recursive function
const recommendationTasteDiveArray = (titles, cb) =>{
    let book = `${titles.splice(0,1)}`;
    let apikey = process.env.MYAPIKEY_TD;
    console.log(book)
    if(book.trim() === "") {
        cb(false);
    }
    else{
        const url = `https://tastedive.com/api/similar?q=book:${book}&k=${apikey}&limit=5`;
        request(
            { 
                url: url 
            },
            (error, response, body) => {
                if (error || response.statusCode !== 200) {
                    console.error(error)
                    recommendationTasteDiveArray(titles,cb);
                }
                else if (JSON.parse(body).Similar.Results.length == 0){
                    recommendationTasteDiveArray(titles,cb);
                }
                else{
                    cb(JSON.parse(body));
                }
            }
        )
    }
}

// function to get the list of recommendations from New York Times Bestsellers
// it takes in a genre and it will run the cb function
const recommendationNewYork = (genre, cb) =>{
    let apikey = process.env.MYAPIKEY_NY;
    let url = `https://api.nytimes.com/svc/books/v3/lists.json?list=${genre}&api-key=${apikey}`;
    fetch(url)  
        .then(response => response.json())  
        .then(data => { 
            console.log(data); 
            cb(data)
        })
        .catch(error => {
            cb(false)
        });
}

// function to get the list of titles and the array to store the isbn
// it is a recursive function to find all the corresponding isbn
const findISNB = (titles,isbnArray, cb) =>{

    if(titles.length == 0) cb(isbnArray);
    else{
        let title = titles.splice(0,1)[0];
        let url = "http://openlibrary.org/search.json?title=";

        fetch(url+title)
        .then(response => response.json())
        .then(data => {
            let books = data.docs;
            for(let i = 0; i < books.length; i++){
                let book = books[i];
                if(book.author_name !== undefined) {
                    if(book.isbn !== undefined) {
                        if(book.title.toLowerCase().trim() == title.toLowerCase().trim()){
                            for(let i = 0; i < book.isbn.length; i++){
                                if(book.isbn[i].startsWith('9780')) {
                                    isbn = book.isbn[i];
                                    break;
                                }
                            }
                            isbnArray.push(isbn);
                            break;
                        }
                    } 
                }
            }
            findISNB(titles,isbnArray, cb);            
        })
    }
    
}

// helper function to shuffle arrays
const shuffle =  (array) => {
    for (let i = array.length-1; i > 0; i--){
        let j = Math.floor(Math.random()*(i+1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
  }

module.exports = function(app) {

    //Routes that involves user sign in, login, logout

    // login - would need to configure passport
    app.post("/api/login", passport.authenticate("local"), (req, res) => {
        res.json(req.user);
    });

    // signup - would need to make sure that the fields for the User model matches here
    app.post("/api/signup", (req, res) => {
        db.Users.create({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password
        })
        .then(() => {
            // res.redirect(307, "/newuser");
            res.redirect(307, "/api/login")
        })
        .catch((err) => {
            res.status(401).json(err);
        });
    });

    // newuser - would need to see how to include 'genre' in user model
    app.post('/api/newuser', (req,res)=>{
        //TODO update field for 'genre'
        // db.Users.update
        // .then(function() {
        //     res.redirect(307, '/api/login');
        // })
        // .catch((err) => {
        //     res.status(401).json(err);
        // });
    })
    
    // logout 
    app.get("/logout", function(req, res) {
        req.logout();
        res.redirect("/");
    });

    // get user's id and name
    app.get('/api/get_user', (req,res)=>{
        if (!req.user) {
            res.json({});
        } 
        
        else {
            res.json({
              name: req.user.name,
              id: req.user.id
            });
        }
    });

    //Routes that involves user's dashboard

    //get all books under the user
    app.get('/api/books/:user', (req,res) =>{
        db.Reading.findAll({
            where:{
                UserID : req.params.user
            },
            include: [db.Books]
        }).then(books => res.json(books))
        
    })

    // update a book to be completed
    app.put('/api/books/:user', (req,res) =>{
        db.Reading.update(
            {
                reading: false,
                favourite: req.body.favourite
            },{
            where : {
                UserId: req.params.user,
                BookId: req.body.bookId
            }
        }).then(result => {
            console.log(result)
            res.json(result)
        })
    })

    // delete a book
    app.delete('/api/books/:user/:book',(req,res) =>{
        // TODO: function to destroy a book when the user drops it
        // probably using the req.body to get the parameters
        db.Reading.destroy({
            where:{
                UserId: req.params.user,
                BookId: req.params.book
            }
        }).then(result => {
            console.log('deleting')
            console.log(result)
            res.json(result)
        })
        
    });
    // add a book in the data
    app.post('/api/books',(req,res)=>{
        db.Books.findOrCreate({
            where: {
                ISBN: req.body.isbn
            },
            defaults: {
                name: req.body.title,
                author: req.body.author,
                URL: `http://covers.openlibrary.org/b/isbn/${req.body.isbn}-M.jpg`
            }
        })
        .then(() =>{
            res.status(307).json({})
        })
        .catch(err => {
            // console.log(err)
            res.status(401).json({err})
        })
    })

    // add a book
    app.post('/api/books/:user',(req,res) =>{
        db.Reading.findOrCreate({
            where: {
                UserId:  req.params.user,
                BookId:  req.body.id
            },
            defaults:{
                reading: req.body.reading,
                favourite: req.body.favourite
            }
        })
        .then((data) =>{
            res.json(data)
        })
        .catch(err => res.status(401).json(err))
        
    });

    // get the book id
    app.get('/api/book/:isbn', (req,res)=>{
        db.Books.findAll({
            where:{
                isbn: req.params.isbn
            }
        })
        .then(result => res.json(result))
    })


    //get the latests review/ratings activity - community page
    app.get('/api/all-reviews', (req,res)=>{
        console.log('hello')
        db.Review.findAll({
            include: [db.Users, db.Books],
            order: [["createdAt", "DESC"]],
            limit: 5
        }).then(result => res.json(result))
        .catch(err => console.log(err))
    });
    
    // add a review/rating to the book
    app.post('/api/books/review/:book',(req,res) =>{
        db.Review.create({
            content: req.body.content,
            rate: req.body.rating,
            UserId: req.body.user,
            BookId: req.params.book
        })
        .then(result => res.json(result))
        .catch(err => console.log(err))
    });

    //get the review/ratings for that book using ISBN
    app.get('/api/books/review/:isbn', (req,res)=>{
        
        db.Review.findAll({
            include: [{
                model: db.Books, 
                where: {
                    ISBN: req.params.isbn
                },
            },
            {model: db.Users}
        ]
        }).then(result => res.json(result))
        
    })

    
    // recommendation function 
    
    app.get('/api/recommendationUser/:user',(req,res) =>{
        db.Reading.findAll({
            where:{
                UserID : req.params.user,
                favourite: true,
            },
            include: [db.Books]
        }).then(results => {
            let allFavouriteBooks = results.map(book => book.BookId)
            // console.log(allBooks)
            db.Reading.findAll({
                where:{
                    BookId : allFavouriteBooks,
                    favourite : 1,
                    UserID : {
                        [Op.ne] : req.params.user 
                    }
                }
            })
            .then(results =>{
                let allUsers = results.map(item => item.UserId);
                let uniqueUsers = [...new Set(allUsers)]
                db.Reading.findAll({
                    where:{
                        UserID : req.params.user
                    }
                })
                .then(results => {
                    let allBooks = results.map(book => book.BookId);
                    db.Reading.findAll({
                        where:{
                            UserID : uniqueUsers,
                            BookId : {
                                [Op.notIn] : allBooks
                            }
                        },
                        include: [db.Books]
                    })
                    .then(results => {
                        let Books = results.map(book => book.Book.isbn)
                        // let ids = results.map(book => book.Book.id);
                        // console.log(ids)
                        res.json(Books)
                    })
                })
                
            })
        })
    })

    // required for api request for tastedive
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        next();
    });

    app.get('/api/recommendationTD/:user',(req,res) =>{
        db.Reading.findAll({
            where:{
                UserID : req.params.user,
                favourite: true,
            },
            include: [db.Books]
        }).then(books => {
            let allBooks = books.map(book => book.Book.title)
            shuffle(allBooks);
            recommendationTasteDiveArray(allBooks, data => {
                if(!data) {
                    res.status(500);
                }
                else {
                    let isbnArray = [];
                    let titles = data.Similar.Results.map(element => element.Name)
                    console.log(titles)
                    findISNB(titles, isbnArray, data =>{
                        res.json(data)
                    })
                }
            })
        })
    })

    app.get('/api/recommendationNY/:genre',(req,res) =>{
        recommendationNewYork(req.params.genre, data => {
            if(!data) {
                res.status(500);
            }
            else {
                let isbnArray = data.results.map(result => {
                    return result.isbns[0].isbn13;
                })
                res.json(isbnArray)
            }
        })
    })
}