import * as mysql from "mysql";
import express = require("express");
import bcrypt = require('bcryptjs');
import jwt = require("jsonwebtoken");
import { User } from "../models/user.model";
import { UsersController } from "./UsersController";
const passport = require("passport");
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const randtoken = require("rand-token");

const SECRET_KEY = "secretkey23456";
const passportOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET_KEY
};

export function LoginController(app: express.Express, db: mysql.Connection) {

    app.post("/register", (req: any, res: any) => {

        var password = bcrypt.hashSync(req.body.password);

        db.query('INSERT INTO `users` (role, name, email, username, password) VALUES (?,?,?,?,?)',
            [req.body.role, req.body.name, req.body.email, req.body.username, password], (err: any, rows: any) => {
                if (err) {
                    // return res.status(500).send("Server error1!");
                    res.json(err);
                    return;
                }
                db.query('SELECT * FROM `users` WHERE username=?', [req.body.username], (err: any, rows: User[]) => {
                    if (err) {
                        res.json(err);
                        return;
                    }
                    const expiresIn = 24 * 60 * 60;
                    const accessToken = jwt.sign({ id: rows[0].pk }, SECRET_KEY, {
                        expiresIn: expiresIn
                    });
                    const refreshToken = randtoken.uid(256);
                    res.json({ "user": rows[0].username, "accessToken": accessToken, "expiresIn": expiresIn, "refreshToken": refreshToken })
                });

            });
    });

    app.post("/login", (req: any, res: any) => {

        db.query('SELECT * FROM `users` WHERE username=?', [req.body.username], (err: any, rows: User[]) => {
            if (err) {
                return res.status(500).json(err);
            }

            if (rows.length != 1) {
                return res.status(404).send('User not found!');
            }

            const user = rows[0];
            const result = bcrypt.compareSync(req.body.password, (user as any).password);
            if (!result) {
                return res.status(401).send('Password not valid!');
            }
            const expiresIn = 24 * 60 * 60;
            const accessToken = jwt.sign({ id: user.pk }, SECRET_KEY, {
                expiresIn: expiresIn
            });
            const refreshToken = randtoken.uid(256);
            console.log(refreshToken);

            db.query('INSERT INTO user_token (user_id, token, expire, created, refresh_token) VALUES (?, ?, ?, NOW(), ?)', [
                user.pk, accessToken, expiresIn, refreshToken
            ], (err: any, rows: User[]) => {
                if (err) {
                    return res.status(500).send('Token storage error');
                }

                return res.json({ "user": User.create(user), "accessToken": accessToken, "expiresIn": expiresIn, "refreshToken": refreshToken });
            });
        });
    });

    app.post("/refresh", (req: any, res: any) => {

        db.query('SELECT * FROM `user_token` WHERE refresh_token=?', [req.body.refreshToken], (err: any, rows: User[]) => {
            if (err) {
                res.json(err);
                return;
            }
            const user = rows[0];
            const expiresIn = 24 * 60 * 60;
            const accessToken = jwt.sign({ id: user.pk }, SECRET_KEY, {
                expiresIn: expiresIn
            });

            db.query('INSERT INTO user_token (user_id, token, expire, created) VALUES (?, ?, ?, NOW())', [
                user.pk, accessToken, expiresIn
            ], (err: any, rows: User[]) => {
                if (err) {
                    return res.status(500).send('Token storage error');
                }

                return res.json({ "user": User.create(user), "accessToken": accessToken, "expiresIn": expiresIn });
            });

        });
    });

    app.delete("/logout", (req: any, res: any, next) => {

        db.query('DELETE FROM `user_token` WHERE refresh_token=?', [req.body.refreshToken], (err: any, rows: User[]) => {
            if (err) {
                res.json(false);
                return;
            }
            res.json(true);

        });
    });

}

exports.LoginController = LoginController;
