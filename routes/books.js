const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// notice Book is a model CLASS
const Book = require('../models/book');
const Author = require('../models/author');
const uploadPath = path.join('public', Book.coverImageBasePath);
const imageMimeTypes = ['image/jepg', 'image/png', 'image/gif'];
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, cb) => {
        cb(null, imageMimeTypes);
    }
})

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
router.post('/', upload.single('cover'), async (req, res, next) => {
    const fileName = req.file != null ? req.file.filename : null;
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        converImageName: fileName,
        description: req.body.description
    })

    try {
        const newBook = await book.save();
        res.redirect('books');

    } catch {
        if(book.coverImageName) removeBookCover(book.coverImageName);
        renderNewPage(res, book, true);
    }
    
});

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err);
    })
}

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

module.exports = router;