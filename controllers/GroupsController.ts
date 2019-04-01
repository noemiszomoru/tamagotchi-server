import * as mysql from "mysql";
import express = require("express");

export function GroupsController(app: express.Express, db: mysql.Connection) {


    // Return list of groups
    app.get("/groups", (req: express.Request, res: express.Response) => {

        db.query('SELECT * FROM `groups`', [], (err: any, rows: any) => {
            if (err) {
                res.json(err);
                return;
            }
            res.json(rows);

        });

    });


    // Create group
    app.post("/group", (req: any, res: any) => {

        db.query('INSERT INTO `groups` (name, description) VALUES ( ?,?)', [req.body.name, req.body.description], (err: any, rows: any) => {
            if (err) {
                res.json(false);
                return;
            }
            res.json(true);

        });

    });


    // Update group
    app.put("/groups/:group", (req: any, res: any) => {

        db.query('UPDATE `groups` SET name=?, description=? WHERE pk=?', [req.body.name, req.body.description, req.params.group], (err: any, rows: any) => {
            if (err) {
                res.json(false);
                return;
            }
            res.json(true);

        });

    });


    // Delete group
    app.delete("/groups/:group", (req: any, res: any) => {

        db.query('DELETE FROM `groups` WHERE pk=?', [req.params.group], (err: any, rows: any) => {
            if (err) {
                res.json(false);
                return;
            }
            res.json(true);

        });

    });

}

exports.GroupsController = GroupsController;