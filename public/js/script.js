
// Search function using the OpenLibrary API with the Book Title - must match
const searchByTitle = () =>{
    let title = "Life after life"; //to be change for user input
    let url = "http://openlibrary.org/search.json?title=";

    fetch(url+title)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        let bookList =[];
        let authorUnique = [];
        data.docs.forEach(book =>{
            console.log(book.author_name)
            if(book.author_name !== undefined) {
                if(book.title.toLowerCase() == title.toLowerCase()){
                    if(authorUnique.indexOf(book.author_key[0])==-1) {
                        bookList.push({
                            author: book.author_name,
                            title: book.title
                        });
                    }
                    authorUnique.push(book.author_key[0]);
                } 
            }
        })
        console.log(bookList)
    })
}

// Search function using the OpenLibrary API with author
const searchByAuthor = () =>{
    let author = "J. K. Rowling"; //to be change for user input
    let url = "http://openlibrary.org/search.json?author=";

    fetch(url+author)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        let bookList =[];
        let titleUnique = [];
        data.docs.forEach(book =>{
            console.log(book.author_name)
            if(book.author_name !== undefined) {
                if(titleUnique.indexOf(book.title)==-1) {
                    bookList.push({
                        author: book.author_name,
                        title: book.title
                    });
                }
                titleUnique.push(book.title);
            }
        })
        console.log(bookList)
    })
}



