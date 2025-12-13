import fs from 'fs';
import path from 'path';
import https from 'https';
import os from 'os';

const homeDir = os.homedir();
const configPath = path.join(homeDir, '.railway', 'config.json');

async function main() {
    try {
        // 1. Get Token
        if (!fs.existsSync(configPath)) {
            console.error('❌ No Railway config found. Login first.');
            process.exit(1);
        }
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const token = config.user.token;

        if (!token) {
            console.error('❌ No token in config.');
            process.exit(1);
        }

        console.log('✅ Found Railway Token');

        // 2. Query API for Projects
        const query = JSON.stringify({
            query: `query { me { projects { id name } } }`
        });

        const req = https.request('https://backboard.railway.app/graphql/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const response = JSON.parse(data);
                if (response.errors) {
                    console.error('❌ API Error:', response.errors);
                    return;
                }

                const projects = response.data.me.projects;
                const ggLoop = projects.find(p => p.name === 'GG LOOP');

                if (ggLoop) {
                    console.log(`\n🎯 FOUND GG LOOP!`);
                    console.log(`Name: ${ggLoop.name}`);
                    console.log(`ID: ${ggLoop.id}`);

                    // Write ID to file for next step
                    fs.writeFileSync('RAILWAY_PROJECT_ID.txt', ggLoop.id);
                } else {
                    console.error('❌ Could not find project "GG LOOP"');
                    console.log('Available projects:', projects.map(p => p.name).join(', '));
                }
            });
        });

        req.write(query);
        req.end();

    } catch (error) {
        console.error('Script failed:', error);
    }
}

main();
