const messageController = require("../app/controllers/MessageController");
const router = express.Router();

router.post("/send", MessageController.sendMessage);
module.exports = router;
