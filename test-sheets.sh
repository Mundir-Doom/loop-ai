#!/bin/bash
# Quick test script for Google Sheets API

echo "🧪 Testing Google Sheets API..."
echo ""

# Read from .env
source .env

SHEET_ID="$VITE_GOOGLE_SHEET_ID"
API_KEY="$VITE_GOOGLE_SHEETS_API_KEY"
RANGE="$VITE_GOOGLE_SHEET_RANGE"

if [ -z "$API_KEY" ] || [ -z "$SHEET_ID" ]; then
  echo "❌ Error: Missing API_KEY or SHEET_ID in .env"
  exit 1
fi

echo "📊 Sheet ID: $SHEET_ID"
echo "🔑 API Key: ${API_KEY:0:20}..."
echo "📍 Range: $RANGE"
echo ""

URL="https://sheets.googleapis.com/v4/spreadsheets/$SHEET_ID/values/$RANGE?key=$API_KEY"

echo "🌐 Making request..."
RESPONSE=$(curl -s "$URL")

# Check if successful
if echo "$RESPONSE" | grep -q '"values"'; then
  echo ""
  echo "✅ SUCCESS! Google Sheets API is working!"
  echo ""
  echo "📄 Preview of your data:"
  echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
  exit 0
else
  echo ""
  echo "❌ FAILED! Error response:"
  echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
  echo ""
  echo "📋 Troubleshooting steps:"
  echo "1. Enable Google Sheets API: https://console.cloud.google.com/apis/library/sheets.googleapis.com"
  echo "2. Make sheet public: Share → Anyone with link → Viewer"
  echo "3. Check API key restrictions"
  echo "4. Wait 1-2 minutes after making changes"
  exit 1
fi
