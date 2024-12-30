// Selectors for supported websites
const CONTENT_SELECTORS = {
  // ChatGPT - Main conversation content
  'chatgpt.com': 'body > div.relative.flex.h-full.w-full.overflow-hidden.transition-colors.z-0 > div.relative.flex.h-full.max-w-full.flex-1.flex-col.overflow-hidden > main',

  // Claude - Main chat content
  'claude.ai': 'body > div.flex.min-h-screen.w-full > div > div > div.relative.flex.w-full.flex-1.overflow-x-hidden.overflow-y-scroll.pt-6.md\\:pr-8 > div.relative.mx-auto.flex.h-full.w-full.max-w-3xl.flex-1.flex-col.md\\:px-2 > div.flex-1.flex.flex-col.gap-3.px-4.max-w-3xl.mx-auto.w-full.pt-1',

  // Perplexity - Main answer content
  'perplexity.ai': 'main > div > div > div.isolate.flex.h-auto.w-full.min-w-0.grow.flex-col.md\\:gap-xs.lg\\:pb-sm.lg\\:pr-sm.lg\\:pt-sm > div.flex-1.overflow-clip.bg-clip-border.shadow-sm.lg\\:rounded-lg.md\\:dark\\:border.border-borderMain\\/50.ring-borderMain\\/50.divide-borderMain\\/50.dark\\:divide-borderMainDark\\/50.dark\\:ring-borderMainDark\\/50.dark\\:border-borderMainDark\\/50.bg-background.dark\\:bg-backgroundDark > div > div.mx-auto.h-full.w-full.max-w-threadWidth.px-md.md\\:px-lg > div > div.relative.border-borderMain\\/50.ring-borderMain\\/50.divide-borderMain\\/50.dark\\:divide-borderMainDark\\/50.dark\\:ring-borderMainDark\\/50.dark\\:border-borderMainDark\\/50.bg-background.dark\\:bg-backgroundDark > div > div.pb-lg.border-borderMain\\/50.ring-borderMain\\/50.divide-borderMain\\/50.dark\\:divide-borderMainDark\\/50.dark\\:ring-borderMainDark\\/50.dark\\:border-borderMainDark\\/50.bg-transparent > div > div.col-span-8'
};

/**
 * Get the content selector for a given hostname
 * @param {string} hostname - The hostname of the website
 * @returns {string|null} The selector string or null if site is not supported
 */
function getSelector(hostname) {
  // Handle www. prefix
  const cleanHostname = hostname.replace(/^www\./, '');
  return CONTENT_SELECTORS[cleanHostname] || null;
}

// Export for use in other files
module.exports = {
  getSelector,
  CONTENT_SELECTORS
};