// Test Railway database connection from external network
const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:kniPJAbzvQCUdTgNxWFOLAGOPQgdvEtY@nozomi.proxy.rlwy.net:56545/railway';

async function testDatabaseConnection() {
    console.log('🔍 Testing Railway database connection...\n');

    // Parse URL
    const url = new URL(DATABASE_URL);
    console.log('📋 Connection Details:');
    console.log(`   Host: ${url.hostname}`);
    console.log(`   Port: ${url.port}`);
    console.log(`   Database: ${url.pathname.slice(1)}`);
    console.log(`   User: ${url.username}`);
    console.log('');

    const client = new Client({
        connectionString: DATABASE_URL,
        connectionTimeoutMillis: 10000,
    });

    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        console.log('✅ Connection successful!\n');

        // Test query
        console.log('🧪 Running test query...');
        const result = await client.query('SELECT version(), current_database(), current_user');
        console.log('✅ Query successful!\n');

        console.log('📊 Database Info:');
        console.log(`   PostgreSQL Version: ${result.rows[0].version.split(' ')[1]}`);
        console.log(`   Database: ${result.rows[0].current_database}`);
        console.log(`   User: ${result.rows[0].current_user}`);
        console.log('');

        console.log('✅ DATABASE IS PUBLICLY ACCESSIBLE FROM AWS');
        console.log('✅ CREDENTIALS ARE VALID');
        console.log('✅ READY TO USE WITH AWS AMPLIFY');

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('');
        console.error('This means:');
        if (error.message.includes('ENOTFOUND')) {
            console.error('   - Host cannot be resolved (DNS issue)');
        } else if (error.message.includes('ECONNREFUSED')) {
            console.error('   - Connection refused (firewall or wrong port)');
        } else if (error.message.includes('timeout')) {
            console.error('   - Connection timeout (network issue)');
        } else if (error.message.includes('password')) {
            console.error('   - Invalid credentials');
        } else {
            console.error('   - ' + error.message);
        }
        process.exit(1);
    } finally {
        await client.end();
    }
}

testDatabaseConnection();
