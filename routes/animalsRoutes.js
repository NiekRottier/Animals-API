const e = require('express');
let express = require('express');
let Animal = require('../models/animalModel');

let routes = function() {

    let animalRouter = express.Router();

    // Routes for animals collection resource (/api/animals)
    animalRouter.route('/animals')
        // GET request
        .get(function (req, res){
            console.log("GET on api/animals");

            // Find all the animals
            Animal.find({}, function (err, animals) {
                if (err) {
                    res.status(500).send(err);
                }
                else if (req.get('Accept') != "application/json") {
                    res.status(422).send();
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

        // POST request
        .post(function(req, res) {
            console.log("POST on api/animals");
            
            // Give Accept header to response
            res.header("Accept", "application/json, application/x-www-form-urlencoded");

            // Check if the request is json
            if (!req.is('application/json', 'application/x-www-form-urlencoded')) {
                res.status(406).send();
            }
            else
            {
                // Check if req.body is empty
                if (Object.keys(req.body).length === 0){
                    res.status(422).send()
                } 
                else
                {
                    // Create new row with information from request body 
                    let animal = new Animal(req.body);

                    animal.save(function (err) {
                        if (err) { 
                            res.status(400).send(err) 
                        }
                        else 
                        { 
                            res.status(201).send(animal) 
                        }
                    });
                }
            }
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

        // PUT request
        .put(function(req, res) {
            console.log(`PUT on api/animals/${req.params.animalId}`);

            // Find all the animals with the given id
            Animal.find({_id : req.params.animalId}, function (err, animal) {

                // Give Accept header to response
                res.header("Accept", "application/json, application/x-www-form-urlencoded");

                if (err) {
                    res.status(400).send(err);
                } 
                // Check if the request is json. If not give a 406 error
                else if (!req.is('application/json', 'application/x-www-form-urlencoded')) {
                    res.status(406).send();
                }
                else 
                {

                    let animalItem = animal[0];

                    // Check if req.body is empty
                    if (Object.keys(req.body).length === 0){
                        res.status(422).send()
                    } 
                    else 
                    {
                        if (req.body.name){
                            animalItem.name = req.body.name;
                        }
                        if (req.body.age){
                            animalItem.age = req.body.age;
                        }
                        if (req.body.animal){
                            animalItem.animal = req.body.animal;
                        }
                        if (req.body.diet){
                            animalItem.diet = req.body.diet;
                        } 

                        // Save the editted row
                        animalItem.save();

                        res.send(animalItem);
                    }
                }
            })           
        })

        // OPTIONS request
        .options(function(req, res) {
            console.log(`OPTIONS on api/animals/${req.params.animalId}`);

            res.header("Allow", "GET,PUT,OPTIONS").send();
        });


    return animalRouter;
};

module.exports = routes;