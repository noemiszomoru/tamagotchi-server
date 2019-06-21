import * as mysql from "mysql";
import express = require("express");
import { getTokenUser } from "./LoginController";

const passport = require("passport");

export function FoodSleepController(app: express.Express, db: mysql.Connection) {


    // Return list of food and sleep for all children
    app.get("/food-sleep", passport.authenticate('jwt', { session: false }), (req: express.Request, res: express.Response) => {

        db.query('SELECT children.pk, children.name, children.group_id, food.date, food.breakfast, food.soup, food.main_dish, sleep.start_at, sleep.end_at' +
            ' FROM ((`children` LEFT JOIN food ON children.pk=food.child_id OR food.date IS NULL) LEFT JOIN sleep ON children.pk=sleep.child_id AND food.date=sleep.date)', [], (err: any, rows: any) => {
                if (err) {
                    res.json(err);
                    return;
                }
                res.json(rows);

            });

    });


    // Return list of food and sleep for children by group

    app.get("/food-sleep/group/:group", passport.authenticate('jwt', { session: false }), (req: any, res: any) => {

        var filter = req.query.filter ? req.query.filter : '';
        var parent = req.query.parent ? req.query.parent : 0;

        var query = 'SELECT children.pk, children.name, children.group_id, food.date, food.breakfast, food.soup, food.main_dish, sleep.start_at, sleep.end_at' +
            ' FROM ((`children` LEFT JOIN food ON children.pk=food.child_id) LEFT JOIN sleep ON children.pk=sleep.child_id AND food.date=sleep.date) WHERE group_id=? AND name LIKE ?';
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


    // Return list of food and sleep for children by date

    app.get("/food-sleep/:date", passport.authenticate('jwt', { session: false }), async (req: any, res: any) => {

        const userInfo = await getTokenUser(db, req.header('Authorization').substr(7));

        console.log(`User info`);
        console.log(userInfo);

        // var filter = req.query.filter ? req.query.filter : '';
        var parent_id = req.query.parent_id ? req.query.parent_id : 0;

        var query = `SELECT 
                        c.pk, c.name, c.group_id, 
                        f.date, f.breakfast, f.soup, f.main_dish, 
                        s.start_at, s.end_at
                    FROM \`children\` AS c 
                    LEFT JOIN food AS f ON c.pk=f.child_id AND f.date=?
                    LEFT JOIN sleep AS s ON c.pk=s.child_id AND s.date=?
                    `;

        var queryArgs = [req.params.date, req.params.date];

        if (req.query.group) {
            query += `WHERE c.group_id=?`;
            queryArgs.push(req.query.group);
        }

        if (userInfo.role == 'parent') {
            query += ` INNER JOIN child_parent AS cp ON cp.child_id=c.pk`;
            queryArgs.push(userInfo.pk);
            query += ` WHERE cp.parent_id=?`;
        }

        console.log('Query:' + query);

        db.query(query, queryArgs, (err: any, rows: any) => {
            if (err) {
                res.json(err);
                return;
            }
            res.json(rows);

        });

    });

    // Create/Update food entry

    app.post("/food", passport.authenticate('jwt', { session: false }), (req: any, res: any) => {

        db.query('UPDATE food SET breakfast=?, soup=?, main_dish=? WHERE child_id=? AND date=?',
            [
                req.body.breakfast,
                req.body.soup,
                req.body.main_dish,
                req.body.child_id,
                req.body.date
            ], (err: any, rows: any) => {
                if (err) {
                    res.json(err);
                    return;
                }

                if (rows.affectedRows > 0) {
                    res.json(true);
                    return;
                }

                db.query('INSERT INTO food (child_id, date, breakfast, soup, main_dish) VALUES ( ?,?,?,?,? )',
                    [
                        req.body.child_id,
                        req.body.date,
                        req.body.breakfast,
                        req.body.soup,
                        req.body.main_dish
                    ], (err: any, rows: any) => {
                        if (err) {
                            console.log(err);
                            res.json(err);
                            return;
                        }

                        res.json(true);
                    }

                );
            });


    });

    // Create/Update sleep entry

    app.post("/sleep", passport.authenticate('jwt', { session: false }), (req: any, res: any) => {

        db.query('UPDATE sleep SET start_at=?, end_at=? WHERE child_id=? AND date=?',
            [
                req.body.start_at,
                req.body.end_at,
                req.body.child_id,
                req.body.date
            ], (err: any, rows: any) => {
                if (err) {
                    res.json(err);
                    return;
                }

                if (rows.affectedRows > 0) {
                    res.json(true);
                    return;
                }

                db.query('INSERT INTO sleep (child_id, date, start_at, end_at) VALUES ( ?,?,?,? )',
                    [
                        req.body.child_id,
                        req.body.date,
                        req.body.start_at,
                        req.body.end_at
                    ], (err: any, rows: any) => {
                        if (err) {
                            console.log(err);
                            res.json(err);
                            return;
                        }

                        res.json(true);
                    }

                );
            });
    });
}
exports.FoodSleepController = FoodSleepController;