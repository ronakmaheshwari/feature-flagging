import request from "supertest";
import express from "express";
import contentRouter from "../routes/contentRouter";

jest.mock("../utils/middleware/middleware");
jest.mock("../services/content/getAllContentService", () => ({ getAllContentService: jest.fn() }));
jest.mock("../services/content/postContentService", () => ({ postContentService: jest.fn() }));
jest.mock("../services/content/deleteContentService", () => ({ deleteContentService: jest.fn() }));

import { getAllContentService } from "../services/content/getAllContentService";
import { postContentService } from "../services/content/postContentService";
import { deleteContentService } from "../services/content/deleteContentService";

const app = express();
app.use(express.json());
app.use("/api/v1/content", contentRouter);

const mockFn = (fn: unknown) => fn as jest.Mock;

const validContentBody = {
    topic: "Feature flags 101",
    content: "A deep dive into feature flagging",
    platform: "LinkedIn",
    status: "DRAFT",
};

describe("GET /api/v1/content", () => {
    it("should return all content for the user", async () => {
        mockFn(getAllContentService).mockResolvedValue({
            errorCode: 200,
            success: true,
            message: "Please create some content to see data",
            data: [{ id: "content-1", topic: "Feature flags 101" }],
        });

        const res = await request(app).get("/api/v1/content");

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(getAllContentService).toHaveBeenCalledWith("test-user-id", {
            content: undefined,
            platform: undefined,
            status: undefined,
            isDeleted: undefined,
        });
    });

    it("should return 400 for invalid query parameters", async () => {
        const res = await request(app).get("/api/v1/content").query({ status: "INVALID" });

        expect(res.status).toBe(400);
    });

    it("should return 401 when no userId is attached", async () => {
        const res = await request(app).get("/api/v1/content").set("x-test-user", "none");

        expect(res.status).toBe(401);
    });

    it("should return 500 when the service throws", async () => {
        mockFn(getAllContentService).mockRejectedValue(new Error("db down"));

        const res = await request(app).get("/api/v1/content");

        expect(res.status).toBe(500);
    });
});

describe("POST /api/v1/content/submit", () => {
    it("should submit new content", async () => {
        mockFn(postContentService).mockResolvedValue({
            success: true,
            errorCode: 200,
            message: "Content was created",
            data: { id: "content-1" },
        });

        const res = await request(app).post("/api/v1/content/submit").send(validContentBody);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(postContentService).toHaveBeenCalledWith("test-user-id", {
            topic: "Feature flags 101",
            content: "A deep dive into feature flagging",
            platform: "LinkedIn",
            status: "DRAFT",
        });
    });

    it("should return 400 for an invalid payload", async () => {
        const res = await request(app)
            .post("/api/v1/content/submit")
            .send({ ...validContentBody, platform: "TikTok" });

        expect(res.status).toBe(400);
    });

    it("should return 401 when no userId is attached", async () => {
        const res = await request(app)
            .post("/api/v1/content/submit")
            .set("x-test-user", "none")
            .send(validContentBody);

        expect(res.status).toBe(401);
    });

    it("should return 500 when the service throws", async () => {
        mockFn(postContentService).mockRejectedValue(new Error("db down"));

        const res = await request(app).post("/api/v1/content/submit").send(validContentBody);

        expect(res.status).toBe(500);
    });
});

describe("DELETE /api/v1/content/:contentId", () => {
    it("should delete content by id", async () => {
        mockFn(deleteContentService).mockResolvedValue({
            errorCode: 200,
            success: true,
            message: "Content was deleted",
        });

        const res = await request(app).delete("/api/v1/content/content-1");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(deleteContentService).toHaveBeenCalledWith("test-user-id", "content-1");
    });

    it("should return 401 when no userId is attached", async () => {
        const res = await request(app).delete("/api/v1/content/content-1").set("x-test-user", "none");

        expect(res.status).toBe(401);
    });

    it("should return 500 when the service throws", async () => {
        mockFn(deleteContentService).mockRejectedValue(new Error("db down"));

        const res = await request(app).delete("/api/v1/content/content-1");

        expect(res.status).toBe(500);
    });
});