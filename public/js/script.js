
// Search function using the OpenLibrary API with the Book Title - must match   - used when user wants to add a book that they have already read 
const searchByTitle = (title,cb) =>{
    // let title = "Life after life"; //to be change for user input
    let url = "http://openlibrary.org/search.json?title=";

    fetch(url+title)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        let bookList =[];
        let authorUnique = [];
        data.docs.forEach(book =>{
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
        })
        console.log(bookList);
        cb(bookList)
    })
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
                    if(book.title.toLowerCase() == title.toLowerCase()){
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
            }
        })
        console.log(bookList);
        cb(bookList)
    })
}

// Get New Book information from the ISBN - possibly be used when user clicks on a book recommendation
const getBookInfo = (ISBN, cb) =>{
        
    let url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${ISBN}`;
    
    fetch(url)
    .then(response =>response.json())
    .then(data =>{
        console.log(data);
        let book = data.items[0].volumeInfo;
        let bookObj = {
            author: book.authors,
            description: book.description,
            pageCount : book.pageCount,
            title: book.title
        }
        console.log(bookObj)
        cb(bookObj);
    })
}


