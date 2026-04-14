import sys

file_path = "src/components/orders/SalesContractDocument.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace("export default function SalesContractDocument({\n  order,\n  bankInfo\n}: {\n  order: any,\n  bankInfo: any\n}) {", "export default function SalesContractDocument({\n  order,\n  bankInfo,\n  repUser\n}: {\n  order: any,\n  bankInfo: any,\n  repUser?: any\n}) {")

text = text.replace("export default function SalesContractDocument({\r\n  order,\r\n  bankInfo\r\n}: {\r\n  order: any,\r\n  bankInfo: any\r\n}) {", "export default function SalesContractDocument({\n  order,\n  bankInfo,\n  repUser\n}: {\n  order: any,\n  bankInfo: any,\n  repUser?: any\n}) {")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Fixed!")
