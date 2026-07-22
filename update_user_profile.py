import re

with open('src/components/UserProfile.tsx', 'r') as f:
    content = f.read()

# Replace states
old_states = """  const [pjName, setPjName] = useState(currentUser.pjName || "");
  const [nowa, setNowa] = useState(currentUser.nowa || "");
  const [photoUrl, setPhotoUrl] = useState(currentUser.photoUrl || "");"""

new_states = """  const [pjName, setPjName] = useState(currentUser.pjName || "");
  const [nowa, setNowa] = useState(currentUser.nowa || "");
  const [photoUrl, setPhotoUrl] = useState(currentUser.photoUrl || "");
  const [managerPhotoUrl, setManagerPhotoUrl] = useState(currentUser.managerPhotoUrl || "");
  const [official1Name, setOfficial1Name] = useState(currentUser.official1Name || "");
  const [official1PhotoUrl, setOfficial1PhotoUrl] = useState(currentUser.official1PhotoUrl || "");
  const [official2Name, setOfficial2Name] = useState(currentUser.official2Name || "");
  const [official2PhotoUrl, setOfficial2PhotoUrl] = useState(currentUser.official2PhotoUrl || "");"""

content = content.replace(old_states, new_states)

# Replace handlePhotoUpload to be generic
old_upload = """  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran foto maksimal 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };"""

new_upload = """  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran foto maksimal 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setter(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };"""

content = content.replace(old_upload, new_upload)

# Replace handleSaveProfile
old_save = """  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pjName.trim()) {
      alert("Nama admin / penanggung jawab tidak boleh kosong!");
      return;
    }
    onUpdateProfile({ pjName, nowa, photoUrl });
  };"""

new_save = """  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pjName.trim()) {
      alert("Nama admin / penanggung jawab tidak boleh kosong!");
      return;
    }
    onUpdateProfile({ 
      pjName, 
      nowa, 
      photoUrl,
      managerPhotoUrl,
      official1Name,
      official1PhotoUrl,
      official2Name,
      official2PhotoUrl
    });
  };"""

content = content.replace(old_save, new_save)

with open('src/components/UserProfile.tsx', 'w') as f:
    f.write(content)
