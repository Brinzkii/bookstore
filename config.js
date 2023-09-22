/** Common config for bookstore. */

const DB_URI = process.env.NODE_ENV === 'test' ? 'books-test' : 'books';

module.exports = { DB_URI };
