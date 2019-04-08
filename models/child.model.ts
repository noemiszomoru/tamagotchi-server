export class Child {
    public pk: number = 0;
    public name: string;
    public group_id: number;

    constructor(name: string, group_id: number) {
        this.name = name;
        this.group_id = group_id;
    }
}