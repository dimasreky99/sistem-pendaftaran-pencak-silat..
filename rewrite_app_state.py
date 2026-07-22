import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Add import
if 'useFirebaseCollection' not in content:
    content = content.replace('import { \n  DEFAULT_SETTINGS', 'import { useFirebaseCollection, useFirebaseDoc } from "./useFirebaseState";\nimport { \n  DEFAULT_SETTINGS')

# 2. Replace state definitions
old_settings = """  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem("silat_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.classData || Object.keys(parsed.classData).length === 0) {
          parsed.classData = DEFAULT_KELAS_IPSI;
          localStorage.setItem("silat_settings", JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });"""

new_settings = '  const [settings, setSettings, isSettingsLoaded] = useFirebaseDoc<SystemSettings>("globals/settings", DEFAULT_SETTINGS);'
content = content.replace(old_settings, new_settings)

old_contingents = """  const [contingents, setContingents] = useState<Contingent[]>(() => {
    const CACHE_VERSION = "v4_contingents";
    if (localStorage.getItem("silat_cache_version_contingents") !== CACHE_VERSION) {
      localStorage.setItem("silat_cache_version_contingents", CACHE_VERSION);
      return INITIAL_CONTINGENTS;
    }
    const saved = localStorage.getItem("silat_contingents");
    return saved ? JSON.parse(saved) : INITIAL_CONTINGENTS;
  });"""

new_contingents = '  const [contingents, setContingents, isContingentsLoaded] = useFirebaseCollection<Contingent>("contingents", INITIAL_CONTINGENTS);'
content = content.replace(old_contingents, new_contingents)

old_athletes = """  const [athletes, setAthletes] = useState<Athlete[]>(() => {
    const CACHE_VERSION = "v4_athletes";
    if (localStorage.getItem("silat_cache_version") !== CACHE_VERSION) {
      localStorage.setItem("silat_cache_version", CACHE_VERSION);
      return INITIAL_ATHLETES;
    }
    const saved = localStorage.getItem("silat_athletes");
    return saved ? JSON.parse(saved) : INITIAL_ATHLETES;
  });"""

new_athletes = '  const [athletes, setAthletes, isAthletesLoaded] = useFirebaseCollection<Athlete>("athletes", INITIAL_ATHLETES);'
content = content.replace(old_athletes, new_athletes)

old_logs = """  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem("silat_logs");
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });"""

new_logs = '  const [logs, setLogs, isLogsLoaded] = useFirebaseCollection<ActivityLog>("logs", INITIAL_LOGS);'
content = content.replace(old_logs, new_logs)


# 3. Remove localStorage write useEffects
# Use regex to find and remove them
content = re.sub(r'  useEffect\(\(\) => \{\n    if \(settings\) \{\n      localStorage\.setItem\("silat_settings", JSON\.stringify\(settings\)\);\n    \}\n  \}, \[settings\]\);\n', '', content)
content = re.sub(r'  useEffect\(\(\) => \{\n    if \(contingents\.length >= 0\) \{\n      localStorage\.setItem\("silat_contingents", JSON\.stringify\(contingents\)\);\n    \}\n  \}, \[contingents\]\);\n', '', content)
content = re.sub(r'  useEffect\(\(\) => \{\n    if \(athletes\.length >= 0\) \{\n      localStorage\.setItem\("silat_athletes", JSON\.stringify\(athletes\)\);\n    \}\n  \}, \[athletes\]\);\n', '', content)
content = re.sub(r'  useEffect\(\(\) => \{\n    if \(logs\.length >= 0\) \{\n      localStorage\.setItem\("silat_logs", JSON\.stringify\(logs\)\);\n    \}\n  \}, \[logs\]\);\n', '', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
