import express from "express"
import mongoose from "mongoose"
import passport from "passport"
import bluebird from "bluebird"
import passportLocal from "passport-local"
import passportHttpBearer from "passport-http-bearer"
import errorHandler from "errorhandler"
import logger from "./util/logger"
import { ErrorRequestHandler } from "express-serve-static-core"
import { ValidationError as JoiValidationError } from "@hapi/joi";

import { MONGODB_URI } from "./util/secrets"

import userService from "./user/user.service"
import userController from "./user/user.controller"
import geoController from "./geolocation/geolocation.controller"

import { wrapHandler } from "./util/request"

import swaggerUi from "swagger-ui-express"
import swaggerDocument from "./swagger.json"

const LocalStrategy = passportLocal.Strategy
const HttpBearerStrategy = passportHttpBearer.Strategy

const app = express()
const mongoUrl = MONGODB_URI
mongoose.Promise = bluebird
mongoose.set("useCreateIndex", true)
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }).then(
    () => {
    },
).catch(err => {
    logger.error("MongoDB connection error. Please make sure MongoDB is running. " + err)
})

app.use(express.json())
app.use(passport.initialize())
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use((req, res, next) => {
    logger.debug(`-> ${req.method} ${req.url}`)
    next()
})

passport.use(new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    const user = userService.getUser(email)
    if (!user) {
        return done(undefined, false, { msg: `User with such email: ${email} not found.` })
    }
    const isMatch = userService.comparePasswords(password, user.password)
    if (isMatch) {
        return done(undefined, user)
    }
    return done(undefined, false, { msg: "Invalid email or password." })
}))
passport.use(new HttpBearerStrategy((token, done) => {
        try {
            const user = userService.fromJwt(token)
            if (!user) {
                return done(undefined, false, { msg: "User not found." })
            }
            done(undefined, user)
        } catch (e) {
            done(e)
        }
    },
))

// AUTH
app.post("/login", passport.authenticate("local", { session: false }), wrapHandler(userController.postLogin))

// GEOLOCATION
app.post("/geolocation", passport.authenticate("bearer", { session: false }), wrapHandler(geoController.postGeolocation));
app.get("/geolocation", passport.authenticate("bearer", { session: false }), wrapHandler(geoController.getGeolocation));
app.delete("/geolocation", passport.authenticate("bearer", { session: false }), wrapHandler(geoController.deleteGeolocation));

// GENERAL
app.get("/secret", passport.authenticate("bearer", { session: false }), (req, res) => res.json({ msg: "Hurray! I have access to secure endpoint." }))
app.get("/", (req, res) => res.send("Sofomo api welcome!"))

const err: ErrorRequestHandler = function(error, req, res, next) {
    logger.error(JSON.stringify(error))
    if (error.isJoi) {
        const validationError: JoiValidationError = error;
        const content: { [index: string]: string } = {};
        validationError.details.forEach((item) => { content[item.path[item.path.length - 1]] = item.message; });
        res.status(400).send(content);
        next();
        return;
    }
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
        res.status(401).end()
        return next()
    }
    res.status(500).json({ msg: "Unexpected error" })
    next()
}
app.use(err)

app.use((req, res, next) => {
    logger.debug(`<- ${res.statusCode}`)
    next()
})

app.use(errorHandler())


export default app
