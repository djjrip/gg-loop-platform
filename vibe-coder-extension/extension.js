const vscode = require('vscode');

let statusBarItem;
let sessionStartTime;
let totalCodingTime = 0;

function activate(context) {
    console.log('Vibe Coder extension is now active!');

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(zap) Vibe Coder: 0 XP";
    statusBarItem.tooltip = "Tracking your coding XP";
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Start tracking when document is edited
    vscode.workspace.onDidChangeTextDocument(() => {
        if (!sessionStartTime) {
            sessionStartTime = Date.now();
            console.log('Vibe Coding session started!');
        }
        updateXP();
    });

    // Track session time every minute
    setInterval(() => {
        if (sessionStartTime) {
            updateXP();
        }
    }, 60000); // Every 1 minute

    // Register command to check status
    let checkStatus = vscode.commands.registerCommand('vibecoder.helloWorld', function () {
        const minutes = Math.floor(totalCodingTime / 60000);
        const xp = minutes * 10; // 10 XP per minute (2x multiplier built in)
        vscode.window.showInformationMessage(`Vibe Coder: ${xp} XP earned | ${minutes} min coded`);
    });

    context.subscriptions.push(checkStatus);
}

function updateXP() {
    if (sessionStartTime) {
        totalCodingTime = Date.now() - sessionStartTime;
        const minutes = Math.floor(totalCodingTime / 60000);
        const xp = minutes * 10; // 10 XP per minute (2x multiplier)
        statusBarItem.text = `$(zap) Vibe Coder: ${xp} XP`;

        // TODO: Send XP to GG LOOP API endpoint
        // await fetch('https://ggloop.io/api/track-coding-session', {
        //     method: 'POST',
        //     body: JSON.stringify({ minutes, xp })
        // });
    }
}

function deactivate() {
    if (sessionStartTime) {
        const minutes = Math.floor(totalCodingTime / 60000);
        const xp = minutes * 10;
        console.log(`Vibe Coding session ended. Total: ${xp} XP (${minutes} min)`);
    }
}

module.exports = {
    activate,
    deactivate
};
