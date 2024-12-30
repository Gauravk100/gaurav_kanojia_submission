chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openPopup') {
    chrome.action.openPopup() // Opens the popup programmatically
  }

  if (message.action === 'maangThemeChange') {
    console.log(message);
    chrome.runtime.sendMessage({ message: "Message received by background script" });
    
  }
})
