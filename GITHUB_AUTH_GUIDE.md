# 🔐 GitHub Authentication Guide

## The Issue
You're getting a 403 permission error because Git needs authentication to push to GitHub.

## ✅ Recommended Solution: Personal Access Token

### Step 1: Create a Personal Access Token
1. Go to: https://github.com/settings/tokens/new
2. Fill in:
   - **Note**: `BHCG Leads Upload`
   - **Expiration**: 90 days (or custom)
   - **Scopes**: Check ✅ `repo` (full control of private repositories)
3. Click **Generate token**
4. **COPY THE TOKEN** - you'll only see it once!

### Step 2: Update Remote and Push
Run these commands (replace YOUR_TOKEN with the token you copied):

```bash
cd /Users/rithvik/Documents/BHCG/download

# Update remote URL with token
git remote set-url origin https://YOUR_TOKEN@github.com/rithvikv05-bits/bhcg_leads.git

# Push to GitHub
git push -u origin main
```

### Step 3: Remove Token After Push (Security Best Practice)
After successful push:

```bash
# Switch back to HTTPS URL without token
git remote set-url origin https://github.com/rithvikv05-bits/bhcg_leads.git
```

---

## Alternative: SSH Setup (More Secure Long-term)

### Generate SSH Key
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter to accept default location
# Press Enter for no passphrase (or set one)
```

### Add SSH Key to GitHub
```bash
# Copy your public key
cat ~/.ssh/id_ed25519.pub
```

1. Copy the output
2. Go to: https://github.com/settings/keys
3. Click "New SSH key"
4. Paste your key
5. Click "Add SSH key"

### Update Remote to SSH
```bash
cd /Users/rithvik/Documents/BHCG/download
git remote set-url origin git@github.com:rithvikv05-bits/bhcg_leads.git
git push -u origin main
```

---

## Quick Test After Setup

```bash
git push -u origin main
```

You should see:
```
Enumerating objects: ...
Writing objects: 100% ...
To https://github.com/rithvikv05-bits/bhcg_leads.git
 * [new branch]      main -> main
```

## Your Repository
📦 https://github.com/rithvikv05-bits/bhcg_leads

After successful push, your code will be live on GitHub! 🎉
