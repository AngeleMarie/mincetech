const injectIO = (req, res, next) => {
    req.io = req.app.get('io');  // Retrieve io instance from app locals
    req.activeUsers = req.app.get('activeUsers');  // Retrieve activeUsers map from app locals
    next();
  };

  export default injectIO