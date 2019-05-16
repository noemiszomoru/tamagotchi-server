import * as mysql from "mysql";
import express = require("express");
import { Child } from "../models/child.model";
import { ChildWrapper } from "../models/child.wrapper.model";

const passport = require("passport");

export function ChildrenController(app: express.Express, db: mysql.Connection) {

    // Return list of children

    app.get("/children", passport.authenticate('jwt', { session: false }), (req: express.Request, res: express.Response) => {

        db.query('SELECT * FROM `children`', [], (err: any, rows: any) => {
            if (err) {
                res.json(err);
                return;
            }
            res.json(rows);

        });

    });

    // Return group by id

    app.get("/child/:id", passport.authenticate('jwt', { session: false }), (req: any, res: any) => {

        db.query('SELECT * FROM `children` WHERE pk=?', [req.params.id], (err: any, rows: any) => {
            if (err) {
                res.json(err);
                return;
            }
            res.json(rows[0]);

        });


    });


    // Return list of children by group

    app.get("/children/:group", passport.authenticate('jwt', { session: false }), (req: any, res: any) => {
        // console.log(childObject.name);

        // var childObject = JSON.parse(req.query.childData);

        var filter = req.query.filter ? req.query.filter : '';
        var parent = req.query.parent ? req.query.parent : 0;

        var query = 'SELECT * FROM children WHERE group_id=? AND name LIKE ?';
        var queryArgs = [req.params.group, `%${filter}%`];

        if (parent) {
            query += ' AND parent_id=?';
            queryArgs.push(parent);
        }

        db.query(query, queryArgs, (err: any, rows: any) => {
            if (err) {
                res.json(err);
                return;
            }
            res.json(rows);

        });


    });

    // Create/Update child

    app.post("/child", passport.authenticate('jwt', { session: false }), (req: any, res: any) => {

        var child = req.body.child as Child;
        var parentIds = req.body.parentIds as Array<number>;

        console.log(child);

        if (child.pk > 0) {
            db.query('UPDATE children SET name=? , group_id=? WHERE pk=?', [child.name, child.group_id, child.pk], (err: any, rows: any) => {
                if (err) {
                    res.json(err);
                    return;
                }

                updateChildParents(child.pk, parentIds, () => {
                });

                res.json(true);

                // getChildById(child.pk, (err: any, rows: any) => {
                //     if (err) {
                //         res.json(err);
                //         return;
                //     }
                //     res.json(rows[0]);
                // });
            });

        } else {
            db.query('INSERT INTO children (name, group_id) VALUES ( ?,? )', [child.name, child.group_id], (err: any, rows: any) => {
                if (err) {
                    res.json(err);
                    return;
                }

                child.pk = rows.insertId;

                updateChildParents(child.pk, parentIds, () => {
                });

                res.json(true);

            });
        }
    });

    function getChildById(id: number, callback: Function) {
        db.query('SELECT * FROM children WHERE pk=?', [id], (err: any, res: any) => {
            callback(err, res);
        });
    }

    function updateChildParents(childId: number, parentIds: Array<number>, callback: Function) {

        db.query('DELETE FROM child_parent WHERE child_id=?', [childId], (err: any, res: any) => {
            if (err) {
                console.log(err);
                callback(err);
                return;
            }
            for (let parentId of parentIds) {
                db.query('INSERT INTO child_parent (child_id, parent_id) VALUES (?,?)'
                    , [childId, parentId], (err: any, res: any) => {
                        if (err) {
                            console.log(err);
                        }
                    });

            }

            callback(err, res);
        });
    }

}

exports.ChildrenController = ChildrenController;