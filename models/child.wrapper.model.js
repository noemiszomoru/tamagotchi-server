"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ChildWrapper = /** @class */ (function () {
    function ChildWrapper(child) {
        this.child = child;
        this.parentIds = [];
    }
    ChildWrapper.prototype.addParent = function (user) {
        this.parentIds.push(user.pk);
    };
    return ChildWrapper;
}());
exports.ChildWrapper = ChildWrapper;
