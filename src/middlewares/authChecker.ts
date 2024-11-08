
export const isAuthenticated = (req:any, res:any, next:any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};
