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

    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
        description: "Local Server",
      },
    ],
  },

  apis: ["./routes/*.js"],
};


const swaggerSpec = swaggerJSDoc(options);

const swaggerSetup = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger Documentation Loaded → http://localhost:5000/api-docs");
};

module.exports = { swaggerSetup };
