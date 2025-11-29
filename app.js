const express = require("express");
const { swaggerSetup } = require("./config/swagger");
const helmet = require("helmet");
const morgan = require("morgan");


const app = express();

app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));


// Load Swagger
swaggerSetup(app);

// Routes
app.get("/", (req, res) => {
  res.send("Vega Delivery Partner API Running need docs go to /api-docs");
});

module.exports = app;
