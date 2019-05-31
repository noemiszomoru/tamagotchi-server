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

const nodeMailer = require('nodemailer');

const SECRET_KEY = "secretkey23456";
const passportOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET_KEY
};

export function LoginController(app: express.Express, db: mysql.Connection) {

    app.post("/sendEmail", (req: any, res: any) => {

        db.query('INSERT INTO `users` (role, name, email, username) VALUES (?,?,?,?)',
            [req.body.role, req.body.name, req.body.email, req.body.username], (err: any, rows: any) => {
                if (err) {
                    // return res.status(500).send("Server error1!");
                    res.json(err);
                    return;
                }

                console.log(rows[0]);

                const expiresIn = 24 * 60 * 60;
                const accessToken = jwt.sign({ id: rows.insertId }, SECRET_KEY, {
                    expiresIn: expiresIn
                });

                db.query('INSERT INTO user_token (user_id, token, expire, created) VALUES (?, ?, ?, NOW())', [
                    rows.insertId, accessToken, expiresIn
                ], (err: any, rows: User[]) => {
                    if (err) {
                        return res.status(500).send('Token storage error');
                    }

                    return res.json({ "user": User.create(rows[0]), "accessToken": accessToken, "expiresIn": expiresIn });
                });



                let transporter = nodeMailer.createTransport({
                    service: 'Gmail',
                    port: 465,
                    secure: true,  //true for 465 port, false for other ports
                    auth: {
                        user: 'noemi.szomoru@gmail.com',
                        pass: 'Mahacskin13',
                        tls: {
                            rejectUnauthorized: false
                        }
                    }
                });

                let mailOptions = {
                    from: '"Tamagotchi app" <noemi.szomoru@gmail.com>', // sender address
                    to: req.body.email, // list of receivers
                    subject: `Your ${req.body.role} user account was created`, // Subject line
                    text: 'Your account was created. Please click on the following url to set your password', // plain text body
                    html: `Your account was created. <br/><br/>Please click on the following url to set your password: <a href="http://localhost:4200/token/${accessToken}">Set Password</a>` // html body
                };

                transporter.sendMail(mailOptions, (error: any, info: any) => {
                    if (error) {
                        console.log(error);
                        res.status(500).send({ success: false, error: error })
                    } else {
                        // res.status(200).send({ success: true });
                        console.log('asta se executa');
                        res.send({ success: true });
                    }
                });

            });
    });

    app.post("/setPassword", passport.authenticate('jwt', { session: false }), (req: express.Request, res: express.Response) => {

        const password = bcrypt.hashSync(req.body.password);
        const userId = req.body.id;

        console.log(`Set password to ${userId} => ${password}`);

        db.query('UPDATE users SET `password`=? WHERE pk=?', [password, userId], (err: any, data: any) => {
            if (err) {
                res.json(err);
                return;
            }
            res.json(data);

        });

    });

    app.get("/token/:accessToken", (req: express.Request, res: express.Response) => {
        db.query('SELECT user_id FROM `user_token` WHERE accessToken=?', [req.params.accessToken], (err: any, rows: any) => {
            if (err) {
                res.json(err);
                return;
            }
            res.json(rows);

        });
    });

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
        console.log(`Login ... ...`);

        db.query('SELECT * FROM `users` WHERE username=?', [req.body.username], (err: any, rows: User[]) => {
            if (err) {
                return res.status(500).json(err);
            }


            if (rows.length != 1) {
                return res.status(404).send('User not found!');
            }

            const user = rows[0];
            console.log(user);
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


    // function sendEmail(to: string, subject: string, body: string) {

    // }

}

exports.LoginController = LoginController;
