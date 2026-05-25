import dotenv from "dotenv";

dotenv.config();

export type AppConfig = {
  nodeEnv: string;
  port: number;
  mongodbUri: string;
};

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const getConfig = (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3001),
  mongodbUri: required("MONGODB_URI")
});
