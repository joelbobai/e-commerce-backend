const express = require("express");
const { createNewUser, authenticateUser } = require("./controller");
const auth = require("./../../middleware/auth");
const refresh = require("./../../middleware/refreshToken");
const logout = require("./../../middleware/logout");
const User = require("./model");
const {
  sendVerificationOTPEmail,
} = require("./../email_verification/controller");
const router = express.Router();

// logout
router.post("/logout", auth, logout);
// refresh protected route
router.get("/refresh", refresh, auth, async (req, res) => {
  const userId = req.currenUser.user;
  let user;
  try {
    user = await User.findById(userId, "-password");
  } catch (error) {
    throw error;
  }
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }
  res.status(200).send({ user });
});
// protected route
router.get("/private_data", auth, async (req, res) => {
  const userId = req.currenUser.user;
  let user;
  try {
    user = await User.findById(userId, "-password");
  } catch (error) {
    throw error;
  }
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }

  //   res
  //     .status(200)
  //     .send(`You're in the private territory of ${req.currenUser.email}`);
  res.status(200).send({ user });
});

// Signin
router.post("/", async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.trim();
    password = password.trim();

    if (!(email && password)) {
      throw Error("Empty credentials supplied!");
    }
    const authenticatedUser = await authenticateUser({ email, password });
    // Check if the 'user ID' cookie exists
    if (req.cookies[`${authenticatedUser._id}`]) {
      // Remove the 'user ID' cookie
      req.cookies[`${authenticatedUser._id}`] = "";
    }
    await res.cookie(
      String(authenticatedUser._id),
      String(authenticatedUser.token),
      {
        path: "/",
        expires: new Date(Date.now() + 1000 * 60 * 55), // Set cookie to expire in 55 minutes
        httpOnly: true,
        sameSite: "lax",
      }
    );
    // Check if the 'connect.sid' cookie exists
    if (req.cookies["connect.sid"]) {
      // Remove the 'connect.sid' cookie
      res.cookie("connect.sid", "", { maxAge: 0 });
    }
    return res.status(200).json({
      message: "Successfully Logged In",
      user: {
        _id: authenticatedUser._id,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        profilePicture: authenticatedUser.profilePicture,
      },
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Signup
router.post("/signup", async (req, res) => {
  try {
    /* eslint-disable no-useless-escape */
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    // Regular expressions for validation
    const lowercaseRegex = /[a-z]/;
    const uppercaseRegex = /[A-Z]/;
    // Date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    let { name, email, date, password, passwordConfirm } = req.body;
    name = name.trim();
    email = email.trim();
    date = date.trim();
    password = password.trim();
    passwordConfirm = passwordConfirm.trim();

    if (!(name && email && password && date && passwordConfirm)) {
      throw Error("Empty input fields!");
    } else if (!/^[a-zA-Z ]*$/.test(name)) {
      throw Error("Invalid name entered");
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      throw Error("Invalid email entered");
    } else if (!dateRegex.test(date)) {
      throw Error("What you entered is not a date");
    } else if (password.length < 8) {
      throw Error("Password is too short!");
    } else if (
      !specialChars.test(password) ||
      !lowercaseRegex.test(password) ||
      !uppercaseRegex.test(password)
    ) {
      throw Error("Password must have special character, Lowercase, Uppercase");
    } else if (password !== passwordConfirm) {
      throw Error("The password is not the same with the Confirm-Password");
    } else {
      // good credential, create new user
      const newUser = await createNewUser({
        name,
        email,
        date,
        password,
      });

      await sendVerificationOTPEmail(email);

      res.status(200).json(newUser);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
