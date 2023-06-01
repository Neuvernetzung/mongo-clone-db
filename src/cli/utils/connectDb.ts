import { MongoClient } from "mongodb";
import mongoose from "mongoose";

const connectDB = (url: string) => {
  const connection = new MongoClient(url);

  return connection;
};

export default connectDB;
