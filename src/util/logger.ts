import winston, { Logger, LoggerOptions, transports } from "winston"

const options: LoggerOptions = {
    transports: [
        new transports.Console({
            format: winston.format.simple(),
            level: process.env.NODE_ENV === "production" ? "error" : "debug",
        }),
        new transports.File({ filename: "debug.log", level: "debug" }),
    ],
}

const logger: Logger = winston.createLogger(options)

if (process.env.NODE_ENV !== "production") {
    logger.debug("Logging initialized at debug level")
}
logger.error = function(err) {
    if (err instanceof Error) {
        this.log({ level: "error", message: `${err.stack || err}` })
    } else {
        this.log({ level: "error", message: err })
    }
    return this
}

export default logger
