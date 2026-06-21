const express = require("express");
const router = express.Router();
const { userDetails } = require("../controllers/userDashboard");

router.route("/details").post(userDetails);
// router.route("/user").get(details)


module.exports = router;
