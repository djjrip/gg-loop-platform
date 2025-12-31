# AWS CREDENTIALS SETUP - QUICK GUIDE

**Issue:** AWS credentials not set  
**Fix Time:** 2 minutes  

---

## OPTION 1: SET ENVIRONMENT VARIABLES (RECOMMENDED)

1. **Find your AWS credentials:**
   - Check Railway environment variables
   - Or AWS Console → Security Credentials → Access Keys

2. **Open PowerShell as Administrator:**
   - Right-click Start menu
   - Click "Windows PowerShell (Admin)"

3. **Run these commands** (replace with your actual keys):
   ```powershell
   [System.Environment]::SetEnvironmentVariable('AWS_ACCESS_KEY_ID', 'AKIA...YOUR_KEY', 'User')
   [System.Environment]::SetEnvironmentVariable('AWS_SECRET_ACCESS_KEY', 'YOUR_SECRET_KEY', 'User')
   [System.Environment]::SetEnvironmentVariable('AWS_REGION', 'us-east-1', 'User')
   ```

4. **Close and reopen PowerShell** (must restart for env vars to load)

5. **Verify:**
   ```powershell
   $env:AWS_ACCESS_KEY_ID
   # Should show your key
   ```

---

## OPTION 2: CREATE AWS CREDENTIALS FILE

1. **Create directory:**
   ```powershell
   New-Item -ItemType Directory -Path "$env:USERPROFILE\.aws" -Force
   ```

2. **Create credentials file:**
   ```powershell
   @"
[default]
aws_access_key_id = YOUR_KEY_HERE
aws_secret_access_key = YOUR_SECRET_HERE
region = us-east-1
"@ | Out-File -FilePath "$env:USERPROFILE\.aws\credentials" -Encoding ASCII
   ```

3. **Edit with your actual credentials:**
   ```powershell
   notepad "$env:USERPROFILE\.aws\credentials"
   ```

---

## AFTER SETTING CREDENTIALS

Run check again:
```powershell
npm run check:aws
```

Should see:
```
OK: AWS_ACCESS_KEY_ID set
OK: AWS_SECRET_ACCESS_KEY set
PRE-FLIGHT CHECK PASSED
```

Then proceed to deployment:
```powershell
npm run deploy:aws
```

---

**Your AWS credentials are in Railway environment variables. Check there first.**
