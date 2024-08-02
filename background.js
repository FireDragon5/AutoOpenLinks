chrome.runtime.onStartup.addListener(function() {
  chrome.storage.local.get('bookmarks', function(data) {
    const bookmarksToOpen = data.bookmarks || [];
    chrome.tabs.query({}, function(tabs) {
      const openUrls = tabs.map(tab => tab.url);
      bookmarksToOpen.forEach(bookmark => {
        if (!openUrls.includes(bookmark.url)) {
          chrome.tabs.create({ url: bookmark.url });
        }
      });
    });
  });
});