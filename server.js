const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const app = require("./app");

connectDB(); 

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});  


