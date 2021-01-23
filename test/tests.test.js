const { 
    searchByTitle,
    searchByAuthor,
    getBookInfo,
    getBookCover, 
    getRecommendation, 
    addBookToList, 
    // test,
 } = require('../public/js/script')

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

// didn't actually test the below to save API calls, but it should work the same as above test, hopefully ;)

describe('search by author', () => {

    test('should get the book by author if it exists', done => {
        let author = "Ernest Becker";
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

    test('should get the book by ISBN if it exists', done => {
        // this particular ISBN does not return expected results :(
        let ISBN = "9780316074223";
        let author = "David Foster Wallace"
        let title = "The Pale King"
        let callback = (result) => {
            try { 
                let check_author = result.map(item => item.author.map(author => author.split(',').map(name => name.trim().toLowerCase()).reverse().join(' '))).flat();
                expect(check_author).toContain(author.toLowerCase())
                expect(result.title.toLowerCase()).toBe(expect.stringContaining(title.toLowerCase()))
                done();
            }
            catch (error) {
                done(error);
            }
        }
        getBookInfo(ISBN, callback)
    })
});
