import { SystemSettings, Contingent } from "../types";

export const sendAutoWhatsApp = async (
  message: string, 
  settings: SystemSettings, 
  targetNumber?: string | string[], 
  contingents?: Contingent[]
): Promise<{ success: boolean; targets: string[]; error?: string }> => {
  if (!settings.waApiUrl) return { success: false, targets: [], error: "URL API WA tidak dikonfigurasi" };
  
  let targets: string[] = [];
  if (targetNumber) {
    targets = Array.isArray(targetNumber) ? targetNumber : [targetNumber];
  } else if (contingents) {
    const adminTargets = contingents
      .filter(c => c.role === "admin" && c.receiveNotifications !== false && c.nowa)
      .map(c => c.nowa);
    targets = adminTargets.length > 0 ? adminTargets : (settings.adminWaNumber ? [settings.adminWaNumber] : []);
  } else if (settings.adminWaNumber) {
    targets = [settings.adminWaNumber];
  }

  if (targets.length === 0) return { success: false, targets: [], error: "Tidak ada target penerima" };

  const targetString = targets.join(",");

  try {
    const res = await fetch(settings.waApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": settings.waApiKey || ""
      },
      body: JSON.stringify({
        target: targetString,
        message: message
      })
    });
    
    if (!res.ok) {
      const errText = await res.text();
      console.error("Failed to send WhatsApp notification", errText);
      return { success: false, targets, error: errText };
    } else {
      console.log("WhatsApp notification sent successfully to", targetString);
      return { success: true, targets };
    }
  } catch (err: any) {
    console.error("Error sending WhatsApp notification", err);
    return { success: false, targets, error: err.message };
  }
};
