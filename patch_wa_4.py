import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern1 = r'        return \{\s+\.\.\.c,\s+paymentStatus: status\s+\};\s+\}\s+return c;\s+\}\)\);'
new_code1 = """        const waMessage = `*UPDATE PEMBAYARAN*\\n\\nHalo Kontingen ${c.contingentName},\\nStatus pembayaran Anda telah diubah menjadi: *${status}*.`;
        sendAutoWhatsApp(waMessage, settings, c.nowa);
        
        return {
          ...c,
          paymentStatus: status
        };
      }
      return c;
    }));"""
content = re.sub(pattern1, new_code1, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
