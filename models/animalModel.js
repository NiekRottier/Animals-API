let mongoose = require('mongoose');

let Schema = mongoose.Schema;

// Strings only!
let animalModel = new Schema(
    {
        name: { type: String },
        age: { type:String },
        animal: { type:String },
        diet: { type:String },
    }
);

module.exports = mongoose.model('Animal', animalModel);