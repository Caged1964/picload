if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStratergy = require("passport-local");
const multer = require("multer");
const { cloudinary, storage } = require("./cloudinary");
const upload = multer({ storage });
const MongoStore = require("connect-mongo");

const app = express();

const User = require("./models/user");
const { userSchema } = require("./JoiSchemas.js");
const catchAsync = require("./utils/catchAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { isLoggedIn, isOwner, isValidId } = require("./middleware.js");

const dbURL = process.env.DB_URL || "mongodb://127.0.0.1:27017/picload";
mongoose
  .connect(dbURL)
  .then(() => {
    console.log("Mongo Database Connected");
  })
  .catch((err) => {
    console.log("Database Connection Error : ");
    console.log(err);
  });

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(flash());

const secret = process.env.SECRET || "secretissecret";

const store = MongoStore.create({
  mongoUrl: dbURL,
  touchAfter: 24 * 60 * 60, // this here is in seconds and not miliseconds
  crypto: {
    secret,
  },
});

store.on("error", function (e) {
  console.log("Session Store Error", e);
});

const sessionConfig = {
  store: store,
  name: "picloadsession",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24,
    maxAge: 1000 * 60 * 60 * 24,
  },
};
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

app.get(
  "/",
  catchAsync(async (req, res) => {
    res.render("home");
  })
);

app.get(
  "/register",
  catchAsync(async (req, res) => {
    res.render("register");
  })
);

app.post(
  "/register",
  catchAsync(async (req, res) => {
    try {
      const { username, first_name, last_name, email, password } = req.body;
      const user = new User({ username, first_name, last_name, email });
      const regiteredUser = await User.register(user, password);
      req.login(regiteredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Successfully Registered. Welcome to PicUpLoad");
        res.redirect(`/user/${regiteredUser._id}`);
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/register");
    }
  })
);

app.get(
  "/login",
  catchAsync(async (req, res) => {
    res.render("login");
  })
);

app.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  catchAsync(async (req, res) => {
    req.flash("success", "Welcome Back !");
    res.redirect(`/user/${req.user._id}`);
  })
);

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Successfully logged out");
    res.redirect("/");
  });
});

app.get(
  "/user",
  isLoggedIn,
  isOwner,
  catchAsync(async (req, res) => {
    res.redirect(`/user/${req.user._id}`);
  })
);

app.get(
  "/user/:id",
  isValidId,
  isLoggedIn,
  isOwner,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    res.render("user", { user });
  })
);

app.get(
  "/user/:id/upload",
  isValidId,
  isLoggedIn,
  isOwner,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    res.render("upload", { user });
  })
);

app.put(
  "/user/:id",
  isValidId,
  isLoggedIn,
  isOwner,
  upload.array("image"),
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    user.images.push(...imgs);
    await user.save();
    req.flash("success", "Successfully uploaded the selected image(s)");
    res.redirect(`/user/${id}`);
  })
);

app.get(
  "/user/:id/remove",
  isValidId,
  isLoggedIn,
  isOwner,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    res.render("remove", { user });
  })
);

app.patch(
  //check here for deleteion
  "/user/:id",
  isValidId,
  isLoggedIn,
  isOwner,
  upload.array("image"),
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
        await cloudinary.uploader.destroy(filename);
      }
      await user.updateOne({
        $pull: { images: { filename: { $in: req.body.deleteImages } } },
      });
    }
    req.flash("success", "Successfully deleted the selected image(s)");
    res.redirect(`/user/${id}`);
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Uh Oh, Something Went Wrong";
  res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on PORT ${port}`);
});
