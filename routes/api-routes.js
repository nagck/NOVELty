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
    if(book.trim() === "") {
        cb(false);
    }
    else{
        const url = `https://tastedive.com/api/similar?q=book:${book}&k=${apikey}&limit=10`;
        request(
            { 
                url: url 
            },
            (error, response, body) => {
                if (error || response.statusCode !== 200) {
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
        .then(data => cb(data))
        .catch(err => cb(false));
}

// function to get the list of titles and the array to store the isbn
// it is a recursive function to find all the corresponding isbn
const findISNB = (titles,isbnArray, cb) =>{

    if(titles.length == 0) cb(isbnArray);
    else{
        let title = titles.splice(0,1)[0];
        let url = "http://openlibrary.org/search.json?title=";
            fetch(encodeURI(url+title))
            .then(response => response.json())
            .then(data => {
                let books = data.docs;
                for(let i = 0; i < books.length; i++){
                    let book = books[i];
                    if(book.author_name !== undefined) {
                      if(book.cover_edition_key !== undefined){
                        // let works = book.key;
                        
                        isbnArray.push(book.cover_edition_key)
                        break;
                      }
                    }
                }
                findISNB(titles,isbnArray, cb);            
            })
            .catch(err=> {
                console.log(err)
                findISNB(titles,isbnArray, cb);  
            })   
    }
    
}

// convert isbn to open library id
const convertISBN = (ISBNArray,WorkArray, cb) =>{

    if(ISBNArray.length == 0) cb(WorkArray);
    else{
        let ISBN = ISBNArray.splice(0,1)[0];
        let url = `https://openlibrary.org/isbn/${ISBN}.json`;
            fetch(url)
            .then(response => response.json())
            .then(data => {
                let key = data.key.split("/")[2];
                WorkArray.push(key)
                convertISBN(ISBNArray,WorkArray, cb);            
            })
            .catch(err=> {
                console.log(err)
                convertISBN(ISBNArray,WorkArray, cb);  
            })     
    }
}

// function that takes a isbn, book title and a callback function
// it will search using the google api for the book information
const getBookInfoGoogle = (ISBN, title, cb) => {
    
    let url = `https://www.googleapis.com/books/v1/volumes?q=${ISBN}`;
    
    fetch(url)
    .then(response =>response.json())
    .then(data =>{
        let bookObj = {}
        for(let i = 0; i < Math.min(3, data.items.length); i++){
            let book = data.items[i].volumeInfo;
            let correctBook = title.toLowerCase().trim().includes(book.title.toLowerCase().trim()) || book.title.toLowerCase().trim().includes(title.toLowerCase().trim()) ; 
            if (!correctBook) console.log(`Sorry, the book with ISBN ${ISBN} could not be found.`);
            else{
                bookObj['author'] =book.authors;
                bookObj['description'] =book.description;
                bookObj['pageCount'] =book.pageCount;
                bookObj['title'] =book.title;
                break;
            }            
        } 
        cb(bookObj)
    })
    .catch(err =>{
      console.log(err)
      cb({})
    })
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
        console.log(req.user)
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
            res.redirect(307, "/api/login")
        })
        .catch((err) => {
            res.status(401).json(err);
        });
    });

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
    app.get('/api/books/user', (req,res) =>{
        db.Readings.findAll({
            where:{
                UserID : req.user.id
            },
            include: [db.Books]
        }).then(books => res.json(books))
        
    })

    // update a book to be completed
    app.put('/api/book/', (req,res) =>{
        db.Readings.update(
            {
                reading: false,
                favourite: req.body.favourite
            },{
            where : {
                UserId: req.user.id,
                BookId: req.body.bookId
            }
        }).then(result => {
            res.json(result)
        })
        .catch(err =>{
            console.log(err)
        })
    })

    // delete a book
    app.delete('/api/book/:book',(req,res) =>{
        db.Readings.destroy({
            where:{
                UserId: req.user.id,
                BookId: req.params.book
            }
        }).then(result => {
            res.json(result)
        })
        
    });
    // add a book in the data
    app.post('/api/book',(req,res)=>{
        db.Books.findOrCreate({
            where: {
                ISBN: req.body.isbn
            },
            defaults: {
                name: req.body.title,
                author: req.body.author,
                URL: `http://covers.openlibrary.org/b/OLID/${req.body.isbn}-M.jpg?default=false`
            }
        })
        .then(() =>{
            res.status(307).json({})
        })
        .catch(err => {
            res.status(401).json({err})
        })
    })

    // add a book to user
    app.post('/api/book/user',(req,res) =>{
        db.Readings.findOrCreate({
            where: {
                UserId:  req.user.id,
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
        .catch(err => console.log(err))
    })


    //get the latests review/ratings activity - community page
    app.get('/api/all-reviews', (req,res)=>{
        db.Reviews.findAll({
            include: [db.Users, db.Books],
            order: [["createdAt", "DESC"]],
            limit: 5
        }).then(result => res.json(result))
        .catch(err => console.log(err))
    });
    
    // add a review/rating to the book
    app.post('/api/books/review/:book',(req,res) =>{
        db.Reviews.create({
            content: req.body.content,
            rate: req.body.rating,
            UserId: req.user.id,
            BookId: req.params.book
        })
        .then(result => res.json(result))
        .catch(err => console.log(err))
    });

    //get the review/ratings for that book using ISBN
    app.get('/api/books/review/:isbn', (req,res)=>{ 
        db.Reviews.findAll({
            include: [
                {
                    model: db.Books, 
                    where: {
                        ISBN: req.params.isbn
                    },
                },
                {model: db.Users}
            ]   
        })
        .then(result => res.json(result))
        .catch(err => console.log(err))
    })

    //Routes to get the book recommendations from different sources 

    //find the books from other users back on your common interest
    app.get('/api/recommendationUser/',(req,res) =>{
        // first - find all the books that the user likes 
        db.Readings.findAll({
            where:{
                UserID : req.user.id,
                favourite: true,
            },
            include: [db.Books]
        }).then(results => {
            let allFavouriteBooks = results.map(book => book.BookId);
            // second - find all the users whose reading list have a common book 
            if(allFavouriteBooks.length != 0){
                db.Readings.findAll({
                    where:{
                        BookId : allFavouriteBooks,
                        favourite : 1,
                        UserID : {
                            [Op.ne] : req.user.id 
                        }
                    }
                })
                .then(results =>{
                    let allUsers = results.map(item => item.UserId);
                    let uniqueUsers = [...new Set(allUsers)];
                    // third - find all books under user
                    db.Readings.findAll({
                        where:{
                            UserID : req.user.id
                        }
                    })
                    .then(results => {
                        let allBooks = results.map(book => book.BookId);
                        // fourth - find all books that the other users have excluding books that user already has in their list
                        db.Readings.findAll({
                            where:{
                                UserID : uniqueUsers,
                                BookId : {
                                    [Op.notIn] : allBooks
                                }
                            },
                            include: [db.Books]
                        })
                        .then(results => {
                            let Books = results.map(book => book.Book.ISBN)
                            res.json(Books)
                        })
                    })
                    
                })
            }
            else {
                res.json([])
            }
        })
    })

    // required for api request for tastedive - resolve the cors problem
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        next();
    });

    // route for getting recommendation from tastedive api that call upon the function declared above
    app.get('/api/recommendationTD/',(req,res) =>{
        db.Readings.findAll({
            where:{
                UserID : req.user.id,
                favourite: true,
            },
            include: [db.Books]
        }).then(books => {
            let allBooks = books.map(book => book.Book.name)
            if(allBooks.length != 0){
                shuffle(allBooks);
                recommendationTasteDiveArray(allBooks, data => {
                    if(!data) {
                        res.json([]);
                    }
                    else {
                        let isbnArray = [];
                        let titles = data.Similar.Results.map(element => element.Name)
                        findISNB(titles, isbnArray, data =>{
                            res.json(data)
                        })
                    }
                })
            }
            else {
                res.json([])
            }
        })
    })

    // route for getting the books from the new york bestseller lists
    app.get('/api/recommendationNY/:genre',(req,res) =>{
        recommendationNewYork(req.params.genre, data => {
            if(!data) {
                res.status(500);
            }
            else {
                let isbnArray = data.results.map(result => {
                    return result.isbns[0].isbn13;
                })
                let workArray = [];
                // the new york time gives isbn - calls the function to convert to open library id
                convertISBN(isbnArray, workArray, cb =>{
                    res.json(cb)
                })
            }
        })
    })

    // api routes to get all titles from openlibrary api with unique authors
    app.get('/api/search/title/:title',(req,res) =>{
        
        let title = req.params.title;
        const url = "http://openlibrary.org/search.json?title=" + title;
        request(
            { 
                url: url 
            },
            (error, response, body) => {
                if (error || response.statusCode !== 200) {
                    console.error(error)
                    res.json([])
                }
                else{
                    let data = JSON.parse(body);
                    let bookList =[];
                    let titleUnique = [];
                    // let authorUnique = [];
                    data.docs.forEach(book => {
                        if(book.author_name !== undefined) {
                            if(book.cover_edition_key !== undefined) {
                                    if(titleUnique.indexOf(book.title.toLowerCase().trim())==-1) {
                                        let isbn = book.cover_edition_key;
                                        bookList.push({
                                            author: book.author_name,
                                            title: book.title,
                                            isbn: isbn
                                        });
                                    }
                                    titleUnique.push(book.title.toLowerCase().trim());
                            } 
                        }
                    })
                    let final = bookList.slice(0,Math.min(10, bookList.length));
                    res.json(final)   
                    
                }  
            } 
        )
    });

    // api routes to get all titles from openlibrary api with unique authors
    app.get('/api/search/author/:author',(req,res) =>{
        
        let author = req.params.author;
        const url = "http://openlibrary.org/search.json?author=" + author;
        request(
            { 
                url: url 
            },
            (error, response, body) => {
                if (error || response.statusCode !== 200) {
                    console.error(error);
                    res.json([])
                }
                else{
                    let data = JSON.parse(body);

                    let bookList =[];
                    let titleUnique = [];
                    data.docs.forEach(book => {
                      if(book.author_name !== undefined) {
                          if(book.cover_edition_key !== undefined) {
                                  if(titleUnique.indexOf(book.title.toLowerCase().trim())==-1) {
                                      let isbn = book.cover_edition_key;
                                      bookList.push({
                                          author: book.author_name,
                                          title: book.title,
                                          isbn: isbn
                                      });
                                  }
                                  titleUnique.push(book.title.toLowerCase().trim());
                          } 
                      }
                  })
                    let final = bookList.slice(0,Math.min(10, bookList.length));
                    res.json(final)   
                }  
            } 
        )
    })

    // routes to get the book information when the user clicked a book from the recommendation list
    app.get('/api/bookInfo/:isbn',(req,res) =>{
        let ISBN = req.params.isbn;
        let url = `https://openlibrary.org/api/books?bibkeys=OLID:${ISBN}&jscmd=details&format=json`
        fetch(url)
        .then(response => response.json())
        .then(data =>{
            let key = `OLID:${ISBN}`;
            let book = data[key].details;
            let bookObj = {};

            db.Reviews.findAll({
                include: [{
                    model: db.Books, 
                    where: {
                        ISBN: req.params.isbn
                    },
                },
                {model: db.Users}
            ]
            })
            .then(reviews => {
                let review = reviews.map(el =>{
                    return {
                        content: el.dataValues.content,
                        rate: el.dataValues.rate,
                        name: el.dataValues.User.name
                    }
                })
                let isbn = 0;
                if (book.isbn_13) isbn = book.isbn_13[0] 
                else if (book.isbn_10) isbn = book.isbn_10[0]
                getBookInfoGoogle(isbn,book.title, result =>{
                    if(Object.keys(result).length !== 0) {
                        bookObj = {... result, reviews: review};
                    }
                    else{
                        bookObj["author"] = (book.authors) ? book.authors.map(author => author.name) : "None available";
                        let description = (book.description) ? book.description : "None available";;
                        if(typeof book.description == "object") description = book.description.value
                        bookObj["pageCount"] = (book.number_of_pages) ? book.number_of_pages : "None available";
                        bookObj["title"] = book.title;
                        bookObj["description"] = description;
                        bookObj["reviews"] = review;
                    }
                    res.json(bookObj);
                })
            })
            .catch(err => console.log(err))
        })
    })
}
