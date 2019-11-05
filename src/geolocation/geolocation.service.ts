import { GeolocationDto } from "../interfaces"
import Joi from "@hapi/joi"
import Geolocation, { GeolocationModel } from "./geolocation"
import axios from "axios"
import { AxiosResponse } from "axios"
import { IPSTACK_APIKEY } from "../util/secrets"

const IPSTACK_APIURL = "http://api.ipstack.com/"

const transformIPstackResponse = (response): GeolocationDto => {
    return {
        city: response.data.city,
        country_code: response.data.country_code,
        country_name: response.data.country_name,
        ip: response.data.ip,
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        region_code: response.data.region_code,
        region_name: response.data.region_name,
        type: response.data.type,
        zip: response.data.zip,
    }
}

async function updateOrCreateGeolocation(domain, ip, geolocationDto: GeolocationDto) {
    let existedGeolocation: GeolocationModel
    if (domain && !ip) {
        existedGeolocation = await Geolocation.findOne({ ip: geolocationDto.ip })
        if (existedGeolocation) {
            existedGeolocation.domain = domain
            await existedGeolocation.save()
            return existedGeolocation
        }
    }
    const newGeolocation = new Geolocation(domain ? { ...geolocationDto, domain } : geolocationDto)
    await newGeolocation.save()
    return newGeolocation
}

export default {
    async get({ ip, domain, id }: { ip: string, domain: string, id: string }): Promise<GeolocationModel[]> {
        Joi.validate({ ip, domain }, {
            domain: Joi.string().domain(),
            ip: Joi.string().ip(),
        }, { abortEarly: false }, (err) => {
            if (err) throw err
        })

        let query = (ip || domain || id) ? { $or: [] } : {}
        if (ip) query.$or.push({ ip })
        if (domain) query.$or.push({ domain })
        if (id) query.$or.push({ _id: id })
        return Geolocation.find(query)
    },
    async post({ ip, domain }: { ip: string, domain: string }): Promise<GeolocationModel> {
        let schema = Joi.object({
            domain: Joi.string().domain(),
            ip: Joi.string().ip(),
        }).or("ip", "domain")
        Joi.validate({ ip, domain }, schema, { abortEarly: false }, (err) => {
            if (err) throw err
        })

        let query = (ip || domain) ? { $or: [] } : {}
        if (ip) query.$or.push({ ip })
        if (domain) query.$or.push({ domain })
        let geolocation: GeolocationModel = await Geolocation.findOne(query)
        if (geolocation) {
            return geolocation
        }
        const geolocationDto: GeolocationDto = await this.lookup({ ip, domain })
        return await updateOrCreateGeolocation(domain, ip, geolocationDto)
    },
    async lookup({ ip, domain }: { ip: string, domain: string }): Promise<GeolocationDto> {
        try {
            const query = domain && !ip ? domain : ip
            const url = `${IPSTACK_APIURL}${query}?access_key=${IPSTACK_APIKEY}`
            const response: AxiosResponse = await axios.get(url)
            return transformIPstackResponse(response)
        } catch (err) {
            throw new Error(err)
        }
    },
}
