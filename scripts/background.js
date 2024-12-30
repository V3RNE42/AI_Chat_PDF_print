// Service worker initialization
self.oninstall = (event) => {
  console.log('PDF Generator Extension installed');
};

self.onactivate = (event) => {
  console.log('PDF Generator Extension activated');
};

// Debug logging helper
const debugLog = (...args) => {
  console.log('[PDF Generator Background]', ...args);
};

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  debugLog('Received message:', request);

  if (request.action === 'generatePDF') {
    chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
      if (!tab) {
        sendResponse({ success: false, error: 'No active tab found' });
        return;
      }

      try {
        // Execute print command in the tab
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: () => {
            window.print();
          }
        });

        sendResponse({ success: true });
      } catch (error) {
        debugLog('Error generating PDF:', error);
        sendResponse({ success: false, error: error.message });
      }
    });
    return true; // Will respond asynchronously
  }
});

// Handle potential service worker updates
self.onupdatefound = () => {
  debugLog('Service worker update found');
};