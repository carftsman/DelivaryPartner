const WebSocket = require("ws");
 
const riderSockets = new Map();   // riderId -> ws

const orderRooms = new Map();     // orderId -> Set of ws
 
const initWebSocket = (server) => {

  const wss = new WebSocket.Server({

    server,

    path: "/ws", // ✅ single WS entry

  });
 
  console.log("🟢 Unified WebSocket running on /ws");
 
  wss.on("connection", (ws, req) => {

    try {

      const query = req.url.split("?")[1];

      if (!query) {

        ws.close(4001, "Query params required");

        return;

      }
 
      const params = new URLSearchParams(query);
 
      const type = params.get("type"); // RIDER_NOTIFICATION | ORDER_TRACKING

      const riderId = params.get("riderId");

      const orderId = params.get("orderId");

      const role = params.get("role"); // RIDER | CUSTOMER

      const userId = params.get("userId");
 
      /* ===========================

         1️⃣ RIDER NOTIFICATION SOCKET

      ============================ */

      if (type === "RIDER_NOTIFICATION") {

        if (!riderId) {

          ws.close(4002, "riderId required");

          return;

        }
 
        riderSockets.set(riderId, ws);

        ws.socketType = "RIDER_NOTIFICATION";

        ws.riderId = riderId;
 
        console.log("🔔 Rider notification connected:", riderId);
 
        ws.on("close", () => {

          riderSockets.delete(riderId);

          console.log("❌ Rider notification disconnected:", riderId);

        });
 
        return;

      }
 
      /* ===========================

         2️⃣ ORDER TRACKING SOCKET

      ============================ */

      if (!orderId || !role) {

        ws.close(4003, "orderId & role required");

        return;

      }
 
      if (role === "RIDER" && !riderId) {

        ws.close(4004, "riderId required for rider");

        return;

      }
 
      if (role === "CUSTOMER" && !userId) {

        ws.close(4005, "userId required for customer");

        return;

      }
 
      ws.socketType = "ORDER_TRACKING";

      ws.orderId = orderId;

      ws.role = role;

      ws.riderId = riderId;

      ws.userId = userId;
 
      if (!orderRooms.has(orderId)) {

        orderRooms.set(orderId, new Set());

      }

      orderRooms.get(orderId).add(ws);
 
      console.log(`📦 ${role} joined order ${orderId}`);
 
      // Rider sends GPS

      ws.on("message", (message) => {

        if (ws.role !== "RIDER") return;
 
        let data;

        try {

          data = JSON.parse(message.toString());

        } catch {

          return;

        }
 
        if (!data.lat || !data.lng) return;
 
        const payload = JSON.stringify({

          type: "LIVE_LOCATION",

          orderId,

          riderId: ws.riderId,

          lat: data.lat,

          lng: data.lng,

          ts: Date.now(),

        });
 
        for (const client of orderRooms.get(orderId)) {

          if (client.readyState === WebSocket.OPEN) {

            client.send(payload);

          }

        }

      });
 
      ws.on("close", () => {

        orderRooms.get(orderId)?.delete(ws);

        if (orderRooms.get(orderId)?.size === 0) {

          orderRooms.delete(orderId);

        }

        console.log(`❌ ${role} left order ${orderId}`);

      });
 
    } catch (err) {

      console.error("WS error:", err);

      ws.close(4000, "WS error");

    }

  });

};
 
/* ===========================

   🔔 NOTIFY RIDER POPUP

=========================== */

const notifyRider = (riderId, payload) => {

  const ws = riderSockets.get(riderId);

  if (ws && ws.readyState === WebSocket.OPEN) {

    ws.send(JSON.stringify(payload));

  }

};
 
module.exports = {

  initWebSocket,

  notifyRider,

};

 