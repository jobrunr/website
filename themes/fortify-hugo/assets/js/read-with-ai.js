/**
 * Read with AI - Share documentation with AI assistants
 */
(function() {
  'use strict';

  const SUCCESS_TIMEOUT = 2000;

  /**
   * Fetch markdown content from GitHub raw URL
   * @param {string} url - The GitHub raw URL
   * @returns {Promise<string>} The markdown content
   */
  async function fetchMarkdownContent(url) {
    if (!url) throw new Error('No GitHub raw URL available');

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch markdown: ${response.status} ${response.statusText}`);
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
   * Show success feedback on the primary button
   * @param {HTMLElement} dropdown - The dropdown container
   * @param {string} message - Success message
   */
  function showSuccessFeedback(dropdown, message) {
    const primaryButton = dropdown.querySelector('.read-with-ai-btn--primary');
    if (!primaryButton) return;

    const span = primaryButton.querySelector('span');
    const firstIcon = primaryButton.querySelector('i.fa-wand-magic-sparkles');
    const originalText = span.textContent;

    if (firstIcon) {
      firstIcon.className = 'fa-solid fa-check';
    }
    span.textContent = message;

    setTimeout(() => {
      if (firstIcon) {
        firstIcon.className = 'fa-solid fa-wand-magic-sparkles';
      }
      span.textContent = originalText;
    }, SUCCESS_TIMEOUT);
  }

  /**
   * Handle copy button click
   * @param {Event} e - Click event
   */
  async function handleCopyClick(e) {
    const button = e.currentTarget;
    const dropdown = button.closest('.read-with-ai-dropdown');

    if (dropdown) closeDropdown(dropdown);

    try {
      const markdownUrl = button.dataset.markdownUrl;
      const markdown = await fetchMarkdownContent(markdownUrl);
      const copySuccess = await copyToClipboard(markdown);
      if (copySuccess && dropdown) {
        showSuccessFeedback(dropdown, 'Copied!');
      }
    } catch (error) {
      console.error('Failed to copy markdown:', error);
    }
  }

  /**
   * Open a dropdown menu
   * @param {HTMLElement} dropdown - The dropdown container
   */
  function openDropdown(dropdown) {
    const button = dropdown.querySelector('.read-with-ai-btn--dropdown');
    const menu = dropdown.querySelector('.read-with-ai-menu');

    button.setAttribute('aria-expanded', 'true');
    menu.hidden = false;

    menu.querySelector('[role="menuitem"]')?.focus();
  }

  /**
   * Close a dropdown menu
   * @param {HTMLElement} dropdown - The dropdown container
   */
  function closeDropdown(dropdown) {
    const button = dropdown.querySelector('.read-with-ai-btn--dropdown');
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
      openDropdown(dropdown);
    }
  }

  /**
   * Open the chatbot widget dialog
   */
  function openChatbotWidget() {
    openChatbot();
    document.body.classList.add('chatbot-open');
  }

  /**
   * Handle widget open button click
   * @param {Event} e - Click event
   */
  function handleWidgetOpen(e) {
    const button = e.currentTarget;
    const dropdown = button.closest('.read-with-ai-dropdown');

    if (dropdown) closeDropdown(dropdown);
    openChatbotWidget();
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
        dropdown.querySelector('.read-with-ai-btn--dropdown').focus();
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
      const dropdownButton = dropdown.querySelector('.read-with-ai-btn--dropdown');
      const menu = dropdown.querySelector('.read-with-ai-menu');

      dropdownButton?.addEventListener('click', toggleDropdown);
      menu?.addEventListener('keydown', handleMenuKeydown);

      // Handle all action buttons
      dropdown.querySelectorAll('[data-action="copy"]').forEach(btn => {
        btn.addEventListener('click', handleCopyClick);
      });

      dropdown.querySelectorAll('[data-action="open-widget"]').forEach(btn => {
        btn.addEventListener('click', handleWidgetOpen);
      });
    });

    document.addEventListener('click', handleOutsideClick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
