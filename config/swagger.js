const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

// Load swagger.yaml
const swaggerDocument = YAML.load(
  path.join(__dirname, "../docs/swagger.yaml")
);

const swaggerSetup = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  console.log("Swagger Documentation Loaded → /api-docs");
};

module.exports = { swaggerSetup };
