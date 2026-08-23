import dotenv from "dotenv"
import express, {type Express,type Request, type Response} from "express"
import morgan from "morgan";
import cors from "cors"
import { success } from "zod";
import featureFlagMiddleware from "./utils/middleware/featureFlagMiddleware";
import router from "./routes/router";
import { initRedis } from "./utils/cache/cache";
dotenv.config();

export const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(featureFlagMiddleware);

app.get("/", async (req: Request, res: Response) => {
    res.status(200).send("<div>Hello World</div>");
});

app.get("/health", async(req: Request, res: Response) => {
    return res.status(200).json({
        error: false,
        success: true,
        data: "Server is healthy"
    })
});

app.use("/api/v1", router);

const startServer = async () => {
    try {
        await initRedis();

        app.listen(3000, () => {
            console.log("Server running on http://localhost:3000");
        });
    } catch (error) {
        console.error("Failed to start application:", error);
        process.exit(1);
    }
};

startServer();

export default app;