import re

with open('src/lib/whatsapp.ts', 'r') as f:
    content = f.read()

content = content.replace('export const sendAutoWhatsApp = async (', 'export const sendAutoWhatsApp = async (\n  message: string, \n  settings: SystemSettings, \n  targetNumber?: string | string[], \n  contingents?: Contingent[]\n): Promise<{ success: boolean; targets: string[]; error?: string } | undefined> => {\n  if (!settings.waApiUrl) return { success: false, targets: [], error: "URL API WA tidak dikonfigurasi" };')

# We need to replace the old signature. Let's just rewrite the file.
