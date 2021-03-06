import { PromisifiedRequestHandler, PassportExtendedRequest } from "../interfaces"
import geoService from "./geolocation.service"

const getGeolocation: PromisifiedRequestHandler = async (req: PassportExtendedRequest, res) => {
    const query = {
        ip: req.query.ip,
        domain: req.query.domain,
        id: req.query.id,
    }
    let geolocations = await geoService.get(query);
    res.status(200).send(geolocations)
}

const postGeolocation: PromisifiedRequestHandler = async (req: PassportExtendedRequest, res) => {
    const dto = {
        ip: req.body.ip,
        domain: req.body.domain
    }
    let geolocation = await geoService.post(dto);
    res.status(200).send(geolocation)
}

const deleteGeolocation: PromisifiedRequestHandler = async (req: PassportExtendedRequest, res) => {
    const query = {
        ip: req.query.ip,
        domain: req.query.domain,
        id: req.query.id,
    }
    let response = await geoService.delete(query);
    if (!response) {
        res.status(404).send("Object not found");
    }
    res.status(200).send("OK")
}
export default {
    getGeolocation,
    postGeolocation,
    deleteGeolocation,
}
