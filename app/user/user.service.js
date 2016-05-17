export const UserService = angular.module('UserService', [])
.service('UserService', class UserService {
    /*@ngInject*/
    constructor($q) {
        this.$q = $q;
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
}).name;
