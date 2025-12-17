const express = require("express");
const { swaggerSetup } = require("./config/swagger");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require('cors')

const riderRouter = require("./routes/riderRoute");
const locationRouter = require("./routes/locationRoute");
const aadharRoute = require("./routes/aadharRoutes");

const staticRouter = require("./routes/staticMobileOtpRoute");

const offlineStoreRoute = require("./routes/offlineStoreRoute");



const app = express();

app.use(cors())
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));
// app.use("/uploads", express.static("uploads"));

// Swagger
swaggerSetup(app);

// Routes
app.use("/api", riderRouter);
app.use("/api/location", locationRouter);
app.use("/aadhar", aadharRoute);

app.use("/api/mobile",staticRouter);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);


app.use("/api/offline-stores", offlineStoreRoute);

app.use("/api/admin/offline-stores", offlineStoreRoute);



app.get("/", (req, res) => {
  res.send("Vega Delivery Partner API Running. Open /api-docs");
});

module.exports = app;
