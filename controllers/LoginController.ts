import * as mysql from "mysql";
import express = require("express");
import bcrypt = require('bcryptjs');
import jwt = require("jsonwebtoken");
import { User } from "../models/user.model";
import { UsersController } from "./UsersController";

const SECRET_KEY = "secretkey23456";

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
                db.query('SELECT * FROM `users` WHERE email=?', [req.body.email], (err: any, rows: User[]) => {
                    if (err) {
                        res.json(err);
                        return;
                    }
                    const expiresIn = 24 * 60 * 60;
                    const accessToken = jwt.sign({ id: rows[0].pk }, SECRET_KEY, {
                        expiresIn: expiresIn
                    });
                    res.json({ "user": rows[0].username, "access_token": accessToken, "expires_in": expiresIn })
                });

            });
    });

    app.post("/login", (req: any, res: any) => {

        db.query('SELECT * FROM `users` WHERE email=?', [req.body.email], (err: any, rows: User[]) => {
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

            res.json({ "user": User.create(user), "access_token": accessToken, "expires_in": expiresIn });
        });
    });
}

exports.LoginController = LoginController;
