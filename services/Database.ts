import mysql from "mysql";

export class Database {

    constructor(private config: mysql.ConnectionConfig) {
        this.connect();
    }

    private _connection: mysql.Connection;

    public get connection(): mysql.Connection {
        return this._connection;
    }

    public connect() {
        console.log(`Connection to ${this.config.host}:${this.config.port}`);
        this._connection = mysql.createConnection(this.config);

        this._connection.connect((err: any) => {
            if (err) {
                console.log(err);
                setTimeout(() => {
                    console.log(`Reconnecting to db ...`);
                    this.connect();

                }, 2000)
                return;
            }
            console.log('Succefully connected to database');
        });


        this._connection.on('error', (err) => {
            console.log('Mysql error', err);

            if (err.code == 'PROTOCOL_CONNECTION_LOST') {
                // Connection to the MySQL server is usually
                // lost due to either server restart, or a
                // connnection idle timeout (the wait_timeout
                // server variable configures this)
            }

            this.handleDisconnect();
        });
    }

    private handleDisconnect() {
        this.connect();
    }

    public query(query: string, arg: any | mysql.queryCallback, callback?: mysql.queryCallback) {
        return this.connection.query(query, arg, callback);
    }

}