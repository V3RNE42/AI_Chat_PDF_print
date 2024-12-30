const debugLog = (...args) => {
  console.log('[PDF Generator Content]', ...args);
};
// Initialize content script
debugLog('Content script initialized');

// Store original styles and display values
let originalStyles = new Map();
let selectedElement = null;

function hideElement(element) {
  if (element && element.style) {
    originalStyles.set(element, element.style.display);
    element.style.display = 'none';
  }
}

function restoreElement(element) {
  if (element && element.style && originalStyles.has(element)) {
    element.style.display = originalStyles.get(element);
    originalStyles.delete(element);
  }
}

function getElementByHostname() {
  const hostname = window.location.hostname;
  const selectors = {
    'chatgpt.com': 'body > div.relative.flex.h-full.w-full.overflow-hidden.transition-colors.z-0 > div.relative.flex.h-full.max-w-full.flex-1.flex-col.overflow-hidden > main',
    'chat.openai.com': 'body > div.relative.flex.h-full.w-full.overflow-hidden.transition-colors.z-0 > div.relative.flex.h-full.max-w-full.flex-1.flex-col.overflow-hidden > main',
    'claude.ai': 'body > div.flex.min-h-screen.w-full > div > div > div.relative.flex.w-full.flex-1.overflow-x-hidden.overflow-y-scroll.pt-6.md\\:pr-8 > div.relative.mx-auto.flex.h-full.w-full.max-w-3xl.flex-1.flex-col.md\\:px-2 > div.flex-1.flex.flex-col.gap-3.px-4.max-w-3xl.mx-auto.w-full.pt-1',
    'perplexity.ai': 'main > div > div > div.isolate.flex.h-auto.w-full.min-w-0.grow.flex-col.md\\:gap-xs.lg\\:pb-sm.lg\\:pr-sm.lg\\:pt-sm > div.flex-1.overflow-clip.bg-clip-border.shadow-sm.lg\\:rounded-lg.md\\:dark\\:border.border-borderMain\\/50.ring-borderMain\\/50.divide-borderMain\\/50.dark\\:divide-borderMainDark\\/50.dark\\:ring-borderMainDark\\/50.dark\\:border-borderMainDark\\/50.bg-background.dark\\:bg-backgroundDark > div > div.mx-auto.h-full.w-full.max-w-threadWidth.px-md.md\\:px-lg > div > div.relative.border-borderMain\\/50.ring-borderMain\\/50.divide-borderMain\\/50.dark\\:divide-borderMainDark\\/50.dark\\:ring-borderMainDark\\/50.dark\\:border-borderMainDark\\/50.bg-background.dark\\:bg-backgroundDark > div > div.pb-lg.border-borderMain\\/50.ring-borderMain\\/50.divide-borderMain\\/50.dark\\:divide-borderMainDark\\/50.dark\\:ring-borderMainDark\\/50.dark\\:border-borderMainDark\\/50.bg-transparent > div > div.col-span-8'
  };

  const cleanHostname = hostname.replace(/^www\./, '');
  return {
    selector: selectors[cleanHostname] || null,
    hostname: cleanHostname
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  debugLog('Received message:', request);

  try {
    switch (request.action) {
      case 'selectElement':
        const { selector, hostname } = getElementByHostname();
        if (!selector) {
          throw new Error(`Unsupported website: ${hostname}`);
        }

        selectedElement = document.querySelector(selector);
        if (!selectedElement) {
          throw new Error(`Content not found. The page might be still loading or the structure has changed.`);
        }

        selectedElement.classList.add('pdf-highlight');

        sendResponse({ 
          success: true,
          selector: selector,
          hostname: hostname
        });
        break;

      case 'preparePrint':
        if (!selectedElement) {
          throw new Error('No element selected for printing');
        }
        document.querySelectorAll('.no-print').forEach(hideElement);
        selectedElement.classList.remove('pdf-highlight');
        sendResponse({ success: true });
        break;

      case 'print':
        if (!selectedElement) {
          throw new Error('No element selected for printing');
        }

        if (!selectedElement.id) {
          selectedElement.id = 'pdf-content-' + Date.now();
        }

        printJS({
          printable: selectedElement.id,
          type: 'html',
          scanStyles: true,
          targetStyles: ['*'],
          onLoadingEnd: () => {
            if (selectedElement.id.startsWith('pdf-content-')) {
              selectedElement.removeAttribute('id');
            }
          }
        });

        sendResponse({ success: true });
        break;

      case 'cleanup':
        document.querySelectorAll('.no-print').forEach(restoreElement);
        if (selectedElement) {
          selectedElement.classList.remove('pdf-highlight');
          selectedElement = null;
        }
        sendResponse({ success: true });
        break;

      default:
        throw new Error(`Unknown action: ${request.action}`);
    }
  } catch (error) {
    debugLog('Error:', error);
    sendResponse({ success: false, error: error.message });
  }

  return true;
});

// // Handle element selection and PDF preparation
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   debugLog('Received message:', request);

//   try {
//     switch (request.action) {
//       case 'selectElement':
//         const { selector, hostname } = getElementByHostname();
//         if (!selector) {
//           throw new Error(`Unsupported website: ${hostname}`);
//         }

//         selectedElement = document.querySelector(selector);
//         if (!selectedElement) {
//           throw new Error(`Content not found. The page might be still loading or the structure has changed.`);
//         }

//         console.log("SELECTED ELEMENT: ", selectedElement);

//         // Add visual highlight
//         selectedElement.classList.add('pdf-highlight');

//         sendResponse({ 
//           success: true,
//           selector: selector,
//           hostname: hostname
//         });
//         break;

//       case 'preparePrint':
//         if (!selectedElement) {
//           throw new Error('No element selected for printing');
//         }

//         // Hide unnecessary elements
//         document.querySelectorAll('.no-print').forEach(hideElement);

//         // Remove highlight before printing
//         selectedElement.classList.remove('pdf-highlight');

//         // Style the selected element for printing
//         const originalPadding = selectedElement.style.padding;
//         selectedElement.style.padding = '20px';

//         sendResponse({ success: true });

//         // Restore padding after print
//         setTimeout(() => {
//           selectedElement.style.padding = originalPadding;
//         }, 0);
//         break;

//       case 'print':
//         if (!selectedElement) {
//           throw new Error('No element selected for printing');
//         }

//         // Ensure element has an ID for printing
//         if (!selectedElement.id) {
//           selectedElement.id = 'pdf-content-' + Date.now();
//         }

//         // Set print-specific styles
//         const style = document.createElement('style');
//         style.textContent = `
//           @media print {
//             body * {
//               visibility: hidden;
//             }
//             #${selectedElement.id}, #${selectedElement.id} * {
//               visibility: visible;
//             }
//             #${selectedElement.id} {
//               position: absolute;
//               left: 0;
//               top: 0;
//             }
//           }
//         `;
//         document.head.appendChild(style);

//         window.print();

//         // Cleanup print styles
//         document.head.removeChild(style);
//         if (selectedElement.id.startsWith('pdf-content-')) {
//           selectedElement.removeAttribute('id');
//         }

//         sendResponse({ success: true });
//         break;

//       case 'cleanup':
//         // Restore hidden elements
//         document.querySelectorAll('.no-print').forEach(restoreElement);

//         if (selectedElement) {
//           selectedElement.classList.remove('pdf-highlight');
//           selectedElement = null;
//         }

//         sendResponse({ success: true });
//         break;

//       default:
//         throw new Error(`Unknown action: ${request.action}`);
//     }
//   } catch (error) {
//     debugLog('Error:', error);
//     sendResponse({ success: false, error: error.message });
//   }

//   return true; // Keep message channel open for async response
// });

// Add initialization logging
debugLog('Content script ready');