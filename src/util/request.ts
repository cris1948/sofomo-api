import { PromisifiedRequestHandler } from "../interfaces"
import { RequestHandler } from "express-serve-static-core"

export function wrapHandler(handler: PromisifiedRequestHandler): RequestHandler {
    return function(req, res, next) {
        handler(req, res).then(next).catch(e => {
            next(e)
        })
    }
}
