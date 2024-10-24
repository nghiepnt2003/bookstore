const messageController = require("../app/controllers/MessageController");
const router = express.Router();

router.post("/:id", MessageController.sendMessage);
module.exports = router;
