export class User {
    public pk: number = 0;
    public role: string;
    public name: string;
    public email: string;
    public username: string;

    constructor(role: string, name: string, email: string, username: string) {
        this.role = role;
        this.name = name;
        this.email = email;
        this.username = username;
    }
}