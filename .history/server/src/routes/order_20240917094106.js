const { verifyAccessToken } = require("../app/middlewares/jwt");
const orderController = require("../app/controllers/OrderController");

const router = express.Router();
router.post("/checkout", [verifyAccessToken], orderController.checkout);
module.exports = router;
