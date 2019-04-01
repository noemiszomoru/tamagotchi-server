import * as mysql from "mysql";
import express = require("express");

export function ChildrenController(app: express.Express, db: mysql.Connection) {

    // Return list of children

    app.get("/children", (req: express.Request, res: express.Response) => {

        db.query('SELECT * FROM `children`', [], (err: any, rows: any) => {
            if (err) {
                res.json(err);
                return;
            }
            res.json(rows);

        });

    });


    // Return list of children by group

    app.get("/children/:group", (req: any, res: any) => {
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

    app.post("/child", (req: any, res: any) => {

        if (req.body.pk > 0) {
            db.query('UPDATE children SET name=? , group_id=? WHERE pk=?', [req.body.name, req.body.group_id, req.body.pk], (err: any, rows: any) => {
                if (err) {
                    res.json(err);
                    return;
                }
                getChildById(req.body.pk, (err: any, rows: any) => {
                    if (err) {
                        res.json(err);
                        return;
                    }
                    res.json(rows[0]);
                });
            });

        } else {
            db.query('INSERT INTO children (name, group_id) VALUES ( ?,? )', [req.body.name, req.body.group_id], (err: any, rows: any) => {
                if (err) {
                    res.json(err);
                    return;
                }

                getChildById(rows.insertId, (err: any, rows: any) => {
                    if (err) {
                        res.json(err);
                        return;
                    }

                    res.json(rows[0]);
                });
            });
        }
    });

    function getChildById(id: number, callback: Function) {
        db.query('SELECT * FROM children WHERE pk=?', [id], (err: any, res: any) => {
            callback(err, res);
        });
    }

}

exports.ChildrenController = ChildrenController;