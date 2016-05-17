const winston = require('winston');

const env = process.env.NODE_ENV || 'development';

module.exports = {
    getLogger: function() {
        return new winston.Logger({
            level: env === 'production' ? 'error' : (env === 'development' ? 'debug' : 'info' ),
            transports: [new winston.transports.Console({ silent: env === 'test' })]
        });
    }
};
