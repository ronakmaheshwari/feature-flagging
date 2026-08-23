import request from "supertest";
import express from "express";
import userRouter from "../routes/userRouter";

jest.mock("../utils/middleware/middleware");
jest.mock("../services/user/signupService", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../services/user/loginService", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../services/user/getUserDataService", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../services/user/otpVerificationService", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../services/user/userVerifcationService", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../services/user/forgetPasswordOTPService", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../services/user/forgetPasswordService", () => ({ __esModule: true, default: jest.fn() }));

import userSignupService from "../services/user/signupService";
import userLoginService from "../services/user/loginService";
import userDataService from "../services/user/getUserDataService";
import otpVerificationService from "../services/user/otpVerificationService";
import userVerificationService from "../services/user/userVerifcationService";
import forgetPasswordOTPService from "../services/user/forgetPasswordOTPService";
import forgetPasswordService from "../services/user/forgetPasswordService";
import { forgetPasswordController } from "../controller/userController";

const app = express();
app.use(express.json());
app.use("/api/v1/user", userRouter);

const mockFn = (fn: unknown) => fn as jest.Mock;

const validSignupBody = {
    username: "john_doe",
    email: "john@example.com",
    password: "StrongPass123!",
    role: "USER",
};

const validLoginBody = {
    email: "john@example.com",
    password: "StrongPass123!",
};

describe("GET /api/v1/user/data", () => {
    it("should return user data when authenticated", async () => {
        mockFn(userDataService).mockResolvedValue({
            id: "user-1",
            username: "john_doe",
            email: "john@example.com",
        });

        const res = await request(app).get("/api/v1/user/data");

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ username: "john_doe" });
        expect(userDataService).toHaveBeenCalledWith("test-user-id");
    });

    it("should return 401 when no userId is attached", async () => {
        const res = await request(app)
            .get("/api/v1/user/data")
            .set("x-test-user", "none");

        expect(res.status).toBe(401);
    });

    it("should return 401 when the user is not found", async () => {
        mockFn(userDataService).mockResolvedValue(false);

        const res = await request(app).get("/api/v1/user/data");

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Invalid user id was provided");
    });

    it("should return 500 when the service throws", async () => {
        mockFn(userDataService).mockRejectedValue(new Error("db down"));

        const res = await request(app).get("/api/v1/user/data");

        expect(res.status).toBe(500);
    });
});

describe("POST /api/v1/user/signup", () => {
    it("should create a user with valid payload", async () => {
        mockFn(userSignupService).mockResolvedValue({
            success: true,
            message: "User was successfully created",
        });

        const res = await request(app).post("/api/v1/user/signup").send(validSignupBody);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(userSignupService).toHaveBeenCalledWith(
            "john_doe",
            "john@example.com",
            "StrongPass123!",
            "USER"
        );
    });

    it("should return 400 for an invalid payload", async () => {
        const res = await request(app)
            .post("/api/v1/user/signup")
            .send({ ...validSignupBody, email: "not-an-email" });

        expect(res.status).toBe(400);
    });

    it("should return 500 when the service returns an error string", async () => {
        mockFn(userSignupService).mockResolvedValue("connection refused");

        const res = await request(app).post("/api/v1/user/signup").send(validSignupBody);

        expect(res.status).toBe(500);
    });

    it("should return 409 when the email already exists", async () => {
        mockFn(userSignupService).mockResolvedValue({
            success: false,
            message: "The given john@example.com already exist with our system",
        });

        const res = await request(app).post("/api/v1/user/signup").send(validSignupBody);

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
    });
});

describe("POST /api/v1/user/login", () => {
    it("should login with valid credentials", async () => {
        mockFn(userLoginService).mockResolvedValue({
            success: true,
            message: "You are successfully signed in",
            token: "jwt-token",
        });

        const res = await request(app).post("/api/v1/user/login").send(validLoginBody);

        expect(res.status).toBe(200);
        expect(res.body.token).toBe("jwt-token");
    });

    it("should return 400 for an invalid payload", async () => {
        const res = await request(app)
            .post("/api/v1/user/login")
            .send({ email: "not-an-email", password: "short" });

        expect(res.status).toBe(400);
    });

    it("should return 500 when the service returns an error string", async () => {
        mockFn(userLoginService).mockResolvedValue("connection refused");

        const res = await request(app).post("/api/v1/user/login").send(validLoginBody);

        expect(res.status).toBe(500);
    });

    it("should return 401 for invalid credentials", async () => {
        mockFn(userLoginService).mockResolvedValue({
            success: false,
            message: "Invalid password was provided",
        });

        const res = await request(app).post("/api/v1/user/login").send(validLoginBody);

        expect(res.status).toBe(401);
    });
});

describe("PATCH /api/v1/user/otp-verification", () => {
    it("should verify the otp and return a token", async () => {
        mockFn(userVerificationService).mockResolvedValue({
            errorCode: 200,
            success: true,
            message: "User verified",
            token: "jwt-token",
        });

        const res = await request(app)
            .patch("/api/v1/user/otp-verification")
            .query({ email: "john@example.com", otp: "123456" });

        expect(res.status).toBe(200);
        expect(res.body.token).toBe("jwt-token");
        expect(userVerificationService).toHaveBeenCalledWith("john@example.com", "123456");
    });

    it("should return 400 when the otp is missing", async () => {
        const res = await request(app)
            .patch("/api/v1/user/otp-verification")
            .query({ email: "john@example.com" });

        expect(res.status).toBe(400);
    });
});

describe("PATCH /api/v1/user/forget-password/:email", () => {
    it("should send the forget password otp", async () => {
        mockFn(forgetPasswordOTPService).mockResolvedValue({
            errorCode: 200,
            success: true,
            message: "OTP sent",
        });

        const res = await request(app).patch("/api/v1/user/forget-password/john@example.com");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(forgetPasswordOTPService).toHaveBeenCalledWith("john@example.com");
    });

    it("should return 400 for an invalid email param", async () => {
        const res = await request(app).patch("/api/v1/user/forget-password/not-an-email");

        expect(res.status).toBe(400);
    });
});

describe("PATCH /api/v1/user/:email (otp resend)", () => {
    it("should resend the otp for the given email", async () => {
        mockFn(otpVerificationService).mockResolvedValue({
            errorCode: 200,
            success: true,
            message: "OTP resent",
        });

        const res = await request(app).patch("/api/v1/user/john@example.com");

        expect(res.status).toBe(200);
        expect(otpVerificationService).toHaveBeenCalledWith("john@example.com");
    });

    it("should return 400 for an invalid email param", async () => {
        const res = await request(app).patch("/api/v1/user/not-an-email");

        expect(res.status).toBe(400);
    });
});

describe("PATCH /api/v1/user/forget-password/:link (shadowed route, controller-level)", () => {
    it("should reset the password when given a valid link and password", async () => {
        mockFn(forgetPasswordService).mockResolvedValue({
            errorCode: 200,
            success: true,
            message: "Password updated",
        });

        const req = {
            params: { link: "reset-link-123" },
            body: { newPassword: "StrongPass123!" },
        } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;

        await forgetPasswordController(req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(200);
        expect(forgetPasswordService).toHaveBeenCalledWith("reset-link-123", "StrongPass123!");
    });

    it("should return 400 for a weak new password", async () => {
        const req = {
            params: { link: "reset-link-123" },
            body: { newPassword: "weak" },
        } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;

        await forgetPasswordController(req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(400);
    });
});