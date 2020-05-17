const express = require('express');
const router = express.Router();
const Book = require('../models/book')

router.get('/', async (req, res, next) => {
    let books = []
    try {
        books = await Book.find().sort({createdAt: 'desc'}).limit(10).exec();
    } catch {
        books = [];
    }
    console.log(books);
    res.render('index', { books: books });
});

module.exports = router;