'use strict';

export class UserService {
    /*@ngInject*/
    constructor($q) {
        this.$q = $q;
        this.user = null;
    }

    getUser() {
        let deferred = this.$q.defer();
        if (this.user && this.user.id) {
            deferred.resolve(this.user);
        } else {
            deferred.reject();
        }

        return deferred.promise;
    }

    setUser(user) {
        this.user = user;
    }

    removeUser() {
        delete this.user;
    }
}
