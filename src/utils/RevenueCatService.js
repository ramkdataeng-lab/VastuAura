import { Purchases } from '@revenuecat/purchases-capacitor';

const REVENUECAT_API_KEY_IOS = 'appl_ooxzpzwxHOQNkUCjODAkqnLDbjJ';
const ENTITLEMENT_ID = 'premium';

export const RevenueCatService = {
  async init() {
    try {
      // Configuration for Capacitor iOS
      await Purchases.configure({ apiKey: REVENUECAT_API_KEY_IOS });
      console.log('RevenueCat Initialized');
    } catch (e) {
      console.warn('RevenueCat Init Failed:', e);
    }
  },

  async isPro() {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    } catch (e) {
      console.error("Failed to check pro status", e);
      return false;
    }
  },

  async getOfferings() {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (e) {
      console.error("Error fetching offerings", e);
      return null;
    }
  },

  async purchasePackage(pkg) {
    try {
       const { customerInfo } = await Purchases.purchasePackage(pkg);
       return { success: true, customerInfo };
    } catch (e) {
       if (!e.userCancelled) {
         return { success: false, error: e.message };
       }
       return { success: false, userCancelled: true };
    }
  }
};
