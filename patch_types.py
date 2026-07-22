import re

with open('src/types.ts', 'r') as f:
    content = f.read()

content = content.replace('id?: string; // unique ID or username', 'id: string; // unique ID or username')
content = content.replace('export interface Athlete {\n  id?: string;', 'export interface Athlete {\n  id: string;')
content = content.replace('export interface ActivityLog {\n  id?: string;', 'export interface ActivityLog {\n  id: string;')

with open('src/types.ts', 'w') as f:
    f.write(content)
