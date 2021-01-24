// The following functions test the API calls in the public/js/script.js file
const { 
    searchByTitle,
    searchByAuthor,
    getBookInfo,
    getBookCover, 
    getRecommendation, 
    addBookToList, 
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

        let ISBN = "9780007173112";
        let author = "Dr. Seuss"
        let title = "The Lorax"
        let callback = (result) => {
            try { 
                // flips the authors' name to first last and converts to lower case
                let check_author = result.author.map(author => author.split(',').map(name => name.trim().toLowerCase()).reverse().join(' '));
                expect(check_author).toContain(author.toLowerCase())
                expect(result.title.toLowerCase()).toBe(title.toLowerCase())
                done();
            }
            catch (error) {
                done(error);
            }
        }
        getBookInfo(ISBN, callback)
    })
});

describe('get book cover link', () => {

    it('should get the link to a book cover for a given ISBN if it exists', () => {
        // this particular ISBN does not return expected results :(
        let ISBN = "9780316074223";
        result = getBookCover(ISBN)
        expect(result).toBe("http://covers.openlibrary.org/b/isbn/9780316074223-M.jpg")
    })
});
