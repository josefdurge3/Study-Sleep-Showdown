// Mock AdMob Service
// In a real Flutter app, this would wrap the google_mobile_ads package.
// Here we use Sonner toasts and visual overlays to simulate ads.

import { toast } from "sonner";

export const ADMOB_APP_ID = "ca-app-pub-0000000000000000~0000000000";
export const BANNER_AD_ID = "ca-app-pub-0000000000000000/0000000000";
export const INTERSTITIAL_AD_ID = "ca-app-pub-0000000000000000/0000000000";

const simulateAdDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const adService = {
  initialize: async () => {
    console.log(`AdMob Initialized: ${ADMOB_APP_ID}`);
    // Simulate init delay
    await simulateAdDelay(500);
  },

  showBannerAd: () => {
    console.log(`Showing Banner Ad: ${BANNER_AD_ID}`);
    // In a web mockup, we might just log this or show a small bottom bar
    // For this prototype, we'll assume the banner is part of the layout
    return true;
  },

  showInterstitialAd: async (placement: string) => {
    console.log(`Loading Interstitial Ad (${placement}): ${INTERSTITIAL_AD_ID}`);
    
    // Simulate ad loading and showing
    toast.loading("Loading Ad...", {
      description: "Mock AdMob Interstitial",
      duration: 1500,
      id: "ad-loader"
    });

    await simulateAdDelay(1500);
    
    toast.dismiss("ad-loader");
    toast.success("Ad Watched", {
      description: "Thanks for supporting Study vs Sleep!",
      duration: 2000,
    });
    
    return true;
  }
};
