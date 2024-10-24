const messageController = require("../app/controllers/MessageController");
const router = express.Router();

router.get("/:id", MessageController.getDiscountById);
module.exports = router;
