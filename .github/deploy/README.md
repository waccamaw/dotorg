# Micro.blog Automated Deployment

This directory contains scripts and configuration for automated deployment of Micro.blog sites via GitHub Actions.

## Overview

Micro.blog doesn't provide traditional API tokens or CI/CD integration for template deployment. This solution works around that limitation by:

1. **Email-based Authentication**: Uses Micro.blog's "Sign in with email" feature to obtain a session cookie
2. **Session Cookie Caching**: Stores the session cookie (7-day expiry) to avoid re-authentication on every deployment
3. **Theme Reload**: POSTs to `/account/themes/reload` to sync theme files from GitHub
4. **Build Automation**: Visits `/account/logs` to trigger site rebuild
5. **Build Monitoring**: Polls `/posts/check` to monitor build completion
6. **Backup Automation**: POSTs to `/account/export/{site_id}/theme` to trigger weekly backups

For complete documentation, see the main [DEPLOYMENT.md](../../DEPLOYMENT.md) file.

## Quick Start

### Local Testing

```bash
# 1. Install dependencies
cd .github/deploy
pip3 install -r requirements.txt

# 2. Set environment variables (see ../../.env.example)
export GMAIL_EMAIL="your@gmail.com"
export GMAIL_APP_PASSWORD="your-app-password"
export MICROBLOG_EMAIL="your@microblog-email.com"
export MICROBLOG_SITE_ID="12345"
export MICROBLOG_THEME_ID="67890"

# 3. Authenticate (saves .session-cookie)
python3 microblog_auth.py

# 4. Deploy
python3 microblog_deploy.py --all
```

### GitHub Actions

The workflow at `.github/workflows/deploy.yml` runs automatically on pushes to `main` that modify:
- `layouts/**`
- `static/**`
- `config.json`

Required GitHub secrets and variables:
- **Secret**: `GMAIL_APP_PASSWORD`
- **Variables**: `GMAIL_EMAIL`, `MICROBLOG_EMAIL`, `MICROBLOG_SITE_ID`, `MICROBLOG_THEME_ID`

## Files

- `microblog_auth.py` - Email authentication and session cookie capture
- `microblog_deploy.py` - Template reload, rebuild trigger, and build monitoring
- `microblog_backup.py` - Automated theme export and backup to GitHub releases
- `requirements.txt` - Python dependencies
- `README.md` - This file

## Support

For issues, see the troubleshooting section in [DEPLOYMENT.md](../../DEPLOYMENT.md).
