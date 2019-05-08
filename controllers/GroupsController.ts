import * as mysql from "mysql";
import express = require("express");
import { Group } from "../models/group.model";

const passport = require("passport");

export function GroupsController(app: express.Express, db: mysql.Connection) {


    // Return list of groups
    app.get("/groups", passport.authenticate('jwt', { session: false }), (req: express.Request, res: express.Response) => {

        db.query('SELECT * FROM `groups`', [], (err: any, rows: any) => {
            if (err) {
                res.json(err);
                return;
            }
            res.json(rows);

        });

    });

    // Return group by id

    app.get("/group/:id", passport.authenticate('jwt', { session: false }), (req: any, res: any) => {

        db.query('SELECT * FROM `groups` WHERE pk=?', [req.params.id], (err: any, rows: any) => {
            if (err) {
                res.json(err);
                return;
            }
            res.json(rows[0]);

        });


    });



    // Create group
    app.post("/group", passport.authenticate('jwt', { session: false }), (req: any, res: any) => {

        var group = req.body as Group;

        if (group.pk > 0) {

            db.query('UPDATE `groups` SET name=?, description=? WHERE pk=?', [group.name, group.description, group.pk], (err: any, rows: any) => {
                if (err) {
                    res.json(false);
                    return;
                }
                res.json(true);

            });
        } else {

            db.query('INSERT INTO `groups` (name, description) VALUES ( ?,?)', [group.name, group.description], (err: any, rows: any) => {
                if (err) {
                    res.json(false);
                    return;
                }
                res.json(true);

            });

        }

    });


    // // Update group
    // app.put("/groups/:group", (req: any, res: any) => {

    //     db.query('UPDATE `groups` SET name=?, description=? WHERE pk=?', [req.body.name, req.body.description, req.params.group], (err: any, rows: any) => {
    //         if (err) {
    //             res.json(false);
    //             return;
    //         }
    //         res.json(true);

    //     });

    // });


    // Delete group
    app.delete("/groups/:id", passport.authenticate('jwt', { session: false }), (req: any, res: any) => {

        db.query('DELETE FROM `groups` WHERE pk=?', [req.params.id], (err: any, rows: any) => {
            if (err) {
                res.json(false);
                return;
            }
            res.json(true);

        });

    });

}

exports.GroupsController = GroupsController;