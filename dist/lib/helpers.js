const winston = require('winston');

const env = process.env.NODE_ENV || 'development';

module.exports = {
    getLogger: function() {
        return new winston.Logger({
            level: env === 'production' ? 'error' : (env === 'development' ? 'debug' : 'info' ),
            transports: [new winston.transports.Console({ silent: env === 'test' })]
        });
    },
    requireParams: function(params, req) {
        let missingParams = params.filter(p => {
            return Object.keys(req.body).indexOf(p) === -1 &&
                   Object.keys(req.params).indexOf(p) === -1 &&
                   Object.keys(req.query).indexOf(p) === -1;
        });

        return missingParams.length ?
            `Missing required parameter(s): ${missingParams.join(', ')}` :
            false;
    }
};
