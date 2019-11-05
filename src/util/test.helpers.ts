import userService from "../user/user.service"
import Geolocation from "../geolocation/geolocation"
import { GeolocationDto } from "../interfaces"
import faker from "faker"
import ExtendedExpect = jest.ExtendedExpect


export const getValidToken = async (ttl?: string) => {
    const user = {
        id: 1,
        email: "test@test.pl",
        password: "123456",
    }
    return ttl ? userService.toJwt(user, ttl) : userService.toJwt(user)
}

export const getInvalidToken = async () => {
    return userService.toJwt({
        id: 3,
        email: "wrong@wrong.pl",
        password: "999999999",
    })
}

export const createGeolocation = async (data = {}) => {
    const defaultData: GeolocationDto & { domain: string } = {
        ip: faker.internet.ip(),
        type: "IPv4",
        country_code: faker.address.countryCode(),
        country_name: faker.address.country(),
        region_code: faker.address.stateAbbr(),
        region_name: faker.address.state(),
        city: faker.address.city(),
        zip: faker.address.zipCode(),
        latitude: parseFloat(faker.address.latitude()),
        longitude: parseFloat(faker.address.longitude()),
        domain: faker.internet.domainName(),
    }
    const finalData = { ...defaultData, ...data }
    const gelocation = new Geolocation(finalData)
    await gelocation.save()
    return gelocation
}

export const sleep = (milliseconds) => {
    let start = new Date().getTime()
    for (let i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break
        }
    }
}
