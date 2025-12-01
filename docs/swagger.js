const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Vega Delivery Partner / Rider API",
      version: "1.0.0",
      description: "Rider Authentication + Registration + KYC APIs",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
        description: "Local Server",
      },
    ],
  },

  //Load swagger docs from route JS files
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

function swaggerSetup(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger UI running → http://localhost:5000/api-docs");
}

module.exports = { swaggerSetup };
