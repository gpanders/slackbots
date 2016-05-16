class Logger {
    /*
        4 = ERROR
        3 = WARN
        2 = INFO
        1 = DEBUG
    */
    constructor(level) {
        this._level = level || 3;
    }

    setLevel(level) {
        this._level = level;
    }

    error(msg, ...args) {
        if (this._level <= 4) {
            console.error('[ERROR]', msg, ...args);
        }
    }

    warn(msg, ...args) {
        if (this._level <= 3) {
            console.log('[WARN]', msg, ...args);
        }
    }

    info(msg, ...args) {
        if (this._level <= 2) {
            console.log('[INFO]', msg, ...args);
        }
    }

    debug(msg, ...args) {
        if (this._level <= 1) {
            console.log('[DEBUG]', msg, ...args);
        }
    }
}

module.exports = Logger;
