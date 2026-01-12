


// const dotenv = require("dotenv");

// dotenv.config();
 
// const http = require("http");

// const connectDB = require("./config/db");

// const app = require("./app");

// const initWebSocket = require("./webSocket");
 
// // DB

// connectDB();
 
// // Create HTTP server

// const server = http.createServer(app);
 
// // Init WebSocket


 
// // Start server

// const PORT = process.env.PORT || 4000;

// server.listen(PORT, () => {

//   console.log(`Server running at http://localhost:${PORT}`);

// });

  
 
 
 
 
const dotenv = require("dotenv");
dotenv.config();
 
const http = require("http");
const connectDB = require("./config/db");
const app = require("./app");
const {initWebSocket} = require("./webSocket");
 
connectDB();
 
// ONE HTTP SERVER
const server = http.createServer(app);
 
// Attach WebSocket to SAME server
initWebSocket(server);
 
const PORT = process.env.PORT || 4000;
 
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
 
 