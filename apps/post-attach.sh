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
   curl -s -m 1 http://localhost:8788/ > /dev/null 2>&1 || \
   curl -s -m 1 http://localhost:8789/ > /dev/null 2>&1; then
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
    
    # Give services a moment to start
    sleep 2
    
    # Sync content to local KV
    echo ""
    echo "🔄 Syncing content to local KV..."
    if just sync-local > /dev/null 2>&1; then
        echo "✅ Content synchronized to local KV"
    else
        echo "⚠️  KV sync skipped (wrangler not available or KV not configured)"
    fi
    
    # Sync email templates
    echo ""
    just sync-email-templates
    
    # Start email template watcher in background
    echo ""
    echo "👀 Starting email template watcher in background..."
    nohup just watch-email-templates > /tmp/email-template-watch.log 2>&1 &
    echo "   Log: /tmp/email-template-watch.log"
    echo "   PID: $!"
fi

echo ""
echo "📚 Quick Commands:"
echo "  • cd apps && just status       - Check service status"
echo "  • cd apps && just dev-stop     - Stop all services"
echo "  • cd apps && just test-health  - Test endpoints"
echo "  • cd apps && just logs         - View recent logs"
echo ""
