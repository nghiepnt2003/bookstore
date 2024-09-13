const isAdmin = async (req, res, next) => {
  try {
    const { role } = req.user;
    const userRole = await Role.findById(role);
    if (!userRole || userRole?.name !== "Admin")
      return res
        .status(401)
        .json({ success: false, message: "REQUIRE ADMIN ROLE" });
    next();
  } catch (error) {
    next(error);
  }
};
module.exports = { validateReferencesProduct, validateReferencesFeedback };
