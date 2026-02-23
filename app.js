import "dotenv/config.js";
import cors from "cors";
import express from "express";
import connectDB from "./src/config/db.js";
import product from "./src/routes/product.route.js"
import farmer from "./src/routes/farmer.route.js"
import cart from "./src/routes/cart.route.js"
import order from "./src/routes/order.route.js"
import complaint from "./src/routes/complaint.route.js";
import contactRoutes from "./src/routes/contact.router.js"

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "*",
      "http://localhost:3000",
      "http://localhost:5173", 
      "http://localhost:8081", 
      "samriddhiwebsite-9kz6.vercel.app",
      process.env.VITE_ADMIN_BASE_URL
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);



app.use('/api/product', product);
app.use('/api/farmer',farmer );
app.use('/api/cart', cart );
app.use("/api/order", order);
app.use("/api/complaint", complaint);
app.use("/api/contact", contactRoutes);


app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong",
  });
});


app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT;
// const HOST = '0.0.0.0';

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    }); 
  } catch (error) {
    console.error("Server failed to start", error);
    process.exit(1);
  }
};

startServer()