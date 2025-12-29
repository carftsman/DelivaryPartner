const express = require("express");
const { swaggerSetup } = require("./config/swagger");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require('cors')

const riderRouter = require("./routes/riderRoute");
const locationRouter = require("./routes/locationRoute");
const aadharRoute = require("./routes/aadharRoutes");
const bankDetailsRoutes = require("./routes/bankDetailsRoutes");
const kitRouter = require("./routes/kitAddressRoutes");
<<<<<<< HEAD
const profileRouter=require("./routes/profileRoute")


=======
const slotRouter = require("./routes/slotsRoutes");
const adminRoutes = require("./routes/adminRoutes");
>>>>>>> a08c058f27c42ff7af3d40be30691e845e5678e4
const staticRouter = require("./routes/staticMobileOtpRoute");
const profileRoutes = require("./routes/profileRoutes")

// const offlineStoreRoute = require("./routes/offlineStoreRoute");



const app = express();

// app.use(cors())
app.use(
  cors({
    origin: "*", // You can restrict later to your frontend URL
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
      "Origin",
      "Content-Length",
      "Content-Disposition"
    ],
    credentials: false // change to true ONLY if using cookies
  })
);

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
app.use("/api/bank", bankDetailsRoutes);

app.use("/api/mobile",staticRouter);

app.use("/api/admin", adminRoutes);

app.use("/api/rider", kitRouter);
<<<<<<< HEAD

app.use("/",profileRouter)

=======
app.use("/api/slots", slotRouter);
>>>>>>> a08c058f27c42ff7af3d40be30691e845e5678e4

// app.use("/api/offline-stores", offlineStoreRoute);

// app.use("/api/admin/offline-stores", offlineStoreRoute);

app.use('/api/profile',profileRoutes)



app.get("/", (req, res) => {
  res.send("Vega Delivery Partner API Running. Open /api-docs");
});

module.exports = app;
