# DO NOT TOUCH - PROTECTED FILES AND OPERATIONS

**Last Updated:** 2025-12-31  
**Purpose:** Prevent accidental breakage during cleanup and maintenance

---

## PROTECTED DIRECTORIES - NEVER MODIFY WITHOUT EXPLICIT APPROVAL

### Core Application Code
```
client/                   - Frontend React application
server/                   - Backend Express API
shared/                   - Shared TypeScript schemas
```

**Why Protected:** These directories contain all runtime logic. Any changes could break the production application.

### Build Configuration
```
package.json              - Dependencies and build scripts
tsconfig.json             - TypeScript compiler configuration
vite.config.ts            - Frontend build configuration
amplify.yml               - AWS Amplify deployment configuration
```

**Why Protected:** Changes to these files affect the build process and deployment.

### Generated Directories
```
dist/                     - Compiled output (regenerated on build)
node_modules/             - Dependencies (regenerated on install)
.git/                     - Git version control
```

**Why Protected:** These are generated automatically. Manual changes will be overwritten.

---

## PROTECTED FILES - NEVER MODIFY

### Environment Configuration
```
.env                      - Local environment variables (NOT in git)
.env.example              - Environment variable template
.gitignore                - Git ignore rules
```

**Why Protected:** Contains secrets and critical configuration.

### Deployment Configuration
```
railway.toml              - Railway deployment (temporary)
.github/workflows/        - GitHub Actions CI/CD
```

**Why Protected:** Controls deployment behavior.

---

## PROTECTED OPERATIONS - NEVER DO WITHOUT APPROVAL

### Code Changes
- ❌ Delete files in `client/`, `server/`, or `shared/`
- ❌ Modify `package.json` dependencies
- ❌ Change build commands or start commands
- ❌ Alter TypeScript configuration
- ❌ Modify database schemas
- ❌ Change authentication logic
- ❌ Modify payment integration
- ❌ Hardcode any secrets or credentials

### Architecture Changes
- ❌ Split the monolith into microservices
- ❌ Create new backend services
- ❌ Change deployment targets
- ❌ Merge code from other repositories
- ❌ Introduce new frameworks or libraries

### Infrastructure Changes
- ❌ Change hosting providers
- ❌ Modify DNS configuration
- ❌ Change database providers
- ❌ Alter CDN configuration

---

## SAFE OPERATIONS - ALLOWED WITHOUT APPROVAL

### Documentation
- ✅ Update README.md
- ✅ Add comments to code
- ✅ Create documentation files
- ✅ Organize documentation

### Organization
- ✅ Move `.md` files to `/docs`
- ✅ Move side projects to `/experiments`
- ✅ Delete log files
- ✅ Delete build artifacts
- ✅ Clean up temporary files

### Bug Fixes
- ✅ Fix bugs with tests
- ✅ Improve error handling
- ✅ Add logging
- ✅ Fix typos

---

## EMERGENCY CONTACTS

**If you need to make a protected change:**
1. Document the reason
2. Create a backup
3. Get founder approval
4. Test thoroughly
5. Deploy carefully

**If something breaks:**
1. Check git history
2. Revert to last working commit
3. Notify founder
4. Document the issue

---

**Remember:** When in doubt, DON'T TOUCH. Ask first.
