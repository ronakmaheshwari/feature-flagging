import request from "supertest";
import app from "../index";

jest.mock("../utils/feature-flag-helper/flagGate", () => ({
    loadRouteMap: jest.fn(async () => {}),
    resolveRoute: jest.fn(() => null),
}));

describe("App root routes", () => {
    it("GET / should return hello world html", async () => {
        const res = await request(app).get("/");
        expect(res.status).toBe(200);
        expect(res.text).toContain("Hello World");
    });

    it("GET /health should return healthy payload", async () => {
        const res = await request(app).get("/health");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            error: false,
            success: true,
            data: "Server is healthy"
        });
    });
});