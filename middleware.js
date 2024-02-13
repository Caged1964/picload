const ExpressError = require("./utils/ExpressError.js");
const User = require("./models/user");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be Logged In");
    return res.redirect("/login");
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const owner = await User.findById(id);
  if (owner._id && !owner._id.equals(req.user._id)) {
    req.flash("error", "You do not have permission to view the page!");
    return res.redirect(`/`);
  }
  next();
};

module.exports.isValidId = async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    const msg = "User not found";
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
