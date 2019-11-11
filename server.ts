import { GroupsController } from "./controllers/GroupsController";
import { ChildrenController } from "./controllers/ChildrenController";
import { UsersController } from "./controllers/UsersController";
import { FoodSleepController } from "./controllers/FoodSleepController";
import { LoginController } from "./controllers/LoginController";

import fs from "fs";

// import mysql from "mysql";
import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import socketio from "socket.io";

import { Message } from "./models/message.model";
import { Group } from "./models/group.model";

import { isUndefined } from "util";
import { Database } from "./services/Database";

const CONFIG_FILES = ['./server.json', '../server.json'];

// Default config object 
let config = {
    db: {
        host: 'localhost',
        port: 3306,
        user: 'tamagotchi',
        password: 'Mahacskin13',
        database: 'tamagotchi',
        multipleStatements: true
    },
    listen: {
        port: 8080,
        host: '192.168.2.12'
    }
};

let CONFIG_FILE = undefined;

for (let path of CONFIG_FILES) {
    if (fs.existsSync(path)) {
        CONFIG_FILE = path;
        console.log(`Config file path set to ${CONFIG_FILE}`);
    }
}

if (isUndefined(CONFIG_FILE)) {
    console.log(`Server configuration file was not found.`);
    process.exit();
}

//If we have a config file, then we will read it instead of the default one
config = JSON.parse(fs.readFileSync(CONFIG_FILE as string).toString());
console.log(`Custom server configuration file loaded.`);

const db = new Database(config.db);

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const SECRET_KEY = "secretkey23456";
const passportOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET_KEY
};

//const express = 
const app = express();
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

GroupsController(app, db);
ChildrenController(app, db);
UsersController(app, db);
FoodSleepController(app, db);
LoginController(app, db);


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
const server = app.listen(config.listen.port, config.listen.host, () => {
    console.log(`Server listening on ${config.listen.host}:${config.listen.port}`);
});

const io = socketio.listen(server);

const connections: socketio.Socket[] = [];

function createNamespace(i: number) {
    var group = io.of('/group-' + groups[i]);

    group.on('connection', (socket: socketio.Socket) => {
        console.log(`Client connected from ${socket.handshake.address}`);
        connections.push(socket);
        console.log('Connected: %s sockets connected', connections.length);

        // socket.on('join', function (room) {
        //     socket.join(room);
        // });

        db.query('SELECT * FROM `messages` ORDER BY created DESC', [], (err: any, res: Message) => {
            if (err) {
                throw err;
            }
            console.log(res);
            return socket.emit('messageHistory', res);
        });


        // Disconnect
        socket.on('disconnect', function () {
            connections.splice(connections.indexOf(socket), 1);
            console.log('Disconnected: %s sockets connected', connections.length);

        });

        socket.on('message', (data: Message) => {
            group.emit('message', data);
            var message = data as Message;
            db.query('INSERT INTO `messages` (username, message, created) VALUES (?, ?, NOW())', [message.username, message.message], (err: any, res: any) => {
                if (err) {
                    throw err;
                }
                return res;
            });
        });
    });
}

var groups: Group[] = [];

db.query('SELECT * FROM `groups`', [], (err: any, rows: Group[]) => {
    if (err) {
        throw err;
        return;
    }
    groups = rows;
    return true;

});
console.log(groups);

for (var i = 0; i <= groups.length - 1; i++) {
    createNamespace(i);
}

