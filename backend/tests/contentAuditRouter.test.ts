import request from "supertest";
import express from "express";
import contentAuditRouter from "../routes/contentAuditRouter";

jest.mock("../utils/middleware/middleware");
jest.mock("../services/contentAudit/getContentAuditLog", () => ({ getContentAuditLogService: jest.fn() }));

import { getContentAuditLogService } from "../services/contentAudit/getContentAuditLog";

const app = express();
app.use("/api/v1/content/audit", contentAuditRouter);

const mockFn = (fn: unknown) => fn as jest.Mock;

describe("GET /api/v1/content/audit/:contentId", () => {
    it("should return the audit log for a content id", async () => {
        mockFn(getContentAuditLogService).mockResolvedValue({
            errorCode: 200,
            success: true,
            message: "Audit log fetched",
            data: [{ id: "log-1", action: "CREATE" }],
        });

        const res = await request(app).get("/api/v1/content/audit/content-1");

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(getContentAuditLogService).toHaveBeenCalledWith("test-user-id", "content-1");
    });

    it("should return 401 when no userId is attached", async () => {
        const res = await request(app)
            .get("/api/v1/content/audit/content-1")
            .set("x-test-user", "none");

        expect(res.status).toBe(401);
    });

    it("should return 500 when the service throws", async () => {
        mockFn(getContentAuditLogService).mockRejectedValue(new Error("db down"));

        const res = await request(app).get("/api/v1/content/audit/content-1");

        expect(res.status).toBe(500);
    });
});