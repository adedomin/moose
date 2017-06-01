var winston = require('winston'),
    config

if (!process.env.CONFIG_PATH)
    config = { logger: { level: 'debug' } }
else
    config = require(process.env.CONFIG_PATH)

module.exports = new winston.Logger({
    emitErrs: true,
    transports: [
        new winston.transports.Console({
            level: config.logger.level,
            formatter: (options) => {
                return JSON.stringify({
                    time: Date.now(),
                    level: options.level,
                    msg: options.message,
                    err: options.meta.err,
                })
            },
        }),
    ],
})
