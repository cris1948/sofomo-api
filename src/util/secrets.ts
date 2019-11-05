import logger from "./logger"
import dotenv from "dotenv"
import fs from "fs"

if (fs.existsSync(".env")) {
    logger.debug("Using .env file to supply config environment variables")
    dotenv.config({ path: ".env" })
} else {
    logger.debug("Using .env.example file to supply config environment variables")
    dotenv.config({ path: ".env.example" })
}


export const JWT_SECRET = process.env["JWT_SECRET"]
export const PORT = process.env["PORT"]
export const ENV = process.env["NODE_ENV"]
export const MONGODB_URI = ENV === "test" ? process.env["MONGODB_URI_TEST"] : process.env["MONGODB_URI"]
export const IPSTACK_APIKEY = process.env["IPSTACK_APIKEY"]

const requiredVariables = [MONGODB_URI, IPSTACK_APIKEY, JWT_SECRET]
let allVariablesCorrect = true
requiredVariables.forEach((variable) => {
    if (!variable) {
        logger.error(`Lack of ${variable} variable in .env configuration.\n`)
        allVariablesCorrect = false
    }
})
if (!allVariablesCorrect) {
    process.exit(1)
}


