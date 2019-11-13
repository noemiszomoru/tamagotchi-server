import * as mysql from "mysql";
import express = require("express");
import bcrypt = require('bcryptjs');
import jwt = require("jsonwebtoken");
import { User } from "../models/user.model";
import { UsersController } from "./UsersController";
import { IQueryResult } from "./models/IQueryResult";
import { Database } from "../services/Database";

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

// const EXPIRES_IN = 24 * 60 * 60;
const EXPIRES_IN = 365 * 24 * 60 * 60;

function buildToken(userId: number, userName: string, userRole: string, expiresIn: number) {
    return jwt.sign({
        id: userId,
        name: userName,
        role: userRole
    }, SECRET_KEY, {
        expiresIn
    });
}

export interface IUser {
    pk: number;
    name: string;
    username: string;
    email: string;
    role: string;
    length: number;
    password: string;
}

export async function getTokenUser(db: Database, token: string): Promise<IUser> {
    return new Promise((resolve, reject) => {
        db.query('SELECT users.pk, users.role, users.name FROM user_token LEFT JOIN users ON users.pk=user_token.user_id WHERE user_token.token=?', [token], (err: any, rows: IUser[]) => {
            if (err) {
                console.log(err);
                return reject(null);
            }

            if (!rows || rows.length == 0) {
                return reject(null);
            }

            const user = rows[0];

            return resolve(user);
        });
    });


}

export function LoginController(app: express.Express, db: Database) {

    app.post("/sendEmail", (req: any, res: any) => {

        const user = new User(req.body.role, req.body.name, req.body.email, req.body.username);

        db.query('INSERT INTO `users` (name, role, email, username) VALUES (?,?,?,?)',
            [user.name, user.role, user.email, user.username], (err: any, result: IQueryResult) => {
                if (err) {
                    console.log(err);
                    return res.json(err);
                }

                user.pk = result.insertId;

                const accessToken = buildToken(user.pk, user.username, user.role, EXPIRES_IN);
                const refreshToken = randtoken.uid(256);

                db.query('INSERT INTO user_token (user_id, token, expire, created, refresh_token) VALUES (?, ?, ?, NOW(), ?)', [
                    user.pk, accessToken, EXPIRES_IN, refreshToken
                ], (err: any, result: IQueryResult) => {
                    if (err) {
                        return res.status(500).send(err);
                    }

                    // return res.json({ "user": User.create(rows[0]), "accessToken": accessToken, "expiresIn": expiresIn, "refreshToken": refreshToken });
                    return res.json(true);
                });

                let transporter = nodeMailer.createTransport({
                    service: 'Gmail',
                    port: 465,
                    secure: true,  //true for 465 port, false for other ports
                    auth: {
                        user: 'noreply.tamagotchi@gmail.com',
                        pass: 'Amadeo123!',
                        tls: {
                            rejectUnauthorized: false
                        }
                    }
                });

                console.log(req.body);

                let mailOptions = {
                    from: '"Tamagotchi app" <noreply.tamagotchi@gmail.com>', // sender address
                    to: req.body.email, // list of receivers
                    subject: `Your Tamagotchi ${req.body.role} account was created`, // Subject line
                    text: 'Your account was created. Please click on the following url to set your password', // plain text body
                    html: `<head>
<title>Rating Reminder</title>
<meta content="text/html; charset=utf-8" http-equiv="Content-Type">
<meta content="width=device-width" name="viewport">
<style type="text/css">
            @font-face {
              font-family: &#x27;Postmates Std&#x27;;
              font-weight: 600;
              font-style: normal;
              src: local(&#x27;Postmates Std Bold&#x27;), url(https://s3-us-west-1.amazonaws.com/buyer-static.postmates.com/assets/email/postmates-std-bold.woff) format(&#x27;woff&#x27;);
            }

            @font-face {
              font-family: &#x27;Postmates Std&#x27;;
              font-weight: 500;
              font-style: normal;
              src: local(&#x27;Postmates Std Medium&#x27;), url(https://s3-us-west-1.amazonaws.com/buyer-static.postmates.com/assets/email/postmates-std-medium.woff) format(&#x27;woff&#x27;);
            }

            @font-face {
              font-family: &#x27;Postmates Std&#x27;;
              font-weight: 400;
              font-style: normal;
              src: local(&#x27;Postmates Std Regular&#x27;), url(https://s3-us-west-1.amazonaws.com/buyer-static.postmates.com/assets/email/postmates-std-regular.woff) format(&#x27;woff&#x27;);
            }
        </style>
<style media="screen and (max-width: 680px)">
            @media screen and (max-width: 680px) {
                .page-center {
                  padding-left: 0 !important;
                  padding-right: 0 !important;
                }
                
                .footer-center {
                  padding-left: 20px !important;
                  padding-right: 20px !important;
                }
            }
        </style>
</head>
<body style="background-color: #f4f4f5;">
<table cellpadding="0" cellspacing="0" style="width: 100%; height: 100%; background-color: #f4f4f5; text-align: center;">
<tbody><tr>
<td style="text-align: center;">
<table align="center" cellpadding="0" cellspacing="0" id="body" style="background-color: #fff; width: 100%; max-width: 680px; height: 100%;">
<tbody><tr>
<td>
<table align="center" cellpadding="0" cellspacing="0" class="page-center" style="text-align: left; padding-bottom: 88px; width: 100%; padding-left: 120px; padding-right: 120px;">
<tbody><tr>
<td style="padding-top: 24px; text-align: center;">
<img src="https://tamagotchi.freejack.ro/assets/logo.png" style="width: 56px;">
</td>
</tr>
<tr>
<td colspan="2" style="padding-top: 72px; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #000000; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 38px; font-smoothing: always; font-style: normal; font-weight: 600; letter-spacing: -2.6px; line-height: 52px; mso-line-height-rule: exactly; text-decoration: none; text-align: center;">Set your password</td>
</tr>
<tr>
<td style="padding-top: 48px; padding-bottom: 48px;">
<table cellpadding="0" cellspacing="0" style="width: 100%">
<tbody><tr>
<td style="width: 100%; height: 1px; max-height: 1px; background-color: #d9dbe0; opacity: 0.81"></td>
</tr>
</tbody></table>
</td>
</tr>
<tr>
<td style="-ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #9095a2; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 16px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: -0.18px; line-height: 24px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 100%;">
                                      You're receiving this e-mail to inform you of the creation of your <strong>Tamagotchi <span style="text-transform: capitalize;">${req.body.role}</span> account</strong>, with the following username: <strong>${req.body.username}</strong>.
                                    </td>
</tr>
<tr>
<td style="padding-top: 24px; -ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #9095a2; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 16px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: -0.18px; line-height: 24px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 100%;">
                                      Please tap the button below to set your password.
                                    </td>
</tr>
<tr>
<td>
<a data-click-track-id="37" href="https://tamagotchi.freejack.ro/token/${accessToken}" style="margin: 36px auto; -ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #ffffff; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 12px; font-smoothing: always; font-style: normal; font-weight: 600; letter-spacing: 0.7px; line-height: 48px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 220px; background-color: #00cc99; border-radius: 28px; display: block; text-align: center; text-transform: uppercase" target="_blank">
                                        Set Password
                                      </a>
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>



</body>` // html body
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

    /** DEPRECATED */
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

        db.query('SELECT * FROM `users` WHERE username=?', [req.body.username], (err: any, rows: IUser[]) => {
            if (err) {
                return res.status(500).json(err);
            }

            if (rows.length != 1) {
                return res.status(404).send('User not found!');
            }

            const user = rows[0];
            console.log(user);
            const result = bcrypt.compareSync(req.body.password, user.password);
            if (!result) {
                return res.status(401).send('Password not valid!');
            }

            const accessToken = buildToken(user.pk, user.username, user.role, EXPIRES_IN);
            const refreshToken = randtoken.uid(256);

            db.query('INSERT INTO user_token (user_id, token, expire, created, refresh_token) VALUES (?, ?, ?, NOW(), ?)', [
                user.pk, accessToken, EXPIRES_IN, refreshToken
            ], (err: any, rows: User[]) => {
                if (err) {
                    return res.status(500).send('Token storage error');
                }

                return res.json({ "user": User.create(user), "accessToken": accessToken, "expiresIn": EXPIRES_IN, "refreshToken": refreshToken });
            });
        });
    });

    app.post("/refresh", (req: any, res: any) => {

        db.query('SELECT * FROM `user_token` WHERE refresh_token=?', [req.body.refreshToken], (err: any, rows: IUser[]) => {
            if (err) {
                res.json(err);
                return;
            }
            const user = rows[0];

            if (!user) {
                return res.status(500).send('Token refresh error');
            }

            const accessToken = buildToken(user.pk, user.username, user.role, EXPIRES_IN);

            // const expiresIn = 24 * 60 * 60;
            // const accessToken = jwt.sign({ id: user.pk }, SECRET_KEY, {
            //     expiresIn: expiresIn
            // });

            db.query('INSERT INTO user_token (user_id, token, expire, created) VALUES (?, ?, ?, NOW())', [
                user.pk, accessToken, EXPIRES_IN
            ], (err: any, rows: User[]) => {
                if (err) {
                    return res.status(500).send('Token storage error');
                }

                return res.json({ "user": User.create(user), "accessToken": accessToken, "expiresIn": EXPIRES_IN });
            });

        });
    });

    app.delete("/logout", (req: any, res: any, next) => {

        db.query('DELETE FROM `user_token` WHERE refresh_token=?', [req.body.refreshToken], (err: any, rows: IQueryResult) => {
            if (err) {
                res.json(false);
                return;
            }
            res.json(true);

        });
    });
}

exports.LoginController = LoginController;
