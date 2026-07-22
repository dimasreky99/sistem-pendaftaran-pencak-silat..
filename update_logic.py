import re

with open('src/components/ScheduleModule.tsx', 'r') as f:
    content = f.read()

old_logic = r'  const getDayAndSessionCalc = \(partaiNum: number\) => \{\n    let remaining = partaiNum;\n    let dayNum = 1;\n    while \(true\) \{\n      const dayTotal = limitPagi \+ limitSiang \+ limitMalam;\n      if \(dayTotal <= 0\) return \{ dayNum, session: "PAGI", relNum: remaining \};\n      if \(remaining <= dayTotal\) \{\n        let session = "PAGI";\n        if \(remaining > limitPagi\) session = "SIANG";\n        if \(remaining > limitPagi \+ limitSiang\) session = "MALAM";\n        return \{ dayNum, session, relNum: remaining \};\n      \}\n      remaining -= dayTotal;\n      dayNum\+\+;\n    \}\n  \};'

new_logic = """  const getDayAndSessionCalc = (partaiNum: number) => {
    let remaining = partaiNum;
    let dayNum = 1;
    while (true) {
      const dayLim = dailyLimits[dayNum] || { pagi: autoSessionLimit, siang: autoSessionLimit, malam: autoSessionLimit };
      const dayTotal = dayLim.pagi + dayLim.siang + dayLim.malam;
      
      if (dayTotal <= 0) {
        dayNum++;
        if (dayNum > totalDays + 10) return { dayNum: 1, session: "PAGI", relNum: remaining }; // Fallback prevent infinite loop
        continue;
      }
      
      if (remaining <= dayTotal) {
        let session = "PAGI";
        if (remaining > dayLim.pagi) session = "SIANG";
        if (remaining > dayLim.pagi + dayLim.siang) session = "MALAM";
        return { dayNum, session, relNum: remaining };
      }
      remaining -= dayTotal;
      dayNum++;
    }
  };"""

content = re.sub(old_logic, new_logic, content, flags=re.DOTALL)

with open('src/components/ScheduleModule.tsx', 'w') as f:
    f.write(content)
print("Updated logic")
