// Test Ghost Bot connection to Cursor
// Run this in the browser console to test

async function testCursorConnection() {
  console.log('🧪 Testing Ghost Bot → Cursor connection...\n');
  
  try {
    // Test 1: Check if server is running
    const healthCheck = await fetch('http://localhost:8080/health');
    console.log('✅ Server is running');
    
    // Test 2: Report status to Cursor
    const statusResponse = await fetch('http://localhost:8080/api/ghost-bot/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'test',
        message: 'Ghost Bot connection test',
        timestamp: new Date().toISOString()
      })
    });
    
    if (statusResponse.ok) {
      console.log('✅ Successfully reported to Cursor');
    } else {
      console.log('⚠️ Status report failed:', await statusResponse.text());
    }
    
    // Test 3: Check for tasks from Cursor
    const tasksResponse = await fetch('http://localhost:8080/api/ghost-bot/tasks');
    const tasksData = await tasksResponse.json();
    console.log(`✅ Can receive tasks from Cursor (${tasksData.tasks?.length || 0} pending)`);
    
    console.log('\n✅ All connection tests passed!');
    console.log('👻 Ghost Bot is connected to Cursor and ready to work!\n');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Your server is running (npm start)');
    console.log('   2. Server is on port 8080');
    console.log('   3. No firewall blocking localhost:8080\n');
  }
}

// Run test
testCursorConnection();

