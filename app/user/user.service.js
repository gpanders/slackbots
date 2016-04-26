export class UserService {
    constructor() {}

    get name() {
        return 'User Service';
    }

    getUser() {
        if (this.isAuthenticated()) {
            return Promise.resolve(this.user);
        } else {
            return Promise.reject();
        }
    }

    setUser(user) {
        this.user = user;
        return Promise.resolve(this.user);
    }

    isAuthenticated() {
        return Boolean(this.user && this.user.id);
    }

    removeUser() {
        delete this.user;
    }
}
