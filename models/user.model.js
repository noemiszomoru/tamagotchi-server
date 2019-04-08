"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var User = /** @class */ (function () {
    function User(role, name, email, username) {
        this.pk = 0;
        this.role = role;
        this.name = name;
        this.email = email;
        this.username = username;
    }
    return User;
}());
exports.User = User;
