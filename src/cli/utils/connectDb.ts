import { MongoClient } from "mongodb";

const connectDB = (url: string) => {
  const connection = new MongoClient(url);

  return connection;
};

export default connectDB;
