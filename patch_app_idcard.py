import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace onViewOfficialId
old_view = """              onViewOfficialId={() => {
                setSelectedAthlete({
                  id: "OFFICIAL_PREVIEW",
                  name: currentUser.pjName,
                  nik: "OFFICIAL",
                  tglLahir: "",
                  jk: "Putra",
                  kategori: "Official",
                  kelas: "OFFICIAL TEAM",
                  kontingen: currentUser.contingentName,
                  nowa: "",
                  customData: [],
                  fotos: [],
                  statusAcc: "Belum Lengkap",
                  isAcc: true,
                  isOfficial: true
                });
                setIsViewingIdCard(true);
              }}"""

new_view = """              onViewOfficialId={() => {
                setSelectedAthlete({
                  id: "OFFICIAL_PREVIEW",
                  name: "OFFICIALS",
                  nik: "OFFICIAL",
                  tglLahir: "",
                  jk: "Putra",
                  kategori: "Official",
                  kelas: "OFFICIAL TEAM",
                  kontingen: currentUser.contingentName,
                  nowa: "",
                  customData: [],
                  fotos: [],
                  statusAcc: "Belum Lengkap",
                  isAcc: true,
                  isOfficial: true
                });
                setIsViewingIdCard(true);
              }}"""

content = content.replace(old_view, new_view)

old_preview = """                  <IdCardPreview
                    athlete={selectedAthlete}
                    settings={settings}
                    onCancel={() => {
                      setIsViewingIdCard(false);
                      setSelectedAthlete(null);
                    }}
                    }}
                  />"""

new_preview = """                  <IdCardPreview
                    athletes={
                      selectedAthlete.id === "OFFICIAL_PREVIEW" && currentUser ? [
                        { name: currentUser.pjName || "Penanggung Jawab", kontingen: currentUser.contingentName, kategori: "Official", kelas: "", id: "mgr", isOfficial: true, officialRole: "MANAGER", photoUrl: currentUser.managerPhotoUrl },
                        ...(currentUser.official1Name || currentUser.official1PhotoUrl ? [{ name: currentUser.official1Name || currentUser.contingentName, kontingen: currentUser.contingentName, kategori: "Official", kelas: "", id: "off1", isOfficial: true, officialRole: "OFFICIAL", photoUrl: currentUser.official1PhotoUrl }] : [{ name: currentUser.contingentName, kontingen: currentUser.contingentName, kategori: "Official", kelas: "", id: "off1", isOfficial: true, officialRole: "OFFICIAL" }]),
                        ...(currentUser.official2Name || currentUser.official2PhotoUrl ? [{ name: currentUser.official2Name || currentUser.contingentName, kontingen: currentUser.contingentName, kategori: "Official", kelas: "", id: "off2", isOfficial: true, officialRole: "OFFICIAL", photoUrl: currentUser.official2PhotoUrl }] : [{ name: currentUser.contingentName, kontingen: currentUser.contingentName, kategori: "Official", kelas: "", id: "off2", isOfficial: true, officialRole: "OFFICIAL" }])
                      ] : [selectedAthlete]
                    }
                    settings={settings}
                    onCancel={() => {
                      setIsViewingIdCard(false);
                      setSelectedAthlete(null);
                    }}
                  />"""

content = content.replace(old_preview, new_preview)

with open('src/App.tsx', 'w') as f:
    f.write(content)
