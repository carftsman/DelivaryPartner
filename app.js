const express = require("express");
const { swaggerSetup } = require("./config/swagger");
const helmet = require("helmet");
const morgan = require("morgan");

const riderRouter = require("./routes/riderRoute");
const locationRouter = require("./routes/locationRoute");
const aadharRoutes = require("./routes/aadharRoutes");

const app = express();

app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

// Swagger
swaggerSetup(app);

// Routes
app.use("/api", riderRouter);
app.use("/api/location", locationRouter);
app.use("/aadhar", aadharRoutes);

app.get("/", (req, res) => {
  res.send("Vega Delivery Partner API Running. Open /api-docs");
});

module.exports = app;
