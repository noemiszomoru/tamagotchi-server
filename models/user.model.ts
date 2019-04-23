import { userInfo } from "os";

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

    static create(input: any): User {
        const user = new User(
            input.role,
            input.name,
            input.email,
            input.username
        );
        user.pk = input.pk;

        return user;
    }
}
