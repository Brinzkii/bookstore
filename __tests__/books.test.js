process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testBook, newBook;

beforeEach(async () => {
	let book = {
		isbn: '0691161518',
		amazon_url: 'http://a.co/eobPtX2',
		author: 'Matthew Lane',
		language: 'english',
		pages: 264,
		publisher: 'Princeton University Press',
		title: 'Power-Up: Unlocking the Hidden Mathematics in Video Games',
		year: 2017,
	};

	let result = await db.query(
		`INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING isbn, amazon_url, author, language, pages, publisher, title, year`,
		[book.isbn, book.amazon_url, book.author, book.language, book.pages, book.publisher, book.title, book.year]
	);

	testBook = result.rows[0];
	newBook = {
		isbn: '1338878921',
		amazon_url: 'https://www.amazon.com/Harry-Potter-Sorcerers-Stone-Rowling/dp/059035342X.co/eobPtX2',
		author: 'J.K. Rowling',
		language: 'english',
		pages: 309,
		publisher: 'Scholastic',
		title: "Harry Potter and the Sorcerer's Stone",
		year: 1998,
	};
});

afterEach(async () => {
	await db.query(`DELETE FROM books`);
});

afterAll(async () => {
	await db.end();
});

/** GET /books - returns {books: [book, ...]} */

describe('GET /books', () => {
	test('Gets a list of all books', async () => {
		const response = await request(app).get('/books');

		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({ books: [testBook] });
	});
});

/** GET /books/:id - returns {book: book} */

describe('GET /books/:id', () => {
	test('Gets a list of all books', async () => {
		const response = await request(app).get('/books/0691161518');

		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({ book: testBook });
	});

	test('Gets a list of all books', async () => {
		const response = await request(app).get('/books/1');

		expect(response.statusCode).toEqual(404);
		expect(response.body.message).toEqual("There is no book with an isbn '1");
	});
});

/** POST /books - returns {book: newBook} */

describe('POST /books', () => {
	test('Creates a new book', async () => {
		const response = await request(app).post('/books').send(newBook);

		expect(response.statusCode).toEqual(201);
		expect(response.body).toEqual({ book: newBook });
	});

	test('Returns error if isbn missing', async () => {
		delete newBook.isbn;
		const response = await request(app).post('/books').send(newBook);

		expect(response.statusCode).toEqual(400);
		expect(response.body.message).toEqual([`instance requires property \"isbn\"`]);
	});

	test('Returns 400 if pages < 1', async () => {
		newBook.pages = 0;
		const response = await request(app).post('/books').send(newBook);

		expect(response.statusCode).toEqual(400);
		expect(response.body.message).toEqual([`instance.pages must be strictly greater than 0`]);
	});

	test('Returns 400 if year > current', async () => {
		newBook.year = 2024;
		const response = await request(app).post('/books').send(newBook);

		expect(response.statusCode).toEqual(400);
		expect(response.body.message).toEqual([`instance.year must be less than or equal to 2023`]);
	});
});
