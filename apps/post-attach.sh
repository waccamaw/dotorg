#!/usr/bin/env bash
#
# Post-Attach Script for Dev Container
# Runs every time you attach/reopen the dev container
# Starts all services in background
#

set -e

echo "👋 Welcome back to the Waccamaw Dev Container!"
echo ""

cd ./apps

# Check if any services are already running
if curl -s -m 1 http://localhost:8787/ > /dev/null 2>&1 || \
   curl -s -m 1 http://localhost:8788/ > /dev/null 2>&1; then
    echo "⚠️  Some services are already running"
    echo ""
    just status
    echo ""
    echo "💡 Tip: Stop all with 'cd apps && just dev-stop'"
else
    echo "🚀 Starting all microservices..."
    echo ""
    
    # Start all services in background
    just dev-bg
fi

echo ""
echo "📚 Quick Commands:"
echo "  • cd apps && just status       - Check service status"
echo "  • cd apps && just dev-stop     - Stop all services"
echo "  • cd apps && just test-health  - Test endpoints"
echo "  • cd apps && just logs         - View recent logs"
echo ""
