const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

const logout = async (req, res, next) => {
  let cookies;
  if(req.headers.cookie){
    cookies = req.headers.cookie
  }else if(req.header("Authorization")){
    cookies = req.header("Authorization");
  }
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

    return res.status(200).json({ message: "Successfully Logged Out" });
  } catch (err) {
    return res
      .status(401)
      .json({ error: err.message, message: "Invalid Token provided!" });
  }

  // procceed with request
  // return next();
};

module.exports = logout;
