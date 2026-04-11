#!/usr/bin/env bash
set -euo pipefail

OUT="zotero-annot-copy.xpi"

zip -j "$OUT" manifest.json bootstrap.js zotero-annot-copy.js

echo "Built $OUT"
