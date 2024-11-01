import "reflect-metadata";
import express, { Request, Response } from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import * as Routes from "./routes/index";
import swaggerUi from "swagger-ui-express";
import swaggerFile from "./docs/swagger-output.json";

const app = express();

app.disable("x-powered-by");
app.use(express.json());

app.use(cors());

const apiV1Router = express.Router();

app.use("/api/v1", apiV1Router);

apiV1Router.use("/enterprises", Routes.enterpriseRouter());
apiV1Router.use("/profiles", Routes.profileRouter());
apiV1Router.use("/clients", Routes.clientRouter());
apiV1Router.use("/messages", Routes.messageRouter());
apiV1Router.use("/flows", Routes.flowRouter());
apiV1Router.use("/plans", Routes.pricingPlanRouter());
apiV1Router.use("/authenticated", Routes.authenticatedRoute());
apiV1Router.use("/session", Routes.sessionRouter());

app.use("/docs", swaggerUi.serve);
app.get("/docs", swaggerUi.setup(swaggerFile));

// Middleware para manejar rutas no encontradas
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: true, message: "Route not found" });
});

const APP_PORT = process.env.PORT ?? 1234;

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

app.listen(APP_PORT, () => {
  console.log(`Server running on http://localhost:${APP_PORT}`);
});
