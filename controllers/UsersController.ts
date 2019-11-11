import * as mysql from "mysql";
import express = require("express");
import { User } from "../models/user.model";
import { Database } from "../services/Database";

const passport = require("passport");

export function UsersController(app: express.Express, db: Database) {


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

    // Return list of user  roles
    app.get("/user-roles", passport.authenticate('jwt', { session: false }), (req: express.Request, res: express.Response) => {

        res.json([
            { "role": "admin" },
            { "role": "teacher" },
            { "role": "parent" }
        ]);

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

    // Return user by id

    app.get("/user/:id", passport.authenticate('jwt', { session: false }), (req: any, res: any) => {

        db.query('SELECT * FROM `users` WHERE pk=?', [req.params.id], (err: any, rows: any) => {
            if (err) {
                res.json(err);
                return;
            }
            res.json(rows[0]);

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
    app.put("/user", passport.authenticate('jwt', { session: false }), (req: any, res: any) => {

        db.query('UPDATE `users` SET name=?, role=?, email=?, username=? WHERE pk=?', [req.body.name, req.body.role, req.body.email, req.body.username, req.body.pk], (err: any, rows: any) => {
            if (err) {
                res.json(err);
                return;
            }
            res.json(true);

        });

    });

    // Delete user
    app.delete("/users/:id", passport.authenticate('jwt', { session: false }), (req: any, res: any) => {

        db.query('DELETE FROM `users` WHERE pk=?', [req.params.id], (err: any, rows: any) => {
            if (err) {
                res.json(false);
                return;
            }
            res.json(true);

        });

    });

}

exports.UsersController = UsersController;