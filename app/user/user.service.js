export class UserService {
    /*@ngInject*/
    constructor($q) {
        this.$q = $q;
    }

    get name() {
        return 'User Service';
    }

    getUser() {
        if (this.isAuthenticated()) {
            return this.$q.resolve(this.user);
        } else {
            return this.$q.reject();
        }
    }

    setUser(user) {
        this.user = user;
        return this.$q.resolve(this.user);
    }

    isAuthenticated() {
        return Boolean(this.user && this.user.id);
    }

    removeUser() {
        delete this.user;
    }
}
