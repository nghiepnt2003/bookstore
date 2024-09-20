const router = express.Router();
router.post("/checkout", [verifyAccessToken], cartController.checkoutCart);
module.exports = router;
