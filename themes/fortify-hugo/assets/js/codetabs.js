/**
 * CodeTabs - Accessible tabbed code examples with persistence
 *
 * Features:
 * - Full ARIA compliance (tablist, tab, tabpanel)
 * - Keyboard navigation (arrows, home, end)
 * - Global sync (clicking one tab activates all matching tabs)
 * - LocalStorage persistence by category
 * - Progressive enhancement (works without JS)
 */
(function() {
  'use strict';

  const STORAGE_KEY_PREFIX = 'jobrunr-codetabs-';
  
  /**
   * Storage utilities
   */
  const storage = {
    /**
     * Get saved preference for a category
     * @param {string} category - The tab category (e.g., 'tool', 'framework')
     * @returns {string|null} The saved tab type or null
     */
    get(category) {
      try {
        return localStorage.getItem(STORAGE_KEY_PREFIX + category);
      } catch (e) {
        console.warn('Failed to read codetabs preferences:', e);
        return null;
      }
    },

    /**
     * Save preference for a category
     * @param {string} category - The tab category
     * @param {string} type - The tab type to save
     */
    set(category, type) {
      try {
        if(type) { 
          localStorage.setItem(STORAGE_KEY_PREFIX + category, type);
        } else {
          localStorage.removeItem(STORAGE_KEY_PREFIX + category);
        }
      } catch (e) {
        console.warn('Failed to save codetabs preferences:', e);
      }
    }
  };

  /**
   * Get the category for a tab element
   * @param {HTMLElement} tab - A tab button element
   * @returns {string} The category name
   */
  function getCategory(tab) {
    const container = tab.closest('.codetabs');
    return container ? container.dataset.category : 'default';
  }

  /**
   * Get all tabs in the same tablist
   * @param {HTMLElement} tab - A tab button element
   * @returns {HTMLElement[]} Array of tab buttons
   */
  function getTabsInGroup(tab) {
    const tablist = tab.closest('[role="tablist"]');
    return tablist ? Array.from(tablist.querySelectorAll(':scope > [role="tab"]')) : [];
  }

  /**
   * Deactivate all tabs and panels in a specific group
   * @param {HTMLElement} container - The codetabs container
   */
  function deactivateGroup(container) {
    container.querySelectorAll(':scope > [role="tablist"] > [role="tab"]').forEach(tab => {
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('tabindex', '-1');
    });

    container.querySelectorAll(':scope > .codetabs__panels > [role="tabpanel"]').forEach(panel => {
      panel.hidden = true;
    });
  }

  /**
   * Activate all tabs and panels matching a specific type across the entire page
   * @param {string} type - The tab type to activate (e.g., 'maven', 'gradle')
   * @param {string} category - The category for persistence
   */
  function activateTabsByType(type, category) {
    const containers = document.querySelectorAll(`.codetabs[data-category="${category}"]`);

    containers.forEach(container => {
      const tab = container.querySelector(`:scope > [role="tablist"] > [role="tab"][data-type="${type}"]`);

      if (!tab) return; // this group doesn't have this tab type

      // Deactivate everything in this group
      deactivateGroup(container);

      // Activate the selected tab
      tab.setAttribute('aria-selected', 'true');
      tab.setAttribute('tabindex', '0');

      const panel = container.querySelector(`#${tab.getAttribute("aria-controls")}`);
      if (panel) {
        panel.hidden = false;
      }
    });

    // Save preference
    storage.set(category, type);
  }

  /**
   * Handle tab click
   * @param {Event} e - Click event
   */
  function handleTabClick(e) {
    const tab = e.target.closest('[role="tab"]');
    if (!tab) return;

    const type = tab.dataset.type;
    const category = getCategory(tab);

    if (type && category) {
      activateTabsByType(type, category);
    }
  }

  /**
   * Handle keyboard navigation within a tablist
   * @param {KeyboardEvent} e - Keyboard event
   */
  function handleKeyboard(e) {
    const tab = e.target.closest('[role="tab"]');
    if (!tab) return;

    const tabs = getTabsInGroup(tab);
    const currentIndex = tabs.indexOf(tab);
    if (currentIndex === -1) return; // Exit if the focused element is not a tab
    let newIndex = 0;

    switch (e.key) {
      case "ArrowRight":
        newIndex = (currentIndex + 1) % tabs.length;
        break;
      case "ArrowLeft":
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        newIndex = 0;
        break;
      case "End":
        newIndex = tabs.length - 1;
        break;
      default:
        return; // Exit if the key is not recognized
    }

    e.preventDefault();
    e.stopPropagation();

    if (newIndex !== currentIndex) {
      const targetTab = tabs[newIndex];
      const type = targetTab.dataset.type;
      const category = getCategory(targetTab);

      activateTabsByType(type, category);
      targetTab.focus();
    }
  }

  /**
   * Initialize codetabs on page load
   */
  function init() {
    // Get all unique categories on the page
    const categories = new Set();

    const tabs = document.querySelectorAll('.codetabs');

    tabs.forEach(container => {
      categories.add(container.dataset.category);

      // Attach event listeners using delegation
      const tabList = container.querySelector(`:scope > [role="tablist"]`);
      tabList.addEventListener('click', handleTabClick);
      tabList.addEventListener('keydown', handleKeyboard); 
    });

    // Restore saved preferences for each category
    categories.forEach(category => {
      const savedType = storage.get(category);
      if (savedType) {
        const selectedTab = document.querySelector(
          `.codetabs[data-category="${category}"] > [role="tablist"] > [role="tab"][data-type="${savedType}"]`
        );
        if (selectedTab) activateTabsByType(savedType, category);
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
