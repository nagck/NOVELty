// const fetch = require("node-fetch");

// Search function using the OpenLibrary API with the Book Title - must match   - used when user wants to add a book that they have already read 
const searchByTitle = (title,cb) => {
    // let title = "Life after life"; //to be change for user input
    let url = "http://openlibrary.org/search.json?title=";

    fetch(url+title)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        let bookList =[];
        let authorUnique = [];
        data.docs.forEach(book => {
            console.log(book)
            if(book.author_name !== undefined) {
                if(book.isbn !== undefined) {
                    if(book.title.toLowerCase() == title.toLowerCase()){
                        if(authorUnique.indexOf(book.author_name[0].toLowerCase().trim())==-1) {
                            let isbn = book.edition_key[0];
                            // if(book.id_alibris_id) isbn = book.id_alibris_id[0];
                            // else{
                            //     for(let i = 0; i < book.isbn.length; i++){
                            //         if(book.isbn[i].startsWith('9780')) {
                            //             isbn = book.isbn[i];
                            //         }
                            //     }
                            // }  
                            bookList.push({
                                author: book.author_name,
                                title: book.title,
                                isbn: isbn
                            });
                        }
                        authorUnique.push(book.author_name[0].toLowerCase().trim());
                        console.log(authorUnique)
                    }
                } 
            }
            cb(bookList.slice(0,Math.min(10, bookList.length)))
        })
    });
}

// Search function using the OpenLibrary API with author - used when user wants to add a book that they have already read 
const searchByAuthor = (author, cb) => {
    // let author = "J. K. Rowling"; //to be change for user input
    let url = "http://openlibrary.org/search.json?author=";

    fetch(url+author)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        let bookList =[];
        let titleUnique = [];
        data.docs.forEach(book =>{
            if(book.author_name !== undefined) {
                if(book.isbn !== undefined) {
                    if(titleUnique.indexOf(book.title.toLowerCase().trim())==-1) {
                        let isbn = book.edition_key[0];
                        // if(book.id_alibris_id) isbn = book.id_alibris_id[0];
                        // else{
                        //     for(let i = 0; i < book.isbn.length; i++){
                        //         if(book.isbn[i].startsWith('9780')) {
                        //             isbn = book.isbn[i];
                        //         }
                        //     }
                        // }  
                        console.log(book)
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
        // console.log(bookList);
        cb(bookList.slice(0,Math.min(10, bookList.length)))
    })
}

// Get New Book information from the ISBN - possibly to be used when user clicks on a book recommendation
const getBookInfo = (ISBN, cb) =>{
        
    let url = `https://www.googleapis.com/books/v1/volumes?q=ISBN:${ISBN}`;
    
    fetch(url)
    .then(response =>response.json())
    .then(data =>{
        // console.log(data);
        let book = data.items[0].volumeInfo;

        // added this bit of code to catch if the Google API does not get the correct book from the ISBN
        // this will also catch if the book with a specific ISBN just does not exist
        let correctBook = ISBN === book.industryIdentifiers.find(ISBN => ISBN.type === "ISBN_13").identifier;
        if (!correctBook) {
            console.log(`Sorry, the book with ISBN ${ISBN} could not be found.`) 
            throw new Error (`Sorry, the book with ISBN ${ISBN} could not be found.`);
        } 

        let bookObj = {
            author: book.authors,
            description: book.description,
            pageCount : book.pageCount,
            title: book.title
        }
        console.log(ISBN)
        fetch(`/api/books/review/${ISBN}`)
        .then(response => response.json())
        .then(review => {
            console.log(review)
            bookObj.reviews = review;
            cb(bookObj);
        })
    })
    .catch(error => {
        // Where the code goes for if the ISBN is not found.
        if (error.message === `Sorry, the book with ISBN ${ISBN} could not be found.`) {
           // do stuff if the ISBN is not found here"
           getBookInfoAlternative(ISBN, cb)
        }
    })
}

// get alternative book:
const getBookInfoAlternative = (ISBN, cb) =>{

    let url = `https://openlibrary.org/api/books?bibkeys=ISBN:${ISBN}&jscmd=details&format=json`
    fetch(url)
    .then(response => response.json())
    .then(data =>{
        console.log(data)
        let key = `ISBN:${ISBN}`;
        let book = data[key].details;
        let authors = book.authors.map(author => author.name);
        let description = (book.description) ? book.description : "None available";
        if(typeof description === Object) description = description.value
        let pageCount = (book.pagination) ? book.pagination : "None available"
        let bookObj = {
            author: authors,
            description: description,
            pageCount : pageCount,
            title: book.title
        }
        console.log(bookObj);
        fetch(`/api/books/review/${ISBN}`)
        .then(response => response.json())
        .then(review => {
            console.log(review)
            bookObj.reviews = review;
            cb(bookObj);
        })
    })
}

// get alternative book:
const getBookInfoWorks = (ISBN, cb) =>{

    let url = `https://openlibrary.org/api/books?bibkeys=OLID:${ISBN}&jscmd=details&format=json`
    fetch(url)
    .then(response => response.json())
    .then(data =>{
        console.log(data)
        let key = `OLID:${ISBN}`;
        let book = data[key].details;
        let authors = (book.authors) ? book.authors.map(author => author.name) : "None available";
        let description = (book.description) ? book.description : "None available";;
        if(typeof book.description == "object") description = book.description.value
        let pageCount = (book.number_of_pages) ? book.number_of_pages : "None available"
        let bookObj = {
            author: authors,
            description: description,
            pageCount : pageCount,
            title: book.title
        }
        console.log(bookObj);
        fetch(`/api/books/review/${ISBN}`)
        .then(response => response.json())
        .then(review => {
            console.log(review)
            bookObj.reviews = review;
            cb(bookObj);
        })
    })
}


// get the book cover url
const checkBookCover = (ISBNarray, validISBN, cb) =>{
    if(ISBNarray.length === 0) cb(validISBN)
    else{
        let ISBN = ISBNarray.splice(0,1)[0];
        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        let url = `http://covers.openlibrary.org/b/isbn/${ISBN}-M.jpg?default=false`
        fetch(proxyurl+url)
        .then(response => {
            // console.log(response)
            if(response.status === 404) throw new Error("book cover doesn't exist")
            else{
                validISBN.push(ISBN)
                checkBookCover(ISBNarray,validISBN, cb)
            }
        })
        .catch(err => {
            console.log(err)
            checkBookCover(ISBNarray,validISBN, cb);
        })
    }
    
}

// get the book cover url
const getBookCover = (ISBN, cb) =>{
    // return `http://covers.openlibrary.org/b/isbn/${ISBN}-M.jpg?default=false`
    return `http://covers.openlibrary.org/b/OLID/${ISBN}-M.jpg?default=false`
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

const getRecommendation = (cb) =>{
    
    Promise.all([
        fetch(`/api/recommendationUser/`),
        fetch(`/api/recommendationTD/`), 
        // fetch(`/api/recommendationNY/hardcover-fiction`),
        
    ]).then(function (responses) {
        // Get a JSON object from each of the responses
        return Promise.all(responses.map(function (response) {
            return response.json();
        }));
    }).then(function (data) {
        // Log the data to the console
        // You would do something with both sets of data here
        let allISBN = [];
        for(let i = 0; i < data.length; i++){
            data[i].forEach(el => allISBN.push(el));
        }
        let uniqueISBN = [...new Set(allISBN)];
        // console.log(uniqueISBN)
        fetch(`/api/books/user`)
        .then(response =>response.json())
        .then(results =>{
            let existingBooks = results.map(book => book.Book.ISBN);
            let finalISBN = uniqueISBN.filter(el => existingBooks.indexOf(el) === -1);
            cb(shuffle(finalISBN))
            // let validISBN = []
            // checkBookCover(finalISBN,validISBN,arr =>{
            //     cb(shuffle(arr));
            // })            
        })

        
    }).catch(function (error) {
        // if there's an error, log it
        console.log(error);
    })
}

// function to add a new book under the user
// reading is a boolean
// bookObj will need to have the format 
//{
    // title:
    // author:
    // isbn:
//}
//the returned data will be the book information
const addBookToList = (bookObj,reading,cb) => {
    // add book to database if not already exists
    fetch(`/api/book`, {
        method: 'POST',
        headers: {
            'content-type' : 'application/json',
            'accept':'application/json'
        },
        body: JSON.stringify(bookObj)
    })
    // get the book id from the isbn
    .then(() =>{
        fetch(`/api/book/${bookObj.isbn}`)
        .then(response => response.json())
        .then(data => {
                
            let bookObj2 = {
                id: data[0].id,
                favourite: true,
                reading: reading 
            }

            // add book to user in the ReadingBooks table
            fetch(`/api/book/user`,{
                method:'POST',
                headers: {
                    'content-type' : 'application/json',
                    'accept':'application/json'
                },
                body: JSON.stringify(bookObj2)
            })
            .then(response => {
                console.log(response)
                return response.json()
            })
            .then(notExists=>{
                cb(notExists, data);
            })
            .catch(err => console.log(err))
        })
    })
}

module.exports = { 
    searchByTitle, 
    searchByAuthor, 
    getBookInfo, 
    getBookCover, 
    getRecommendation, 
    addBookToList, 
}


