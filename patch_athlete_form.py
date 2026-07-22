import re

with open('src/components/AthleteForm.tsx', 'r') as f:
    content = f.read()

old_code = """    if (!kelas) {
      alert("Silakan pilih kelas tanding atau seni!");
      return;
    }"""

new_code = """    if (!kelas) {
      alert("Silakan pilih kelas tanding atau seni!");
      return;
    }

    // Validate custom fields
    for (let i = 0; i < settings.customFields.length; i++) {
      if (!customData[i] || customData[i].trim() === "") {
        alert(`Kolom "${settings.customFields[i]}" wajib diisi!`);
        return;
      }
    }

    // Validate photo uploads
    for (let i = 0; i < settings.photoLabels.length; i++) {
      if (!fotos[i]) {
        alert(`Berkas "${settings.photoLabels[i]}" wajib diupload!`);
        return;
      }
    }"""

content = content.replace(old_code, new_code)

with open('src/components/AthleteForm.tsx', 'w') as f:
    f.write(content)
