import { GroupsController } from "./controllers/GroupsController";
import { ChildrenController } from "./controllers/ChildrenController";
import { UsersController } from "./controllers/UsersController";
import { FoodSleepController } from "./controllers/FoodSleepController";

import * as mysql from "mysql";
import express = require("express");
import jwt = require("jsonwebtoken");


//const express = 
const app = express();
const port = 8080; // default port to listen
app.use(express.json());
app.set('json spaces', 2);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});



//connect o mysql

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'tamagotchi',
    password: 'Mahacskin13',
    database: 'tamagotchi'
});

connection.connect((err: any) => {
    if (err) throw err;
    console.log('Connected!');
    GroupsController(app, connection);
    ChildrenController(app, connection);
    UsersController(app, connection);
    FoodSleepController(app, connection);
});


// define a route handler for the default home page
app.get("/", (req: any, res: any) => {
    res.send("Hello world!");
});

app.post('/login', (req, res) => {

    // jwt.sign();

});


// Queries example
// SELECT * FROM tamagotchi.children;
// INSERT INTO children (name, parent_id, group_id) VALUES ( 'Flavius', 3, 3 )
// DELETE FROM children WHERE pk=4;
// UPDATE children SET name= 'Flavi' WHERE pk=4

// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});

