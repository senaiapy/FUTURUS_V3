# 🔐 Git Configuration — futurus.net.br Repository

## Problem

Your machine's **global** Git user is `senaiapy` / `senaia.py@gmail.com`, but this repository belongs to the **`futurusus`** GitHub account. When you push, macOS Keychain sends your `senaiapy` credentials, and GitHub returns **"repository not found"** because `senaiapy` doesn't have access to `futurusus/futurus.net.br`.

## Solution Applied (Per-Repository Config)

We set **local** (repo-only) Git config. Your global config stays untouched:

```bash
# These were already executed — stored in .git/config
git config --local user.name "futurusus"
git config --local user.email "futurus.us@gmail.com"
```

The remote URL includes the username to force separate credential handling:

```
origin  https://futurusus@github.com/futurusus/futurus.net.br.git
```

## How to Push (First Time)

When you run `git push`, GitHub will ask for a **password**. You must use a **Personal Access Token (PAT)**, NOT your GitHub password.

### Step 1: Create a PAT for `futurusus`

1. Log into GitHub as **futurusus**
2. Go to: **Settings → Developer settings → Personal access tokens → Tokens (classic)**
3. Click **"Generate new token (classic)"**
4. Set name: `futurus-repo`
5. Select scopes: `repo` (full control)
6. Click **Generate token**
7. **Copy the token** (starts with `ghp_...`)

### Step 2: Push with the Token

```bash
cd /Users/galo/Desktop/futurus.net.br
git push origin main
```

When prompted:

- **Username**: `futurusus`
- **Password**: paste the PAT (`ghp_...`)

macOS Keychain will save this for `futurusus@github.com` separately from your `senaiapy` credentials.

### Step 3: Verify

```bash
git config --local user.name   # → futurusus
git config --local user.email  # → futurus.us@gmail.com
git config --global user.name  # → senaiapy (unchanged)
```

## Quick Reference — Commit & Push Commands

```bash
# Stage all changes
git add -A

# Commit (will use local futurusus config)
git commit -m "your message"

# Push (first time will ask for PAT)
git push origin main
```

## If You Need to Change the Token Later

```bash
# Remove the saved credential from Keychain
git credential-osxkeychain erase <<EOF
protocol=https
host=github.com
username=futurusus
EOF

# Next push will ask again
git push origin main
```

## Verify Configuration

```bash
git config --local --list | grep user
# user.name=futurusus
# user.email=futurus.us@gmail.com

git remote -v
# origin  https://futurusus@github.com/futurusus/futurus.net.br.git
```
