import os

path = r"c:\Users\offic\Downloads\resocance\frontend\src\app\page.tsx"
with open(path, "r", encoding="utf8") as f:
    data = f.read()

data = data.replace('cursor: "none"', 'cursor: "pointer"')

with open(path, "w", encoding="utf8") as f:
    f.write(data)
