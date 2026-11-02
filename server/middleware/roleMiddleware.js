export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "login required to access this resource",
      });
    }
    if (!allowedRoles.includes(req.user.allowedRoles)) {
      return res.status(403).json({
        success: false,
        message: "you do not have permission to perform this action",
      });
    }
    next();
  };
};
