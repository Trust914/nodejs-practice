import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  //get the authorization data from the request headers
  const authHeader = req.headers["authorization"]; 
  const accessToken = authHeader && authHeader.split(" ")[1]; // authHeader returns the value : `Bearer {token}`

  // check if token exists in the header authorization
  if (!accessToken) {
    return res.status(401).json({
      success: false,
      message: "Access denied, please login or register to proceed",
    });
  }
  // decode the token
  try {
    const decodedTokenDetails = jwt.verify(accessToken, process.env.JWT_SECRET_KEY)

    req.userInfo = decodedTokenDetails
  } catch (err) {
    console.log("Authentication failed: ", err);
    res.status(500).json({
      userAuthenticated: false,
      message: "authentication failed",
      error: err,
    });
  }

  next();
}
