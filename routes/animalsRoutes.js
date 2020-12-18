let express = require('express');
let Animal = require('../models/animalModel');

let routes = function() {

    let animalRouter = express.Router();

    // Routes for animals collection resource (/api/animals)
    animalRouter.route('/animals')
        // GET request
        .get(function (req, res){
            console.log("GET on api/animals");

            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

            // Find all the animals
            Animal.find({}, function (err, animals) {
                if (err) {
                    res.status(500).send(err);
                }
                else if (!req.header('Accept').includes("application/json") && !req.header('Accept').includes("text/html")) {
                    res.status(422).send("422 - Unprocessable Entity");
                }
                else 
                {
                    // Maths for pagination
                    let limit = 3;

                    let totalItems = animals.length;
                    let totalPages = Math.ceil(totalItems / limit); 

                    let currentPage = 1;
                    if (req.params.page){ currentPage = req.params.page }
                    
                    let currentItems;
                    if (currentPage === totalPages) {
                        currentItems = totalItems - ((totalPages-1) * limit);
                    }
                    else
                    {
                        currentItems = limit;
                    }
                    

                    function previousPage() {
                        if (currentPage === 1) {
                            return totalPages
                        }
                        else
                        {
                            return currentPage--
                        }
                    }

                    function nextPage() {
                        if (currentPage === totalPages) {
                            return 1
                        }
                        else
                        {
                            return currentPage++
                        }
                    }

                    // Create a variable to put the collection in
                    let animalsCollection = {
                        "items" : [],
                        "_links" : {
                            "self" : { "href" : `http://${req.headers.host}/api/animals` },
                            "collection" : { "href" : `http://${req.headers.host}/api/animals` }
                        },
                        "pagination": {
                            "currentPage" : currentPage,
                            "currentItems" : currentItems,
                            "totalPages" : totalPages,
                            "totalItems" : totalItems,
                            "_links" : {
                                "first" : {
                                    "page" : 1,
                                    "href" : `http://${req.headers.host}/api/animals?page=1`
                                },
                                "last" : {
                                    "page" : 1,
                                    "href" : `http://${req.headers.host}/api/animals?page=${totalPages}`
                                },
                                "previous" : {
                                    "page" : 1,
                                    "href" : `http://${req.headers.host}/api/animals?page=${previousPage()}`
                                },
                                "next" : {
                                    "page" : 1,
                                    "href" : `http://${req.headers.host}/api/animals?page=${nextPage()}`
                                }
                            } 
                        }
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
            
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

            // Give Accept header to response
            res.header("Accept", "application/json, application/x-www-form-urlencoded");

            // Check if the request is json
            if (!req.is('application/json', 'application/x-www-form-urlencoded')) {
                res.status(406).send("406 - Not Acceptable");
            }
            else
            {
                // Check if req.body is empty
                if (Object.keys(req.body).length === 0){
                    res.status(422).send("422 - Unprocessable Entity")
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
                            res.status(201).json(animal) 
                        }
                    });
                }
            }
        })

        // OPTIONS request
        .options(function (req, res){
            console.log("OPTIONS on api/animals");  
            
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

            res.header("Allow", "GET,POST,OPTIONS");
            res.header("Access-Control-Allow-Methods", "GET,PUT,DELETE,OPTIONS");
            res.send();
        });

    // Routes for animals detail resource (/api/animals/:animalId)
    animalRouter.route('/animals/:animalId')
        // GET request
        .get(function(req, res) {
            console.log(`GET on api/animals/${req.params.animalId}`);   

            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

            // Find all the animals with the given id
            Animal.findById(req.params.animalId, function (err, animal) {
                if (err) {
                    res.status(400).send(err);
                }
                else 
                {
                    let animalDetails = {
                        "item" : animal,
                        "_links" : {
                            "self" : { "href" : `http://${req.headers.host}/api/animals/${animal._id}` },
                            "collection" : { "href" : `http://${req.headers.host}/api/animals` }
                        },
                        "pagination" : { "message" : "WIP" }
                    };

                    res.json(animalDetails);
                }
            }).orFail()
        })

        // PUT request
        .put(function(req, res) {
            console.log(`PUT on api/animals/${req.params.animalId}`);

            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

            // Find the animal with the given id
            Animal.findById(req.params.animalId, function (err, animal) {

                // Give Accept header to response
                res.header("Accept", "application/json, application/x-www-form-urlencoded");

                if (err) {
                    res.status(400).send(err);
                } 
                // Check if the request is json. If not give a 406 error
                else if (!req.is('application/json', 'application/x-www-form-urlencoded')) {
                    res.status(406).send("406 - Not Acceptable");
                }
                else 
                {
                    // Check if req.body is empty
                    if (Object.keys(req.body).length === 0){
                        res.status(422).send("422 - Unprocessable Entity")
                    } 
                    else 
                    {
                        if (req.body.name){
                            animal.name = req.body.name;
                        }
                        if (req.body.age){
                            animal.age = req.body.age;
                        }
                        if (req.body.animal){
                            animal.animal = req.body.animal;
                        }
                        if (req.body.diet){
                            animal.diet = req.body.diet;
                        } 

                        // Save the editted row
                        animal.save();

                        res.json(animal);
                    }
                }
            }).orFail()           
        })

        // DELETE request
        .delete(function(req, res) {
            console.log(`DELETE on api/animals/${req.params.animalId}`);

            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

            Animal.findOneAndDelete({_id : req.params.animalId}, function (err, animal) {
                if (err) {
                    res.status(400).send(err);
                }
                else
                {
                    res.status(204).json(animal);
                }
            }).orFail()
        })

        // OPTIONS request
        .options(function(req, res) {
            console.log(`OPTIONS on api/animals/${req.params.animalId}`);

            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            
            res.header("Allow", "GET,PUT,DELETE,OPTIONS");
            res.header("Access-Control-Allow-Methods", "GET,PUT,DELETE,OPTIONS");
            res.send();
        });


    return animalRouter;
};

module.exports = routes;