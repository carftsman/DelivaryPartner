const axios = require("axios");
 
exports.getBestRoute = async (req, res) => {
  try {
    const { origin, destination } = req.body;
 
    if (!origin || !destination) {
      return res.status(400).json({ message: "Origin & destination required" });
    }
 
    const url = "https://maps.googleapis.com/maps/api/directions/json";
 
    const response = await axios.get(url, {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        mode: "driving",
        departure_time: "now",
        alternatives: true,
        key: process.env.GOOGLE_KEY,
      },
    });
 
    const routes = response.data.routes;
 
    if (!routes || routes.length === 0) {
      return res.status(404).json({ message: "No routes found" });
    }
 
    // 🔥 Pick best ETA route
    let bestRoute = null;
    let minETA = Infinity;
 
    routes.forEach((route) => {
      const leg = route.legs[0];
      const eta = leg.duration_in_traffic?.value || leg.duration.value;
 
      if (eta < minETA) {
        minETA = eta;
        bestRoute = route;
      }
    });
 
    const leg = bestRoute.legs[0];
 
    return res.json({
      etaSeconds: minETA,
      etaText: leg.duration_in_traffic.text,
      distanceText: leg.distance.text,
      distanceMeters: leg.distance.value,
      polyline: bestRoute.overview_polyline.points,
      summary: bestRoute.summary,
      startAddress: leg.start_address,
      endAddress: leg.end_address,
    });
 
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch route" });
  }
};
 