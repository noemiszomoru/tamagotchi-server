import { User } from './user.model';
import { Child } from './child.model';

export class ChildWrapper {

    public parentIds: Array<number> = [];

    constructor(public child: Child) {
    }

    public addParent(user: User) {
        this.parentIds.push(user.pk);
    }
}