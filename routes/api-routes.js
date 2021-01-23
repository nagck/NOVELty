// Requiring our models and passport as we've configured it
var db = require("../models");
var fetch = require('node-fetch');
var passport = require("../config/passport");
const request = require('request');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const path = require("path")




const recommendationTasteDive = (title, cb) =>{
    let book = `book:${title}`;
    let apikey = process.env.MYAPIKEY_TD;

    const url = `https://tastedive.com/api/similar?q=${book}&k=${apikey}&limit=5`;
    request(
        { 
            url: url 
        },
        (error, response, body) => {
            if (error || response.statusCode !== 200) {
                console.error(error)
                cb(false);
            }
            cb(JSON.parse(body));
        }
    )
}

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

const findISNB = (titles,isbnArray, cb) =>{

    if(titles.length == 0) cb(isbnArray);
    else{
        let title = titles.splice(0,1)[0];
        let url = "http://openlibrary.org/search.json?title=";

        fetch(url+title)
        .then(response => response.json())
        .then(data => {
            // console.log(data);
            let books = data.docs;
            console.log(books.length)
            for(let i = 0; i < books.length; i++){
                let book = books[i];
                if(book.author_name !== undefined) {
                    if(book.isbn !== undefined) {
                        console.log(book.title.toLowerCase().trim())
                        console.log(title.toLowerCase().trim())
                        console.log(book.title.toLowerCase().trim() == title.toLowerCase().trim())
                        if(book.title.toLowerCase().trim() == title.toLowerCase().trim()){
                            
                            for(let i = 0; i < book.isbn.length; i++){
                                if(book.isbn[i].startsWith('9780')) {
                                    isbn = book.isbn[i];
                                    break;
                                }
                            }
                            console.log(isbn)
                            isbnArray.push(isbn);
                            console.log(isbnArray)
                            break;
                        }
                    } 
                }
            }
            findISNB(titles,isbnArray, cb);            
            
        })
    }
    
}

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
        db.User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        })
        .then(() => {
            // res.redirect(307, "/newuser");
            res.redirect(307, "/api/login")
        })
        .catch((err) => {
            console.log(err)
            res.status(401).json(err);
        });
    });

    // newuser - would need to see how to include 'genre' in user model
    app.post('/api/newuser', (req,res)=>{
        //TODO update field for 'genre'
        // db.User.update
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

    // get user's id and username
    app.get('/api/get_user', (req,res)=>{
        if (!req.user) {
            res.json({});
        } 
        
        else {
            res.json({
              username: req.user.username,
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
            include: [db.Book]
        }).then(books => res.json(books))
        
    })

    // update a book to be completed
    app.put('/api/books/:user/:book', (req,res) =>{
        db.Reading.update(
            {reading: false},
            {
            where:{
                UserId: req.params.user,
                BookId: req.params.book
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
            console.log(result)
            res.json(result)
        })
        
    });
    // add a book in the data
    app.post('/api/books',(req,res)=>{
        db.Book.findOrCreate({
            where: {
                isbn: req.body.isbn
            },
            defaults: {
                title: req.body.title,
                author: req.body.author,
                url: `http://covers.openlibrary.org/b/isbn/${req.body.isbn}-M.jpg`
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
        db.Book.findAll({
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
            include: [db.User],
            order: [["createdAt", "DESC"]],
            limit: 5
        }).then(result => res.json(result))
        .catch(err => console.log(err))
    });
    
    // add a review/rating to the book
    app.post('/api/books/review/:book',(req,res) =>{
        db.Review.create({
            content: req.body.content,
            rating: req.body.rating,
            UserId: req.body.user,
            BookId: req.params.book
        })
        .then(result => res.json(result))
        .catch(err => console.log(err))
    });

    //get the review/ratings for that book
    app.get('/api/books/review/:book', (req,res)=>{
        
        db.Review.findAll({
            where: {
                BookId: req.params.book
            },
            include: [db.User]
        }).then(result => res.json(result))
        
    })

    
    // recommendation function 
    
    app.get('/api/recommendationUser/:user',(req,res) =>{
        db.Reading.findAll({
            where:{
                UserID : req.params.user,
                favourite: true,
            },
            include: [db.Book]
        }).then(books => {
            let allBooks = books.map(book => book.BookId)
            // console.log(allBooks)
            db.Reading.findAll({
                where:{
                    BookId : allBooks,
                    favourite : 1,
                    UserID : {
                        [Op.ne] : req.params.user 
                    }
                }
            })
            .then(result =>{
                let allUsers = result.map(item => item.UserId);
                let uniqueUsers = [...new Set(allUsers)]
                console.log(uniqueUsers);
                db.Reading.findAll({
                    where:{
                        UserID : uniqueUsers,
                        BookId : {
                            [Op.ne] : allBooks
                        }
                    },
                    include: [db.Book]
                })
                .then(results => {
                    let Books = results.map(book => book.Book.isbn)
                    res.json(Books)
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
            include: [db.Book]
        }).then(books => {
            let allBooks = books.map(book => book.Book.title)
            shuffle(allBooks);
            recommendationTasteDiveArray(allBooks, data => {
                if(!data) {
                    res.status(500);
                }
                else {
                    // console.log(data.Similar.Results)
                    // res.json(data)
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
    

    app.get('/api/test', (req, res) => {
        let isbnArray = [];
                    let titles = ['Gone Girl','Sharp Objects']
                    console.log(titles)
                    findISNB(titles, isbnArray, data =>{
                        res.json(data)
                    })
        // recommendationNewYork('hardcover-fiction', data => {
        //     if(!data) {
        //         res.status(500);
        //     }
        //     else {
        //         res.json(data)
        //     }
        // })
        
    });


}