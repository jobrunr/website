/**
 * Read with AI - Share documentation with AI assistants
 */
(function() {
  'use strict';

  const SUCCESS_TIMEOUT = 2000;

  /**
   * Get the GitHub raw URL for the markdown source
   * @returns {string} The GitHub raw URL
   */
  function getMarkdownURL() {
    return window.__docMarkdownURL || '';
  }

  /**
   * Fetch markdown content from GitHub raw URL
   * @returns {Promise<string>} The markdown content
   */
  async function fetchMarkdownContent() {
    const url = getMarkdownURL();
    if (!url) {
      throw new Error('No GitHub raw URL available');
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch markdown: ${response.status} ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Error fetching markdown:', error);
      throw error;
    }
  }

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} Success status
   */
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Show success feedback on the main dropdown button
   * @param {HTMLElement} dropdown - The dropdown container
   * @param {string} message - Success message
   */
  function showSuccessFeedback(dropdown, message) {
    const mainButton = dropdown.querySelector('.read-with-ai-btn');
    if (!mainButton) return;

    const span = mainButton.querySelector('span');
    const firstIcon = mainButton.querySelector('i.fa-wand-magic-sparkles');
    const originalText = span.textContent;

    // Update button to show success
    if (firstIcon) {
      firstIcon.className = 'fa-solid fa-check';
    }
    span.textContent = message;

    // Restore original state after timeout
    setTimeout(() => {
      if (firstIcon) {
        firstIcon.className = 'fa-solid fa-wand-magic-sparkles';
      }
      span.textContent = originalText;
    }, SUCCESS_TIMEOUT);
  }

  /**
   * Handle menu item click
   * @param {Event} e - Click event
   */
  async function handleMenuItemClick(e) {
    const button = e.currentTarget;
    const action = button.dataset.action;
    const dropdown = button.closest('.read-with-ai-dropdown');

    // Close the dropdown immediately
    if (dropdown) {
      closeDropdown(dropdown);
    }

    if (action === 'copy') {
      try {
        const markdown = await fetchMarkdownContent();
        const copySuccess = await copyToClipboard(markdown);
        if (copySuccess && dropdown) {
          showSuccessFeedback(dropdown, 'Copied!');
        }
      } catch (error) {
        console.error('Failed to copy markdown:', error);
      }
    }
  }

  /**
   * Open a dropdown menu
   * @param {HTMLElement} dropdown - The dropdown container
   */
  function openDropdown(dropdown) {
    const button = dropdown.querySelector('.read-with-ai-btn');
    const menu = dropdown.querySelector('.read-with-ai-menu');

    button.setAttribute('aria-expanded', 'true');
    menu.hidden = false;

    // Focus first menu item
    const firstItem = menu.querySelector('[role="menuitem"]');
    if (firstItem) {
      firstItem.focus();
    }
  }

  /**
   * Close a dropdown menu
   * @param {HTMLElement} dropdown - The dropdown container
   */
  function closeDropdown(dropdown) {
    const button = dropdown.querySelector('.read-with-ai-btn');
    const menu = dropdown.querySelector('.read-with-ai-menu');

    button.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  }

  /**
   * Toggle dropdown open/closed
   * @param {Event} e - Click event
   */
  function toggleDropdown(e) {
    const button = e.currentTarget;
    const dropdown = button.closest('.read-with-ai-dropdown');
    const isOpen = button.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      closeDropdown(dropdown);
    } else {
      // Close any other open dropdowns first
      document.querySelectorAll('.read-with-ai-dropdown').forEach(other => {
        if (other !== dropdown) {
          closeDropdown(other);
        }
      });
      openDropdown(dropdown);
    }
  }

  /**
   * Handle keyboard navigation in dropdown
   * @param {KeyboardEvent} e - Keyboard event
   */
  function handleMenuKeydown(e) {
    const menu = e.currentTarget;
    const items = Array.from(menu.querySelectorAll('[role="menuitem"]:not([disabled])'));
    const currentIndex = items.indexOf(document.activeElement);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[nextIndex].focus();
        break;

      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items[prevIndex].focus();
        break;

      case 'Home':
        e.preventDefault();
        items[0].focus();
        break;

      case 'End':
        e.preventDefault();
        items[items.length - 1].focus();
        break;

      case 'Escape':
        e.preventDefault();
        const dropdown = menu.closest('.read-with-ai-dropdown');
        closeDropdown(dropdown);
        dropdown.querySelector('.read-with-ai-btn').focus();
        break;

      case 'Tab':
        e.preventDefault();
        const dropdownForTab = menu.closest('.read-with-ai-dropdown');
        closeDropdown(dropdownForTab);
        break;
    }
  }

  /**
   * Close dropdowns when clicking outside
   * @param {Event} e - Click event
   */
  function handleOutsideClick(e) {
    if (!e.target.closest('.read-with-ai-dropdown')) {
      document.querySelectorAll('.read-with-ai-dropdown').forEach(closeDropdown);
    }
  }

  /**
   * Initialize all read-with-ai dropdowns
   */
  function init() {
    const dropdowns = document.querySelectorAll('.read-with-ai-dropdown');

    dropdowns.forEach(dropdown => {
      const button = dropdown.querySelector('.read-with-ai-btn');
      const menu = dropdown.querySelector('.read-with-ai-menu');
      const menuItems = dropdown.querySelectorAll('.read-with-ai-menu__item');

      // Toggle dropdown on button click
      button.addEventListener('click', toggleDropdown);

      // Handle menu item clicks (only for buttons, not links)
      menuItems.forEach(item => {
        if (item.tagName === 'BUTTON') {
          item.addEventListener('click', handleMenuItemClick);
        }
      });

      // Keyboard navigation
      menu.addEventListener('keydown', handleMenuKeydown);
    });

    // Close on outside click
    document.addEventListener('click', handleOutsideClick);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
