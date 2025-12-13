#!/usr/bin/env bash
#
# Post-Create Script for Dev Container
# Runs after the dev container is created
# Installs dependencies for all services in apps/
#

set -e

echo "🎉 Dev Container Created!"
echo ""
echo "📦 Installing dependencies for all services..."
echo ""

cd ./apps

# Run deps for all services
just deps

echo ""
echo "✅ Post-create setup complete!"
echo ""
echo "Next steps:"
echo "  • Services will auto-start when you attach to the container"
echo "  • Or manually start with: cd apps && just dev-bg"
echo "  • Check status with: cd apps && just status"
echo ""
