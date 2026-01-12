// const WebSocket = require("ws");
 
// /**
//  * orderId -> Set of sockets (RIDER + CUSTOMER)
//  */
// const orders = new Map();
 
// const initWebSocket = (server) => {
//   const wss = new WebSocket.Server({
//     server,
//     path: "/ws", // IMPORTANT
//   });
 
//   wss.on("connection", (ws, req) => {
//     console.log("🔌 WebSocket connected:", req.url);
 
//     try {
//       // ✅ SAFER query parsing
//       const query = req.url.split("?")[1];
//       if (!query) {
//         return ws.close(4001, "Query params required");
//       }
 
//       const params = new URLSearchParams(query);
//       const orderId = params.get("orderId");
//       const role = params.get("role");
//       const riderId = params.get("riderId");
//       const userId = params.get("userId");
 
//       // Validation
//       if (!orderId || !role) {
//         return ws.close(4001, "orderId & role required");
//       }
 
//       if (role === "RIDER" && !riderId) {
//         return ws.close(4002, "riderId required");
//       }
 
//       if (role === "CUSTOMER" && !userId) {
//         return ws.close(4003, "userId required");
//       }
 
//       // Attach metadata
//       ws.orderId = orderId;
//       ws.role = role;
//       ws.riderId = riderId;
//       ws.userId = userId;
 
//       // Join order room
//       if (!orders.has(orderId)) {
//         orders.set(orderId, new Set());
//       }
//       orders.get(orderId).add(ws);
 
//       console.log(`✅ ${role} joined order ${orderId}`);
 
//       // Rider sends GPS
//       ws.on("message", (message) => {
//         if (ws.role !== "RIDER") return;
 
//         let data;
//         try {
//           data = JSON.parse(message.toString());
//         } catch {
//           return;
//         }
 
//         if (!data.lat || !data.lng) return;
 
//         const payload = JSON.stringify({
//           orderId,
//           riderId: ws.riderId,
//           lat: data.lat,
//           lng: data.lng,
//           ts: Date.now(),
//         });
 
//         // Broadcast to all (customer + rider)
//         for (const client of orders.get(orderId)) {
//           if (client.readyState === WebSocket.OPEN) {
//             client.send(payload);
//           }
//         }
//       });
 
//       ws.on("close", () => {
//         orders.get(orderId)?.delete(ws);
//         if (orders.get(orderId)?.size === 0) {
//           orders.delete(orderId);
//         }
//         console.log(`❌ ${role} left order ${orderId}`);
//       });
 
//     } catch (err) {
//       console.error("WS error:", err);
//       ws.close(4000, "Connection error");
//     }
//   });
// };
 
// module.exports = initWebSocket;
 
 const WebSocket = require("ws");

const riderSockets = new Map(); // riderId -> ws
 
const initWebSocket = (server) => {

  const wss = new WebSocket.Server({

    server,

    path: "/ws/rider"

  });
 
  wss.on("connection", (ws, req) => {

    const params = new URLSearchParams(req.url.split("?")[1]);

    const riderId = params.get("riderId");
 
    if (!riderId) {

      ws.close();

      return;

    }
 
    riderSockets.set(riderId, ws);
 
    ws.on("close", () => {

      riderSockets.delete(riderId);

    });

  });

};
 
module.exports = { initWebSocket, riderSockets };

 