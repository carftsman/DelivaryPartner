const router = require("express").Router();
const { markOrderDelivered } = require("../controllers/order.controller");

router.put("/deliver/:id", markOrderDelivered);

module.exports = router;
