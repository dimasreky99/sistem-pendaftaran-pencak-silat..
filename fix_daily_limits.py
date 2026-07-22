with open('src/components/ScheduleModule.tsx', 'r') as f:
    content = f.read()

old_state = "  const [dailyLimits, setDailyLimits] = useState<Record<number, { pagi: number; siang: number; malam: number; }>>({});"
new_state = """  const [dailyLimits, setDailyLimits] = useState<Record<number, { pagi: number; siang: number; malam: number; }>>(() => {
    const saved = localStorage.getItem("silat_schedule_daily_limits");
    return saved ? JSON.parse(saved) : {};
  });
  
  useEffect(() => {
    localStorage.setItem("silat_schedule_daily_limits", JSON.stringify(dailyLimits));
  }, [dailyLimits]);"""

content = content.replace(old_state, new_state)

with open('src/components/ScheduleModule.tsx', 'w') as f:
    f.write(content)
print("Done fix daily limits save")
