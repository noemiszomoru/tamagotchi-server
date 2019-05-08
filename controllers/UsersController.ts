import * as mysql from "mysql";
import express = require("express");
import { User } from "../models/user.model";

const passport = require("passport");

export function UsersController(app: express.Express, db: mysql.Connection) {


    // Return list of users
    app.get("/users", passport.authenticate('jwt', { session: false }), (req: express.Request, res: express.Response) => {

        db.query('SELECT pk, role, name, email, username FROM `users`', [], (err: any, rows: any) => {
            if (err) {
                res.json(err);
                return;
            }
            res.json(rows);

        });

    });

    // Return user by username
    app.get("/user", passport.authenticate('jwt', { session: false }), (req: express.Request, res: express.Response) => {

        db.query('SELECT * FROM `users` WHERE username=?', [req.body.username], (err: any, rows: User[]) => {
            if (err) {
                res.json(err);
                return;
            }
            if (rows.length) {
                res.json(rows[0].username);
            } else {
                res.json(null);
            }

        });

    });

    // Create user
    app.post("/user", passport.authenticate('jwt', { session: false }), (req: any, res: any) => {

        db.query('INSERT INTO `users` (role, name, email, username, password) VALUES (?,?,?,?,?)', [req.body.role, req.body.name, req.body.email, req.body.username, req.body.password], (err: any, rows: any) => {
            if (err) {
                res.json(false);
                return;
            }
            res.json(true);

        });

    });

    // Update user
    app.put("/users/:user", passport.authenticate('jwt', { session: false }), (req: any, res: any) => {

        db.query('UPDATE `users` SET role=?, name=?, email=?, username=?, password=? WHERE pk=?', [req.body.role, req.body.name, req.body.email, req.body.username, req.body.password, req.params.user], (err: any, rows: any) => {
            if (err) {
                res.json(false);
                return;
            }
            res.json(true);

        });

    });

    // Delete user
    app.delete("/users/:user", passport.authenticate('jwt', { session: false }), (req: any, res: any) => {

        db.query('DELETE FROM `users` WHERE pk=?', [req.params.user], (err: any, rows: any) => {
            if (err) {
                res.json(false);
                return;
            }
            res.json(true);

        });

    });

}

exports.UsersController = UsersController;