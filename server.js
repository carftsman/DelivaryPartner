


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
// const { initRiderSocket } = require("./sockets/rider.socket");

 
connectDB();
 
// ONE HTTP SERVER
const server = http.createServer(app);
 
// Attach WebSocket to SAME server
<<<<<<< Updated upstream
initWebSocket(server);  
// initRiderSocket(server);
=======
initWebSocket(server);
>>>>>>> Stashed changes
 
const PORT = process.env.PORT || 4000;
 
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
 
 