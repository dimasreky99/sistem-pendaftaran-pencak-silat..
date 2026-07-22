with open('src/App.tsx', 'r') as f:
    content = f.read()

old_profile = """  const handleUpdateProfile = (updatedData: { pjName: string; nowa: string; photoUrl?: string }) => {
    if (!currentUser) return;

    setContingents(prev => prev.map(c => {
      if (c.username === currentUser.username) {
        return {
          ...c,
          pjName: updatedData.pjName,
          nowa: updatedData.nowa,
          photoUrl: updatedData.photoUrl
        };
      }
      return c;
    }));"""

new_profile = """  const handleUpdateProfile = (updatedData: { pjName: string; nowa: string; photoUrl?: string; managerPhotoUrl?: string; official1Name?: string; official1PhotoUrl?: string; official2Name?: string; official2PhotoUrl?: string; }) => {
    if (!currentUser) return;

    setContingents(prev => prev.map(c => {
      if (c.username === currentUser.username) {
        return {
          ...c,
          pjName: updatedData.pjName,
          nowa: updatedData.nowa,
          photoUrl: updatedData.photoUrl,
          managerPhotoUrl: updatedData.managerPhotoUrl,
          official1Name: updatedData.official1Name,
          official1PhotoUrl: updatedData.official1PhotoUrl,
          official2Name: updatedData.official2Name,
          official2PhotoUrl: updatedData.official2PhotoUrl
        };
      }
      return c;
    }));"""

content = content.replace(old_profile, new_profile)

with open('src/App.tsx', 'w') as f:
    f.write(content)
