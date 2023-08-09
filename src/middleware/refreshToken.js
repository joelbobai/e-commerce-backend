const jwt = require("jsonwebtoken");

const { JWT_SECRET, JWT_EXPIRY } = process.env;

const refreshToken = async (req, res, next) => {
  let cookies = req.headers.cookie;
  if (!cookies) {
    return res.status(403).send("Access Denied, Token is required!");
  }
  let prevToken = cookies.split("=")[1];

  try {
    if (!prevToken)
      return res.status(403).send("Access Denied, Token is required!");

    if (prevToken.startsWith("Bearer ")) {
      prevToken = prevToken.slice(7, prevToken.length).trimLeft();
    }

    const verified = await jwt.verify(String(prevToken), JWT_SECRET);
    res.clearCookie(`${verified.user}`);
    req.cookies[`${verified.user}`] = "";

    const token = await jwt.sign({ user: verified.user }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });
    // console.log("new", token);
    await res.cookie(String(verified.user), String(token), {
      path: "/",
      expires: new Date(Date.now() + 1000 * 60 * 55), // Set cookie to expire in 55 minutes
      httpOnly: true,
      sameSite: "lax",
    });
    req.currenUser = verified.user;
  } catch (err) {
    return res
      .status(401)
      .json({ error: err.message, message: "Invalid Token provided!" });
  }

  // procceed with request
  return next();
};

module.exports = refreshToken;
