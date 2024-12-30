document.addEventListener('DOMContentLoaded', () => {
  const generatePdfButton = document.getElementById('generate-pdf');
  const selectElementButton = document.getElementById('select-element');
  const statusText = document.getElementById('status-text');
  const messageDiv = document.getElementById('message');

  // Helper function to show messages
  const showMessage = (text, type = 'info') => {
    console.log(`[PDF Generator] ${text}`);
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    setTimeout(() => {
      messageDiv.textContent = '';
      messageDiv.className = 'message';
    }, 3000);
  };

  // Get the current active tab
  const getCurrentTab = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) throw new Error('No active tab found');
      return tab;
    } catch (error) {
      console.error('Error accessing tab:', error);
      showMessage('Error accessing current tab: ' + error.message, 'error');
      throw error;
    }
  };

  // Check if current site is supported
  const checkSiteSupport = (url) => {
    const supportedDomains = ['chatgpt.com', 'chat.openai.com', 'claude.ai', 'perplexity.ai'];
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, '');
      return supportedDomains.some(domain => hostname.includes(domain));
    } catch {
      return false;
    }
  };

  // Update UI based on current tab
  const updateUI = async () => {
    try {
      const tab = await getCurrentTab();
      const isSupported = checkSiteSupport(tab.url);

      selectElementButton.disabled = !isSupported;
      generatePdfButton.disabled = true;

      if (isSupported) {
        statusText.textContent = 'Ready to select content';
        showMessage('Site supported! Click "Select Element" to start', 'success');
      } else {
        statusText.textContent = 'Current site not supported';
        showMessage('Please navigate to a supported AI platform', 'error');
      }
    } catch (error) {
      console.error('UI update error:', error);
      showMessage(error.message, 'error');
    }
  };

  // Handle element selection
  selectElementButton.addEventListener('click', async () => {
    try {
      const tab = await getCurrentTab();
      console.log('Selecting element on:', tab.url);

      const response = await chrome.tabs.sendMessage(tab.id, { 
        action: 'selectElement'
      });

      if (response.success) {
        statusText.textContent = `Element selected on ${response.hostname}`;
        showMessage('Element selected successfully', 'success');
        generatePdfButton.disabled = false;
      } else {
        throw new Error(response.error || 'Failed to select element');
      }
    } catch (error) {
      console.error('Selection error:', error);
      showMessage(error.message, 'error');
      generatePdfButton.disabled = true;
    }
  });

  // Handle PDF generation
  generatePdfButton.addEventListener('click', async () => {
    try {
      statusText.textContent = 'Generating PDF...';
      generatePdfButton.disabled = true;
      selectElementButton.disabled = true;

      const tab = await getCurrentTab();

      // Prepare page for printing
      const prepareResponse = await chrome.tabs.sendMessage(tab.id, { 
        action: 'preparePrint'
      });

      if (!prepareResponse.success) {
        throw new Error(prepareResponse.error || 'Failed to prepare for printing');
      }

      // Generate timestamp for filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `webpage-content-${timestamp}.pdf`;

      // Trigger the print dialog
      await chrome.tabs.sendMessage(tab.id, { 
        action: 'print',
        filename: filename
      });

      // Cleanup after printing
      await chrome.tabs.sendMessage(tab.id, { action: 'cleanup' });

      showMessage('PDF generated successfully', 'success');
      statusText.textContent = 'PDF generated! Ready for next selection.';
    } catch (error) {
      console.error('PDF generation error:', error);
      showMessage('Error generating PDF: ' + error.message, 'error');
      statusText.textContent = 'Error occurred. Please try again.';
    } finally {
      generatePdfButton.disabled = false;
      selectElementButton.disabled = false;
    }
  });

  // Initialize UI
  updateUI();
  console.log('[PDF Generator] Popup initialized');
});