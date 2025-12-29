/**
 * LOG DISCORD LEAD - Johnnym (886 Studios)
 */

import commandCenter from './command-center.js';

// Log the warm lead
commandCenter.addLead({
    name: 'Johnnym (886 Studios, Taiwan)',
    source: 'discord_dm',
    message: 'Saw ggloop.io, similar product, mentioned collaboration',
    priority: 'high',
    type: 'potential_partner',
    notes: 'Could be competitor OR partner. Taiwan market. Waiting for more details on their product.',
    timestamp: new Date().toISOString()
});

console.log('✅ Lead logged to command center');
