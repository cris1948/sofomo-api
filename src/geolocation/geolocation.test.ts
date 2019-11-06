import mongoose from "mongoose"
import request from "supertest"
import app from "../app"
import { createGeolocation, getValidToken } from "../util/test.helpers"
import { GeolocationDto } from "../interfaces"
import geoService from "./geolocation.service"
import Geolocation from "./geolocation"
import * as faker from "faker"

const exampleGeolocation: GeolocationDto = {
    ip: "89.64.56.38",
    type: "IPv4",
    country_code: "PL",
    country_name: "Poland",
    region_code: "DS",
    region_name: "Lower Silesia",
    city: "Wrocław",
    zip: "50-341",
    latitude: 51.11933135986328,
    longitude: 17.06340980529785,
}

const exampleGeolocation2: GeolocationDto = {
    ip: "89.64.56.88",
    type: "IPv4",
    country_code: "PL",
    country_name: "Poland",
    region_code: "DS",
    region_name: "Lower Silesia",
    city: "Katowice",
    zip: "41-788",
    latitude: 51.11933135986328,
    longitude: 17.06340980529785,
}

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect()
})

describe("POST /geolocation", () => {
    it("POST should add geolocation object to DB based on IP", async () => {
        jest.spyOn(geoService, "lookup").mockReset()
        jest.spyOn(geoService, "lookup").mockImplementation(() => {
            return Promise.resolve(exampleGeolocation)
        })

        const token = await getValidToken()
        const response = await request(app)
            .post("/geolocation")
            .set("Authorization", `Bearer ${token}`)
            .send({
                ip: exampleGeolocation.ip,
            })

        expect(response.status).toEqual(200)
        expect(response.body).toMatchObject(exampleGeolocation)
        const geolocation = await Geolocation.findOne({ ip: exampleGeolocation.ip })
        expect(geolocation).toMatchObject(exampleGeolocation)
    })

    it("POST query second time for the same ip address should return result from db not from ipstack", async () => {
        jest.spyOn(geoService, "lookup").mockReset()
        let lookupSpy = jest.spyOn(geoService, "lookup").mockImplementation(() => {
            return Promise.resolve(exampleGeolocation2)
        })
        const token = await getValidToken()
        await request(app)
            .post("/geolocation")
            .set("Authorization", `Bearer ${token}`)
            .send({
                ip: exampleGeolocation2.ip,
            })
        const response = await request(app)
            .post("/geolocation")
            .set("Authorization", `Bearer ${token}`)
            .send({
                ip: exampleGeolocation2.ip,
            })

        expect(response.status).toEqual(200)
        expect(lookupSpy).toHaveBeenCalledTimes(1)
    })

    it("POST should add geolocation object to DB based on IP without mock", async () => {
        jest.restoreAllMocks();
        const exampleIP = faker.internet.ip();
        const token = await getValidToken()
        const response = await request(app)
            .post("/geolocation")
            .set("Authorization", `Bearer ${token}`)
            .send({
                ip: exampleIP,
            })

        expect(response.status).toEqual(200)
        const geolocation = await Geolocation.findOne({ ip: exampleIP })
        expect(geolocation).not.toBeNull();
    })

    it("POST should add geolocation object to DB based on url", async () => {
        const domain = "sofomo.com";
        const token = await getValidToken()
        const response = await request(app)
            .post("/geolocation")
            .set("Authorization", `Bearer ${token}`)
            .send({
                domain,
            })
        expect(response.status).toEqual(200)
        const geolocation = await Geolocation.findOne({ domain })
        expect(geolocation).not.toBeNull();
    })

    it("POST should return validationError due to incorrect ip", async () => {
        const token = await getValidToken()
        const response = await request(app)
            .post("/geolocation")
            .set("Authorization", `Bearer ${token}`)
            .send({
                ip: "123",
            })

        expect(response.status).toEqual(400)
        expect(response.body).toMatchObject({ "ip": expect.stringContaining("ip") })
    })

    it("POST should return validationError due to incorrect domain", async () => {
        const token = await getValidToken()
        const response = await request(app)
            .post("/geolocation")
            .set("Authorization", `Bearer ${token}`)
            .send({
                domain: "test",
            })

        expect(response.status).toEqual(400)
        expect(response.body).toMatchObject({ "domain": expect.stringContaining("domain") })
    })

    it("POST should return validationError due lack of body attributes", async () => {
        const token = await getValidToken()
        const response = await request(app)
            .post("/geolocation")
            .set("Authorization", `Bearer ${token}`)
            .send({})

        expect(response.status).toEqual(400)
    })
})

describe("GET /geolocation", () => {
    beforeAll(async () => {
        await mongoose.connection.db.dropDatabase();
    })

    it("GET should get all geolocation objects stored in DB", async () => {
        await createGeolocation();
        await createGeolocation();
        const token = await getValidToken()
        const response = await request(app)
            .get("/geolocation")
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toEqual(200)
        expect(response.body.length).toEqual(2)
    })

    it("GET should return geolocation object based on IP", async () => {
        const geo1 = await createGeolocation();
        await createGeolocation();
        const token = await getValidToken()
        const response = await request(app)
            .get(`/geolocation?ip=${geo1.ip}`)
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toEqual(200)
        expect(response.body.length).toEqual(1)
    })

    it("GET should return geolocation object based on domain", async () => {
        const geo1 = await createGeolocation();
        await createGeolocation();
        const token = await getValidToken()
        const response = await request(app)
            .get(`/geolocation?domain=${geo1.domain}`)
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toEqual(200)
        expect(response.body.length).toEqual(1)
    })

    it("GET should return geolocation object based on ObjectId", async () => {
        const geo1 = await createGeolocation();
        await createGeolocation();
        const token = await getValidToken()
        const response = await request(app)
            .get(`/geolocation?id=${geo1.id}`)
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toEqual(200)
        expect(response.body.length).toEqual(1)
    })

    it("GET should return geolocation object based on domain and ip", async () => {
        const geo1 = await createGeolocation();
        const geo2 = await createGeolocation();
        const token = await getValidToken()
        const response = await request(app)
            .get(`/geolocation?domain=${geo1.domain}&ip=${geo2.ip}`)
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toEqual(200)
        expect(response.body.length).toEqual(2)
    })

    it("GET should return empty array due to object does not exist", async () => {
        await createGeolocation();
        const token = await getValidToken()
        const response = await request(app)
            .get(`/geolocation?id=${new mongoose.Types.ObjectId()}`)
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toEqual(200)
        expect(response.body.length).toEqual(0)
    })

    it("GET should return 401 due lack of token", async () => {
        const response = await request(app)
            .get(`/geolocation?id=${new mongoose.Types.ObjectId()}`)

        expect(response.status).toEqual(401)
    })

    it("GET should return validation error due to incorrect IP", async () => {
        const token = await getValidToken()
        const response = await request(app)
            .get(`/geolocation?ip=123.123.4`)
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toEqual(400)
        expect(response.body).toMatchObject({ "ip": expect.stringContaining("ip") })
    })

    it("GET should return validation error due to incorrect domain", async () => {
        const token = await getValidToken()
        const response = await request(app)
            .get(`/geolocation?domain=123.123.4`)
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toEqual(400)
        expect(response.body).toMatchObject({ "domain": expect.stringContaining("domain") })
    })
})

describe("DELETE /geolocation", () => {
    it("DELETE should remove existed object based on IP", async () => {
        const geo1 = await createGeolocation();
        const token = await getValidToken()
        const response = await request(app)
            .delete(`/geolocation?ip=${geo1.ip}`)
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toEqual(200)
        const geolocation = await Geolocation.findOne({ ip: geo1.ip })
        expect(geolocation).toBeNull();
    })

    it("DELETE should remove existed object based on domain", async () => {

    })

    it("DELETE should remove existed object based on id", async () => {

    })

    it("DELETE should return validation error due to lack of params", async () => {
        const token = await getValidToken()
        const response = await request(app)
            .delete(`/geolocation`)
            .set("Authorization", `Bearer ${token}`)
        
        expect(response.status).toEqual(400)
    })

    it("DELETE should return validation error to wrong of params", async () => {
        const geo1 = await createGeolocation();
        const token = await getValidToken()
        const response = await request(app)
            .delete(`/geolocation?ip=${geo1.ip}&domain=${geo1.domain}`)
            .set("Authorization", `Bearer ${token}`)

        expect(response.status).toEqual(400)
    })
})
