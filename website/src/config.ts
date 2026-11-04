export const getPortalUrl = () => {
  if (typeof window !== 'undefined') {
    // If an explicit env var is set, use it
    const envUrl = import.meta.env.VITE_APP_PORTAL_URL;
    if (envUrl) {
      return envUrl.replace(/\/$/, '');
    }

    // If running on local development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
  }

  // Production Vercel Next.js Review System portal
  return 'https://qr-review-system-git-main-ubs3.vercel.app';
};
