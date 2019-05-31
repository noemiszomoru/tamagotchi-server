import { GroupsController } from "./controllers/GroupsController";
import { ChildrenController } from "./controllers/ChildrenController";
import { UsersController } from "./controllers/UsersController";
import { FoodSleepController } from "./controllers/FoodSleepController";
import { LoginController } from "./controllers/LoginController";

import * as mysql from "mysql";
import express = require("express");
import bodyParser = require("body-parser");
import jwt = require("jsonwebtoken");
import bcrypt = require('bcryptjs');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const SECRET_KEY = "secretkey23456";
const passportOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET_KEY
};

//const express = 
const app = express();
const port = 8080; // default port to listen
const passport = require("passport");
app.use(passport.initialize());
// app.use(passport.session());

passport.use(new JwtStrategy(passportOpts, function (jwtPayload: any, done: any) {
    const expirationDate = new Date(jwtPayload.exp * 1000);
    console.log(`Strategy expiration time ${jwtPayload.exp}`);
    if (expirationDate < new Date()) {
        return done(null, false);
    }
    done(null, jwtPayload);
}))

passport.serializeUser(function (user: any, done: any) {
    console.log(`Serialize user ${JSON.stringify(user)}`);
    done(null, user.username)
});

const router = express.Router();
app.use(express.json());
app.set('json spaces', 2);

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

app.use(router);

var timeout = require('connect-timeout'); //express v4
function haltOnTimedout(req: any, res: any, next: any) {
    if (!req.timedout) next();
}
app.use(timeout(2000));
app.use(haltOnTimedout);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

    next();
});

//connect o mysql

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'tamagotchi',
    password: 'Mahacskin13',
    database: 'tamagotchi',
    multipleStatements: true
});

connection.connect((err: any) => {
    if (err) throw err;
    console.log('Connected!');
    GroupsController(app, connection);
    ChildrenController(app, connection);
    UsersController(app, connection);
    FoodSleepController(app, connection);
    LoginController(app, connection);
});


// define a route handler for the default home page
app.get("/", (req: any, res: any) => {
    res.send("");
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

