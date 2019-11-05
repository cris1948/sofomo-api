import mongoose from "mongoose"
import request from "supertest"
import app from "../app"
import { getInvalidToken, getValidToken, sleep } from "../util/test.helpers"

afterAll(async () => {
    await mongoose.disconnect()
})

describe("POST /login", () => {

    it("should return proper token", async () => {
        const response = await request(app)
            .post("/login")
            .send({
                email: "test@test.pl",
                password: "123456",
            })
            .expect(200)
        expect(response.body).toMatchObject({
            token: expect.anything(),
        })
    })

    it("should return 401 on wrong credentials", async () => {
        await request(app)
            .post("/login")
            .send({
                email: "test@test.pl",
                password: "wrong!"
            })
            .expect(401);
    });

    it("should return 401 due to user not exists", async () => {
        await request(app)
            .post("/login")
            .send({
                email: "test5588@test.pl",
                password: "wrong!"
            })
            .expect(401);
    });

    it("should have access to secure endpoint", async () => {
        const token = await getValidToken();
        const response = await request(app)
            .get("/secret")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(response.body.msg).toEqual("Hurray! I have access to secure endpoint.");
    });

    it("should not have access to secure endpoint due to wrong token", async () => {
        const token = await getInvalidToken();
        await request(app)
            .get("/secret")
            .set("Authorization", `Bearer ${token}`)
            .expect(401);
    });

    it("should not have access to secure endpoint due to expired token", async () => {
        const token = await getValidToken("500ms");
        sleep(2000);
        await request(app)
            .get("/secret")
            .set("Authorization", `Bearer ${token}`)
            .expect(401);
    });
})
