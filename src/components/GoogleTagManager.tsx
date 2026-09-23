import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { normalizeGtmId } from "@/lib/gtm";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const SCRIPT_ID = "gtm-script";
const NOSCRIPT_ID = "gtm-noscript";

function removeGtmNodes() {
  document.getElementById(SCRIPT_ID)?.remove();
  document.getElementById(NOSCRIPT_ID)?.remove();
}

function injectGtm(containerId: string) {
  if (document.getElementById(SCRIPT_ID)) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    "gtm.start": new Date().getTime(),
    event: "gtm.js",
  });

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
  document.head.appendChild(script);

  const noscript = document.createElement("noscript");
  noscript.id = NOSCRIPT_ID;
  noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
  document.body.insertBefore(noscript, document.body.firstChild);
}

export function GoogleTagManager() {
  const { settings } = useSiteSettings();
  const location = useLocation();
  const containerId = normalizeGtmId(settings.gtm_id);

  useEffect(() => {
    if (!containerId) {
      removeGtmNodes();
      return;
    }
    injectGtm(containerId);
  }, [containerId]);

  useEffect(() => {
    if (!containerId) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "virtualPageview",
      page_path: `${location.pathname}${location.search}`,
    });
  }, [containerId, location.pathname, location.search]);

  return null;
}
