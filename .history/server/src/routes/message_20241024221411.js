const messageController = require("../app/controllers/MessageController");
const router = express.Router();

router.get("/:id", discountController.getDiscountById);
