import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

(async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });

    server.on("error", (err) => {
      console.log("server error: ", err);
      process.exit(1);
    });
  } catch (error) {
    console.log("Failed to start the server: ", error);
    process.exit(1);
  }
})();
