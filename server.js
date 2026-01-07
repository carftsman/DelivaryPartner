// const dotenv = require("dotenv");
// dotenv.config();

// const connectDB = require("./config/db");
// const app = require("./app");

// connectDB(); 


// app.listen(process.env.PORT, () => {
//   console.log(`Server running at http://localhost:${process.env.PORT}`);
// });  




const dotenv = require("dotenv");

dotenv.config();
 
const http = require("http");

const connectDB = require("./config/db");

const app = require("./app");

const initWebSocket = require("./webSocket");
 
// DB

connectDB();
 
// Create HTTP server

const server = http.createServer(app);
 
// Init WebSocket


 
// Start server

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {

  console.log(`Server running at http://localhost:${PORT}`);

});

 