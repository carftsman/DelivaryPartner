const riderClients = new Map();

exports.initRiderSocket = (wss) => {

  wss.on("connection", (ws) => {

    console.log("⚡ Socket Connected");

    ws.on("message", (msg) => {

      const data = JSON.parse(msg);

      // Rider joins dashboard
      if (data.type === "JOIN_RIDER") {

        riderClients.set(data.riderId, ws);
        ws.riderId = data.riderId;

        console.log("✅ Rider Registered:", data.riderId);
      }
    });

    ws.on("close", () => {

      if (ws.riderId) {
        riderClients.delete(ws.riderId);
        console.log("❌ Rider Disconnected:", ws.riderId);
      }
    });

  });

};


// PUSH REALTIME UPDATE
exports.emitRiderDashboard = (riderId, payload) => {

  const socket = riderClients.get(String(riderId));

  if (socket) {

    socket.send(JSON.stringify(payload));

    console.log("📊 Dashboard Update Sent:", payload);
  }
};
