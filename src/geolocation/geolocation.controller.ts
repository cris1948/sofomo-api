import { PromisifiedRequestHandler, PassportExtendedRequest } from "../interfaces"

const getGeolocation: PromisifiedRequestHandler = async (req: PassportExtendedRequest, res) => {
    res.status(200).send({})
}

const postGeolocation: PromisifiedRequestHandler = async (req: PassportExtendedRequest, res) => {
    res.status(200).send({})
}

const deleteGeolocation: PromisifiedRequestHandler = async (req: PassportExtendedRequest, res) => {
    res.status(200).send({})
}
export default {
    getGeolocation,
    postGeolocation,
    deleteGeolocation
}
