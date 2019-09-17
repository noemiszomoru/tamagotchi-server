export class Message {
    public username: string;
    public message: string;
    public created: Date;

    constructor(username: string, message: string, created: Date) {
        this.username = username;
        this.message = message;
        this.created = created;
    }
}