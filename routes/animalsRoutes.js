let express = require('express');
let Animal = require('../models/animalModel');

let routes = function() {

    let animalRouter = express.Router();

    // Routes for animals collection resource (/api/animals)
    animalRouter.route('/animals')
        // POST request
        .post(function(req, res) {
            console.log("POST on api/animals");
            
            // Create new row with information from request body 
            let animal = new Animal(req.body);

            animal.save(function (err) {
                res.status(201).send(animal);
            });
        })

        // GET request
        .get(function (req, res){
            console.log("GET on api/animals");

            // Find all the animals
            Animal.find({}, function (err, animals) {
                if (err) {
                    res.status(500).send(err);
                }
                else 
                {
                    // Create a variable to put the collection in
                    let animalsCollection = {
                        "items" : [],
                        "_links" : {
                            "self" : { "href" : `http://${req.headers.host}/api/animals` },
                            "collection" : { "href" : `http://${req.headers.host}/api/animals` }
                        },
                        "pagination": { "message" : "WIP" }
                    }

                    for(let animal of animals) {
                        // Translate to Json (so we can edit it)
                        let animalItem = animal.toJSON();

                        // Make a new thingy called _links in animalItem
                        animalItem._links = {
                            "self" : { "href" : `http://${req.headers.host}/api/animals/${animalItem._id}` },
                            "collection" : { "href" : `http://${req.headers.host}/api/animals` }
                        },

                        // Add animalItem to the collection 
                        animalsCollection.items.push(animalItem)
                    }

                    // Return the collection as Json
                    res.json(animalsCollection);
                }
            })
        })

        // OPTIONS request
        .options(function (req, res){
            console.log("OPTIONS on api/animals");  
            res.header("Allow", "GET,POST,OPTIONS").send();
        });

    // Routes for animals detail resource (/api/animals/:animalId)
    animalRouter.route('/animals/:animalId')
        // GET request
        .get(function(req, res) {
            console.log(`GET on api/animals/${req.params.animalId}`);   

            // Find all the animals with the given id
            Animal.find({_id : req.params.animalId}, function (err, animal) {
                if (err) {
                    res.status(400).send(err);
                }
                else 
                {
                    let animalDetails = {
                        "item" : animal[0],
                        "_links" : {
                            "self" : { "href" : `http://${req.headers.host}/api/animals/${animal[0]._id}` },
                            "collection" : { "href" : `http://${req.headers.host}/api/animals` }
                        },
                        "pagination" : { "message" : "WIP" }
                    };

                    res.json(animalDetails);
                }
            })
        })

        // OPTIONS request
        .options(function(req, res) {
            console.log(`OPTIONS on api/animals/${req.params.animalId}`);
            res.header("Allow", "GET,OPTIONS");
            res.send();
        });


    return animalRouter;
};

module.exports = routes;