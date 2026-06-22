const fs = require('fs');
const path = require('path');

function replaceImageImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fp = path.join(dir, file);
    if (fs.statSync(fp).isDirectory()) {
      replaceImageImports(fp);
    } else if (fp.endsWith('.tsx') && !fp.includes('SafeImage.tsx') && !fp.includes('Logo.tsx') && !fp.includes('ChatRoom.tsx')) {
      let content = fs.readFileSync(fp, 'utf8');
      if (content.includes('next/image')) {
        content = content.replace(/import Image from ["']next\/image["'];/g, 'import { SafeImage as Image } from "@/components/SafeImage";');
        fs.writeFileSync(fp, content);
      }
    }
  }
}

replaceImageImports('c:/Users/offic/Downloads/resocance/frontend/src');
