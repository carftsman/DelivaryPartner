const express=require('express')
 const{ WebSocketServer }=require('ws')
 
const app = express()
 const httpServer = app.listen(8080)
 
 const wss = new WebSocketServer({ server: httpServer });
// orderId -> Set of sockets
const orders = new Map();
 
wss.on("connection", async (ws, req) => {
  try {
    // 1️⃣ Parse query params
    const params = new URLSearchParams(req.url.replace("/?", ""));
    const orderId = params.get("orderId");
    const role = params.get("role");
    const riderId = params.get("riderId");
    const userId = params.get("userId");
 
    // 2️⃣ Basic validation
    if (!orderId || !role) {
      return ws.close(4001, "orderId & role required");
    }
 
    if (role === "RIDER" && !riderId) {
      return ws.close(4002, "riderId required for rider");
    }
 
    if (role === "CUSTOMER" && !userId) {
      return ws.close(4003, "userId required for customer");
    }
 
    // 3️⃣ DB-level validation (IMPORTANT)
    /**
     * Example checks (pseudo):
     * - Is orderId valid?
     * - Is rider assigned to this order?
     * - Is user owner of this order?
     */
    // await validateOrderAccess(orderId, role, riderId || userId);
 
    // 4️⃣ Attach metadata to socket
    ws.orderId = orderId;
    ws.role = role;
    ws.riderId = riderId;
    ws.userId = userId;
 
    // 5️⃣ Join order room
    if (!orders.has(orderId)) {
      orders.set(orderId, new Set());
    }
    orders.get(orderId).add(ws);
 
    // 6️⃣ Listen for messages (GPS updates)
    ws.on("message", (msg) => {
      if (ws.role !== "RIDER") return;
 
      const data = JSON.parse(msg);
      if (!data.lat || !data.lng) return;
 
      const payload = JSON.stringify({
        orderId,
        riderId: ws.riderId,
        lat: data.lat,
        lng: data.lng,
        ts: Date.now(),
      });
 
      for (const client of orders.get(orderId)) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      }
    });
 
    // 7️⃣ Cleanup on disconnect
    ws.on("close", () => {
      orders.get(orderId)?.delete(ws);
      if (orders.get(orderId)?.size === 0) {
        orders.delete(orderId);
      }
    });
 
  } catch (err) {
    ws.close(4000, "Connection error");
  }
});
 
console.log("✅ WS server running on :8080");
 