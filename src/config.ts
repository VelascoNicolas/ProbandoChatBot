import dotenv from "dotenv";
import { DatabaseType } from "typeorm";

import * as Entities from "./entities/index";

dotenv.config();

export const dbConfig = {
  type: (process.env.DB_TYPE as DatabaseType) || "postgres",
  url: process.env.DB_URL || "sqlite:memory",
  entities: Object.values(Entities),
  synchronize: process.env.SYNC_DATABASE || true,
};

//Limite de items devuetos por página
export const limit = 20;
