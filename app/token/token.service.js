export class TokenService {
    /*@ngInject*/
    constructor(store) {
        this.store = store.getNamespacedStore('slackbots');
    }

    get name() {
        return 'TokenService';
    }

    get() {
        return this.store.get('token');
    }

    save(token) {
        return this.store.set('token', token);
    }

    clear() {
        return this.store.remove('token');
    }
}
