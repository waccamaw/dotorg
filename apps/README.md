# Apps - Microservices Directory

This directory contains all microservices for the Waccamaw website.

## Services

- **member-services** (port 8787) - Member portal API for roll book updates
- **contact-service** (port 8788) - Contact form API with email routing

## Quick Commands

All commands run from the `apps/` directory:

```bash
cd apps

# Development
just dev-bg           # Start all services in background
just dev-stop         # Stop all services
just status           # Check which services are running

# Setup
just deps             # Install dependencies for all services

# Testing
just test-health      # Test all health endpoints
just logs             # View recent logs from all services
just logs-follow SERVICE  # Follow logs for a specific service

# Deployment
just deploy-all       # Deploy all services to production (with confirmation)

# Utilities
just run COMMAND      # Run a command in all services
just clean            # Clean all services
just info             # Show info about all services
```

## Adding a New Service

1. Create a new directory in `apps/` (e.g., `apps/my-service/`)
2. Add a `justfile` with these commands:
   - `deps` or `install` - Install dependencies
   - `dev-bg` - Start in background
   - `dev-stop` - Stop background service
   - `deploy` - Deploy to production (optional)
   - `clean` - Clean build artifacts (optional)
3. The service will automatically be included in `just dev-bg` and other commands

## Dev Container Integration

The dev container automatically:

- **On Create** (`postCreateCommand`): Runs `apps/post-create.sh` → `just deps`
  - Installs dependencies for all services
  
- **On Attach** (`postAttachCommand`): Runs `apps/post-attach.sh` → `just dev-bg`
  - Starts all services in background
  - Displays status and helpful commands

## Port Assignments

When adding services, use the next available port:

- 1313 - Hugo dev server (main site)
- 8787 - member-services
- 8788 - contact-service
- 8789 - (available)
- 8790 - (available)

Update `.devcontainer/devcontainer.json` `forwardPorts` when adding new services.

## Service Scripts

- **`justfile`** - Orchestrates all services
- **`post-create.sh`** - Runs on container creation
- **`post-attach.sh`** - Runs on container attach/reopen

## Example Workflow

```bash
# Check what's running
cd apps && just status

# View logs
just logs

# Stop all services
just dev-stop

# Start all services again
just dev-bg

# Test health endpoints
just test-health

# Run a command in all services
just run db-query "SELECT COUNT(*) FROM contact_submissions"
```

## Architecture

Each service is:
- **Independent** - Can be deployed separately
- **Self-contained** - Has its own package.json, database, config
- **Cloudflare Workers** - Deployed to the edge
- **Just-managed** - Uses justfile for task automation

## Documentation

Each service has its own documentation:

- `apps/member-services/README.md`
- `apps/contact-service/README.md`

---

**Built for the Waccamaw Indian People**
