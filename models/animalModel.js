let mongoose = require('mongoose');

let Schema = mongoose.Schema;

// Strings only!
let animalModel = new Schema({
    name: { 
        type: String,
        required: true,
    },
    age: { 
        type: String,
        required: true,
    },
    animal: { 
        type: String,
        required: true,
    },
    diet: { 
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Animal', animalModel);