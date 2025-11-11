const RevenueCatService = {
  configure: async (userId) => {
    console.log("RevenueCat configured for:", userId);
    return true;
  },
  checkPremiumStatus: async () => {
    console.log("Checking premium status...");
    return false;
  },
  purchasePackage: async (pkg) => {
    console.log("Purchase attempted:", pkg);
    return { success: false, error: "Not implemented" };
  },
  restorePurchases: async () => {
    console.log("Restore purchases attempted");
    return true;
  },
  logOut: async () => {
    console.log("RevenueCat logged out");
    return true;
  },
};

export default RevenueCatService;
