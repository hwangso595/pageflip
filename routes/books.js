const express = require('express');
const router = express.Router();
// notice Book is a model CLASS
const Book = require('../models/book');
const Author = require('../models/author');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

// All books route
router.get('/', async (req, res, next) => {
    let query = Book.find();
    if(req.query.title) {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(req.query.publishedBefore) {
        query = query.lte('publishedDate', req.query.publishedBefore);
    }
    if(req.query.publishedAfter) {
        query = query.gte('publishedDate', req.query.publishedAfter);
    }
    try {
        const books = await query.exec();
        console.log(books);
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch {

    }
    
});

// New book route
router.get('/new', async (req, res, next) => {
    renderNewPage(res, new Book())
});

// Create book route
router.post('/', async (req, res, next) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    });
    saveCover(book, req.body.cover);

    try {
        const newBook = await book.save();
        
        res.redirect('/books');

    } catch (error) {
        console.log(error);
        renderNewPage(res, book, true);
    }
    
});

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = 'Error Creating Book'
        res.render('books/new', params);

    } catch {
        res.redirect('/books');
    }
}

function saveCover(book, coverEncoded) {
    if(coverEncoded == null) return;
    const cover = JSON.parse(coverEncoded)
    if(cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    } 
}

module.exports = router;