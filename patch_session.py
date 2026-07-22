import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_session = """  // Session check for single device login
  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      const interval = setInterval(() => {
        const storedContingents = JSON.parse(localStorage.getItem("silat_contingents") || "[]");
        const storedUser = storedContingents.find((c: any) => c.username === currentUser.username);
        const currentSession = sessionStorage.getItem("current_session_token");
        if (storedUser && storedUser.sessionToken && storedUser.sessionToken !== currentSession) {
          alert("Sesi login Anda telah berakhir karena akun ini login di perangkat lain.");
          handleLogout();
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);"""

new_session = """  // Session check for single device login
  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      const storedUser = contingents.find((c: any) => c.username === currentUser.username);
      const currentSession = sessionStorage.getItem("current_session_token");
      if (storedUser && storedUser.sessionToken && storedUser.sessionToken !== currentSession) {
        alert("Sesi login Anda telah berakhir karena akun ini login di perangkat lain.");
        handleLogout();
      }
    }
  }, [currentUser, contingents]);"""

content = content.replace(old_session, new_session)

with open('src/App.tsx', 'w') as f:
    f.write(content)
