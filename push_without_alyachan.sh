#!/bin/bash
set -e

# Pastikan git ignore sudah mengabaikan folder/file yang tidak ingin di-commit
cat <<'EOF' > .gitignore
node_modules
Alyachan
settings.js
EOF

# Hapus dari index (tanpa menghapus dari disk)
git rm -r --cached Alyachan || true
git rm --cached settings.js || true

# Lakukan commit dan push
git add .gitignore
# tambahkan semua perubahan lain yang sudah kamu buat
git add -A

git commit -m "Exclude Alyachan folder and settings.js and update code"

git push
