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
export const MONGODB_URI = ENV === "test" ? process.env["MONGODB_URI_TEST"] : process.env["MONGODB_URI"];

if (!MONGODB_URI) {
    logger.error("Lack of MONGODB_URI variable in .env configuration.")
    process.exit(1)
}

if (!JWT_SECRET) {
    logger.error("Lack of JWT_SECRET variable in .env configuration.")
    process.exit(1)
}
