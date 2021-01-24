// const fetch = require("node-fetch");

// Search function using the OpenLibrary API with the Book Title - must match   - used when user wants to add a book that they have already read 
const searchByTitle = (title,cb) => {
    // let title = "Life after life"; //to be change for user input
    let url = "http://openlibrary.org/search.json?title=";

    fetch(url+title)
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        let bookList =[];
        let authorUnique = [];
        data.docs.forEach(book => {
            if(book.author_name !== undefined) {
                if(book.isbn !== undefined) {
                    if(book.title.toLowerCase() == title.toLowerCase()){
                        if(authorUnique.indexOf(book.author_key[0])==-1) {
                            let isbn = book.isbn[0];
                            for(let i = 0; i < book.isbn.length; i++){
                                if(book.isbn[i].startsWith('9780')) {
                                    isbn = book.isbn[i];
                                }
                            }
                            bookList.push({
                                author: book.author_name,
                                title: book.title,
                                isbn: isbn
                            });
                        }
                        authorUnique.push(book.author_key[0]);
                    }
                } 
            }
        cb(bookList)
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
        // console.log(data);
        let bookList =[];
        let titleUnique = [];
        data.docs.forEach(book =>{
            if(book.author_name !== undefined) {
                if(book.isbn !== undefined) {
                    if(titleUnique.indexOf(book.title)==-1) {
                        let isbn = book.isbn[0];
                        for(let i = 0; i < book.isbn.length; i++){
                            if(book.isbn[i].startsWith('9780')) {
                                isbn = book.isbn[i];
                            }
                        }
                        bookList.push({
                            author: book.author_name,
                            title: book.title,
                            isbn: isbn
                        });
                    }
                    titleUnique.push(book.title);
                } 
            }
        })
        // console.log(bookList);
        cb(bookList)
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
        console.log(bookObj)
        cb(bookObj);
    })
    .catch(error => {
        // Where the code goes for if the ISBN is not found.
        if (error.message === `Sorry, the book with ISBN ${ISBN} could not be found.`) {
           // do stuff if the ISBN is not found here"
        }
    })
}

// get the book cover url
const getBookCover = (ISBN) =>{
    return `http://covers.openlibrary.org/b/isbn/${ISBN}-M.jpg`
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
        fetch(`/api/recommendationNY/hardcover-fiction`),
        
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
        localStorage.setItem('recommendations', JSON.stringify(uniqueISBN));
        cb(shuffle(uniqueISBN));

        
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
const addBookToList = (bookObj,reading,user_id,cb) => {
    // add book to database if not already exists
    fetch(`/api/books`, {
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
            fetch(`/api/books/${user_id}`,{
                method:'POST',
                headers: {
                    'content-type' : 'application/json',
                    'accept':'application/json'
                },
                body: JSON.stringify(bookObj2)
            })
            .then(response => response.json())
            .then(notExists=>{
                cb(notExists, data);
            })
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


