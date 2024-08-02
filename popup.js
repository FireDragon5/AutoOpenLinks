document.addEventListener('DOMContentLoaded', function () {
  const bookmarkNameInput = document.getElementById('bookmarkNameInput');
  const bookmarkUrlInput = document.getElementById('bookmarkUrlInput');
  const addBookmarkButton = document.getElementById('addBookmark');
  const bookmarkList = document.getElementById('bookmarkList');
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  const settingsIcon = document.getElementById('settingsIcon');
  const settingsContainer = document.getElementById('settingsContainer');
  const closeSettings = document.getElementById('closeSettings');

  let isEditing = false;
  let editingIndex = null;

  function loadBookmarks() {
    chrome.storage.local.get('bookmarks', function (data) {
      const bookmarks = data.bookmarks || [];
      bookmarkList.innerHTML = '';
      bookmarks.forEach((bookmark, index) => {
        const li = document.createElement('li');
        li.draggable = true;
        li.dataset.index = index;
  
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragover', handleDragOver);
        li.addEventListener('drop', handleDrop);
  
        const nameSpan = document.createElement('span');
        nameSpan.className = 'bookmark-name';
        nameSpan.textContent = bookmark.name;
  
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = 'ℹ️';
  
        const tooltipText = document.createElement('span');
        tooltipText.className = 'tooltiptext';
        tooltipText.textContent = bookmark.url;
  
        tooltip.appendChild(tooltipText);
        li.appendChild(nameSpan);
        li.appendChild(tooltip);
  
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'button-group';
  
        const editButton = document.createElement('button');
        editButton.className = 'edit';
        editButton.textContent = '✏️';
        editButton.onclick = function () {
          bookmarkNameInput.value = bookmark.name;
          bookmarkUrlInput.value = bookmark.url;
          isEditing = true;
          editingIndex = index;
          addBookmarkButton.textContent = 'Update Bookmark';
        };
        buttonGroup.appendChild(editButton);
  
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '❌';
        deleteButton.onclick = function () {
          bookmarks.splice(index, 1);
          chrome.storage.local.set({ bookmarks }, loadBookmarks);
        };
        buttonGroup.appendChild(deleteButton);
  
        li.appendChild(buttonGroup);
        bookmarkList.appendChild(li);
      });
    });
  }
  
  function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
  }
  
  function handleDragOver(e) {
    e.preventDefault();
  }
  
  function handleDrop(e) {
    e.preventDefault();
    const draggedIndex = e.dataTransfer.getData('text/plain');
    const targetIndex = e.target.closest('li').dataset.index;
  
    chrome.storage.local.get('bookmarks', function (data) {
      const bookmarks = data.bookmarks || [];
      const [draggedBookmark] = bookmarks.splice(draggedIndex, 1);
      bookmarks.splice(targetIndex, 0, draggedBookmark);
      chrome.storage.local.set({ bookmarks }, loadBookmarks);
    });
  }
  
  addBookmarkButton.onclick = function () {
    const name = bookmarkNameInput.value.trim();
    const url = bookmarkUrlInput.value.trim();
    if (name && url) {
      chrome.storage.local.get('bookmarks', function (data) {
        const bookmarks = data.bookmarks || [];
        if (isEditing) {
          bookmarks[editingIndex] = { name, url };
          isEditing = false;
          editingIndex = null;
          addBookmarkButton.textContent = 'Add Bookmark';
        } else {
          if (!bookmarks.some(bookmark => bookmark.url === url)) {
            bookmarks.push({ name, url });
          }
        }
        chrome.storage.local.set({ bookmarks }, loadBookmarks);
        bookmarkNameInput.value = '';
        bookmarkUrlInput.value = '';
      });
    }
  };
  
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    body.classList.add(savedTheme);
    themeToggle.checked = savedTheme === 'dark-mode';
  }

  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark-mode');
    } else {
      body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light-mode');
    }
  });

  settingsIcon.addEventListener('click', () => {
    settingsContainer.style.display = 'flex';
  });

  closeSettings.addEventListener('click', () => {
    settingsContainer.style.display = 'none';
  });

  loadBookmarks();
});