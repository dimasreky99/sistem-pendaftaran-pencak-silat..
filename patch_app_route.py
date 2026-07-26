import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add import
content = content.replace('import DashboardAdmin from "./components/DashboardAdmin";', 'import DashboardAdmin from "./components/DashboardAdmin";\nimport AdminStatistics from "./components/AdminStatistics";')

# Add route
route_case = """      case "statistik-distribusi":
        if (currentUser?.role === "admin") {
          return <AdminStatistics athletes={athletes} />;
        }
        return null;

"""

dashboard_case = '      case "dashboard":'
content = content.replace(dashboard_case, route_case + dashboard_case)

with open('src/App.tsx', 'w') as f:
    f.write(content)
