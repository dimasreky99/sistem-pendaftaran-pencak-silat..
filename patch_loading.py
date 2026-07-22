import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_return = """  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-red-800 selection:text-white flex flex-col justify-between">"""

new_return = """  if (!isSettingsLoaded || !isContingentsLoaded || !isAthletesLoaded || !isLogsLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center font-sans">
        <span className="w-12 h-12 border-4 border-slate-700 border-t-red-600 rounded-full animate-spin mb-4"></span>
        <p className="font-bold text-lg">Menghubungkan ke Cloud Database...</p>
        <p className="text-slate-400 text-sm mt-2">Sinkronisasi data real-time perangkat.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-red-800 selection:text-white flex flex-col justify-between">"""

content = content.replace(old_return, new_return)

with open('src/App.tsx', 'w') as f:
    f.write(content)
