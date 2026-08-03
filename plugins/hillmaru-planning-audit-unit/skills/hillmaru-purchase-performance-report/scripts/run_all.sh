#!/bin/bash
set -e
cd "$(dirname "$0")"
python3 prep_data.py
python3 finalize_data.py
python3 canon_merge.py > /dev/null
python3 export_json.py > /dev/null
python3 export_yoy.py
node generate2.js
python3 /mnt/skills/public/pptx/scripts/office/validate.py output.pptx
echo "=== pipeline complete ==="
