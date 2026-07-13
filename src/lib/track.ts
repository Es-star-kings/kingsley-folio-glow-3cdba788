import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "kp.session_id";

const sessionId = () => {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

const detectDevice = (ua: string) => {
  if (/mobile/i.test(ua)) return "mobile";
  if (/tablet|ipad/i.test(ua)) return "tablet";
  return "desktop";
};

const detectBrowser = (ua: string) => {
  if (/edg/i.test(ua)) return "Edge";
  if (/chrome/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  if (/firefox/i.test(ua)) return "Firefox";
  return "Other";
};

const detectOS = (ua: string) => {
  if (/windows/i.test(ua)) return "Windows";
  if (/mac os/i.test(ua)) return "macOS";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/linux/i.test(ua)) return "Linux";
  return "Other";
};

export const trackPageView = async (path: string) => {
  try {
    const ua = navigator.userAgent;
    await supabase.from("page_views").insert({
      path,
      referrer: document.referrer || null,
      user_agent: ua,
      device: detectDevice(ua),
      browser: detectBrowser(ua),
      os: detectOS(ua),
      session_id: sessionId(),
    });
  } catch {
    /* ignore */
  }
};
