import mongoose from "mongoose";

export const connectDatabase = async (mongodbUri: string): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  return mongoose.connect(mongodbUri);
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
};
