#!/bin/bash
# Delete all categories from Micro.blog using the API
# API docs: https://help.micro.blog/t/api-json-endpoints/42

API_TOKEN="762E14C55C3A7F2601FC"
BASE_URL="https://micro.blog"

# Get all categories
echo "Fetching current categories..."
curl -s -H "Authorization: Bearer $API_TOKEN" \
  "$BASE_URL/categories" | jq .

echo ""
echo "The Micro.blog API doesn't have a bulk delete endpoint for categories."
echo "Categories are automatically created when posts use them and removed when no posts use them."
echo ""
echo "To clean up the malformed categories (like '[\"community\"', 'updates\"]', etc),"
echo "you need to either:"
echo "1. Delete the posts that have those malformed categories"
echo "2. Edit those posts to fix the categories"
echo "3. Wait for the new import with proper comma-separated categories to overwrite them"
echo ""
echo "Would you like me to:"
echo "A) Show which posts have malformed categories?"
echo "B) Create a script to update posts with correct categories?"
