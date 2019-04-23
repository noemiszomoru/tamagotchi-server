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
    User.create = function (input) {
        var user = new User(input.role, input.name, input.email, input.username);
        user.pk = input.pk;
        return user;
    };
    return User;
}());
exports.User = User;
