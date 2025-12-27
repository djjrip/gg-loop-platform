// Ghost Bot Extension - Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('👻 Ghost Bot extension installed!');
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Tab finished loading
    console.log('Tab loaded:', tab.url);
  }
});

