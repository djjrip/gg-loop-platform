/**
 * NEXUS Report Mirroring Automation
 * 
 * PURPOSE: Automatically mirrors all files from /REPORTS/CANONICAL/ 
 * to the founder's local visibility folder.
 * 
 * This eliminates manual mirroring and ensures founder always has access.
 */

const fs = require('fs');
const path = require('path');

const CANONICAL_DIR = path.resolve(__dirname, '../REPORTS/CANONICAL');
const LOCAL_MIRROR_DIR = 'C:\\Users\\Jayson Quindao\\Desktop\\GG LOOP\\Detailed CHATGPT reports';

/**
 * Mirror all canonical reports to local visibility folder
 */
function mirrorCanonicalReports() {
    console.log('[Mirror] Starting report mirroring...');

    // Ensure mirror directory exists
    if (!fs.existsSync(LOCAL_MIRROR_DIR)) {
        fs.mkdirSync(LOCAL_MIRROR_DIR, { recursive: true });
        console.log('[Mirror] Created local mirror directory');
    }

    // Get all files in canonical directory
    if (!fs.existsSync(CANONICAL_DIR)) {
        console.log('[Mirror] Canonical directory does not exist');
        return { success: false, error: 'Canonical directory missing' };
    }

    const files = fs.readdirSync(CANONICAL_DIR);
    let mirrored = 0;
    let errors = [];

    for (const file of files) {
        if (!file.endsWith('.md') && !file.endsWith('.json')) continue;

        const srcPath = path.join(CANONICAL_DIR, file);
        const destPath = path.join(LOCAL_MIRROR_DIR, file);

        try {
            const stat = fs.statSync(srcPath);
            if (!stat.isFile()) continue;

            // Check if file needs updating (compare mtime)
            let shouldCopy = true;
            if (fs.existsSync(destPath)) {
                const destStat = fs.statSync(destPath);
                if (stat.mtime <= destStat.mtime) {
                    shouldCopy = false;
                }
            }

            if (shouldCopy) {
                fs.copyFileSync(srcPath, destPath);
                console.log(`[Mirror] ✅ ${file}`);
                mirrored++;
            }
        } catch (err) {
            console.error(`[Mirror] ❌ ${file}: ${err.message}`);
            errors.push({ file, error: err.message });
        }
    }

    console.log(`[Mirror] Complete: ${mirrored} files mirrored, ${errors.length} errors`);

    return {
        success: errors.length === 0,
        mirrored,
        errors,
        timestamp: new Date().toISOString()
    };
}

/**
 * Mirror specific files to local visibility folder
 */
function mirrorFiles(filePaths) {
    const results = [];

    for (const filePath of filePaths) {
        const fileName = path.basename(filePath);
        const destPath = path.join(LOCAL_MIRROR_DIR, fileName);

        try {
            if (fs.existsSync(filePath)) {
                // Ensure directory exists
                if (!fs.existsSync(LOCAL_MIRROR_DIR)) {
                    fs.mkdirSync(LOCAL_MIRROR_DIR, { recursive: true });
                }

                fs.copyFileSync(filePath, destPath);
                results.push({ file: fileName, success: true });
                console.log(`[Mirror] ✅ ${fileName}`);
            } else {
                results.push({ file: fileName, success: false, error: 'Source not found' });
            }
        } catch (err) {
            results.push({ file: fileName, success: false, error: err.message });
        }
    }

    return results;
}

// Export for use in other modules
module.exports = {
    mirrorCanonicalReports,
    mirrorFiles,
    CANONICAL_DIR,
    LOCAL_MIRROR_DIR
};

// Run if called directly
if (require.main === module) {
    const result = mirrorCanonicalReports();
    process.exit(result.success ? 0 : 1);
}
