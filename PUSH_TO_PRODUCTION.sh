#!/bin/bash

echo "🏥 ================================ 🏥"
echo "   BIHAG v2.0 DELIVERY IN PROGRESS"
echo "🏥 ================================ 🏥"
echo ""
echo "💪 Contractions detected! 2 commits ready to push!"
echo ""
git log --oneline -2
echo ""
echo "📋 To deliver this baby, we need your GitHub credentials:"
echo ""
echo "Option 1: Personal Access Token (RECOMMENDED)"
echo "  1. Visit: https://github.com/settings/tokens/new"
echo "  2. Create token with 'repo' scope"
echo "  3. Run: git push https://rithviksj:YOUR_TOKEN@github.com/rithviksj/bihag.git main"
echo ""
echo "Option 2: GitHub CLI (if installed)"
echo "  Run: gh auth login"
echo "  Then: git push origin main"
echo ""
echo "Option 3: I'll try pushing now (may ask for password)..."
echo ""
read -p "Press Enter to attempt push, or Ctrl+C to do it manually..."

git push origin main

