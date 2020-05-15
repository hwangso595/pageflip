const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})
//exports a model class named Author
module.exports = mongoose.model('Author', authorSchema);