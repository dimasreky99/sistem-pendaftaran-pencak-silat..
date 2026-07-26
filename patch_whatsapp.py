import re

with open('src/lib/whatsapp.ts', 'r') as f:
    content = f.read()

pattern = r'export const sendAutoWhatsApp = async \(message: string, settings: SystemSettings, targetNumber\?: string\) => \{.*?^\}'
new_code = """import { Contingent } from "../types";

export const sendAutoWhatsApp = async (
  message: string, 
  settings: SystemSettings, 
  targetNumber?: string | string[], 
  contingents?: Contingent[]
) => {
  if (!settings.waApiUrl) return;

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

  if (targets.length === 0) return;

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
      console.error("Failed to send WhatsApp notification", await res.text());
    } else {
      console.log("WhatsApp notification sent successfully to", targetString);
    }
  } catch (err) {
    console.error("Error sending WhatsApp notification", err);
  }
};"""

content = re.sub(pattern, new_code, content, flags=re.DOTALL | re.MULTILINE)

with open('src/lib/whatsapp.ts', 'w') as f:
    f.write(content)
