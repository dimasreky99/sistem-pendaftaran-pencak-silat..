import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add doSendWa
do_send_wa_code = """  const doSendWa = async (msg: string, tgt?: string | string[], conts?: Contingent[]) => {
    const result = await sendAutoWhatsApp(msg, settings, tgt, conts);
    if (result && result.targets && result.targets.length > 0) {
      if (result.success) {
        appendLog("WA_SENT", `WhatsApp berhasil dikirim ke: ${result.targets.join(", ")}`);
      } else {
        appendLog("WA_FAILED", `Gagal kirim WhatsApp ke: ${result.targets.join(", ")}. Error: ${result.error}`);
      }
    }
  };
"""

content = content.replace('  const appendLog = (action: string, detail: string) => {', do_send_wa_code + '\n  const appendLog = (action: string, detail: string) => {')

content = content.replace('sendAutoWhatsApp(waMessage, settings, undefined, contingents);', 'doSendWa(waMessage, undefined, contingents);')
content = content.replace('sendAutoWhatsApp(waMessage, settings, c.nowa);', 'doSendWa(waMessage, c.nowa);')
content = content.replace('sendAutoWhatsApp(waMessage, settings, tgtContingent.nowa);', 'doSendWa(waMessage, tgtContingent.nowa);')

# Also remove sendAutoWhatsApp from timbang badan
timbang_badan_old = """          if (tgtContingent && tgtContingent.nowa && (status === "OVER" || status === "UNDER")) {
            const waMessage = `*INFO TIMBANG BADAN ATLET*\n\nHalo Kontingen ${a.kontingen},\nAtlet atas nama *${a.name}* baru saja melakukan timbang badan.\n\nHasil Timbang: ${weight} kg\nStatus: *${status}*\n\nMohon segera melapor ke meja panitia/admin terkait status berat badan ini.`;
            doSendWa(waMessage, tgtContingent.nowa);
          }"""

if timbang_badan_old in content:
    content = content.replace(timbang_badan_old, "")
else:
    print("timbang_badan_old not found!")

with open('src/App.tsx', 'w') as f:
    f.write(content)
