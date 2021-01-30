// These are the functions we'll be testing

// Search function using the OpenLibrary API with the Book Title - must match   - used when user wants to add a book that they have already read 
const searchByTitle = (title,cb) => {
  fetch(`/api/search/title/${title}`)
  .then(response => response.json())
  .then(data => cb(data))
  .catch(err => console.log(err))
}

// Search function using the OpenLibrary API with author - used when user wants to add a book that they have already read 
const searchByAuthor = (author, cb) => {
  fetch(`/api/search/author/${author}`)
  .then(response => response.json())
  .then(data => cb(data))
  .catch(err => console.log(err))
}

// get book info:
const getBookInfoWorks = (ISBN, cb) =>{
  fetch(`/api/bookInfo/${ISBN}`)
  .then(response => response.json())
  .then(data => cb(data))
}

// get the book cover url
const getBookCover = (ISBN, cb) =>{
  return `http://covers.openlibrary.org/b/OLID/${ISBN}-M.jpg?default=false`
}

// mock data that I had to use
const data = [{"author":["Stephen King"],"title":"Carrie","isbn":"OL24876352M"},{"author":["Cameron Dokey"],"title":"Carrie","isbn":"OL7434708M"},{"author":["Dorothy Lyons"],"title":"Carrie","isbn":"OL9582671M"},{"author":["Edith Elizabeth Pollitz"],"title":"Carrie","isbn":"OL11723968M"},{"author":["Shari Fuller"],"title":"Carrie","isbn":"OL27773790M"},{"author":["Alice N. Raltson"],"title":"Carrie","isbn":"OL10467554M"}]

// this is to ensure that we use node-fetch for testing and
// regular fetch for the js
// apparently there there is something called cross-fetch too

// saves fetch so we can use it later
const unmockedFetch = global.fetch


// before all, use do this, so we can use our `fake` data
beforeAll(() => {
  global.fetch = () =>
    Promise.resolve({
      json: () => Promise.resolve(data),
    })
})

// after all, return to using regular fetch 
afterAll(() => {
  global.fetch = unmockedFetch
})

// This is the actual testing suite
describe('search by title', () => {

  test('should get the book by title if it exists', done => {
      let title = "Carrie";
      let callback = (result) => {
          try { 
              expect(result.map(book => book.title)).toContain(title)
              done();
          }
          catch (error) {
              done(error);
          }
      }
      searchByTitle(title, callback)
  })
});

describe('search by author', () => {

  test('should get the book by author if it exists', done => {
      let author = "Stephen King";
      let callback = (result) => {
          try { 
              expect(result.map(book => book.author[0])).toContain(author)
              done();
          }
          catch (error) {
              done(error);
          }
      }
      searchByAuthor(author, callback)
  })
});

describe('search by ISBN', () => {

  test('should get the book by book id if it exists', done => {

      let ISBN = "OL24876352M";
      let author = "Stephen King"
      let title = "Carrie"
      let callback = (result) => {
          try { 
              // gets authors and book titles respectively
              let check_author = result.map(book => book.author[0]);
              let check_title = result.map(book => book.title);
              expect(check_author).toContain(author)
              expect(check_title).toContain(title)
              done();
          }
          catch (error) {
              done(error);
          }
      }
      getBookInfoWorks(ISBN, callback)
  })
});

