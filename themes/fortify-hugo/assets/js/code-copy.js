/**
 * Code Copy - Add clipboard copy buttons to code blocks
 */
(function() {
  'use strict';

  const COPY_TIMEOUT = 2000;

  /**
   * Create a copy button element
   * @returns {HTMLButtonElement} The copy button
   */
  function createCopyButton() {
    const button = document.createElement('button');
    button.className = 'code-copy-btn';
    button.type = 'button';
    button.setAttribute('aria-label', 'Copy code to clipboard');
    button.setAttribute('title', 'Copy code');
    button.innerHTML = '<i class="fa-regular fa-copy"></i>';
    return button;
  }

  /**
   * Extract text content from a code block
   * @param {HTMLElement} codeBlock - The code block element
   * @returns {string} The extracted code text
   */
  function getCodeContent(codeBlock) {
    const code = codeBlock.querySelector('code') || codeBlock;
    return code.textContent || code.innerText || '';
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
    } catch (e) {
      console.error('Failed to copy to clipboard:', e);
      return false;
    }
  }

  /**
   * Update button to show success state
   * @param {HTMLButtonElement} button - The copy button
   */
  function showCopySucceededState(button) {
    const icon = button.querySelector('i');
    if (icon) {
      icon.className = 'fa-solid fa-check';
    }

    button.classList.add('code-copy-btn--copied');
    button.setAttribute('aria-label', 'Code copied to clipboard');
    button.setAttribute('title', 'Copied!');
  }

  /**
   * Update button to show failed state
   * @param {HTMLButtonElement} button - The copy button
   */
  function showCopyFailedState(button) {
    const icon = button.querySelector('i');
    if (icon) {
      icon.className = 'fa-solid fa-xmark';
    }

    button.setAttribute('aria-label', 'Failed to copy code to clipboard');
    button.setAttribute('title', 'Failed to copy');
  }

  /**
   * Reset button to default state
   * @param {HTMLButtonElement} button - The copy button
   */
  function resetButtonState(button) {
    const icon = button.querySelector('i');
    if (icon) {
      icon.className = 'fa-regular fa-copy';
    }

    button.classList.remove('code-copy-btn--copied');
    button.setAttribute('aria-label', 'Copy code to clipboard');
    button.setAttribute('title', 'Copy code');
  }

  /**
   * Handle copy button click
   * @param {Event} e - Click event
   */
  async function handleCopyClick(e) {
    const button = e.currentTarget;
    const block = button.closest('.highlight');
    if (!block) return;

    const codeBlock = block.querySelector('pre') || block.querySelector('code');
    if (!codeBlock) return;

    const code = getCodeContent(codeBlock);
    const success = await copyToClipboard(code);

    if (success) {
      showCopySucceededState(button);
    } else {
      showCopyFailedState(button);
    }

    setTimeout(() => resetButtonState(button), COPY_TIMEOUT);
  }

  /**
   * Add copy button to a code block
   * @param {HTMLElement} block - The code block element
   */
  function addCopyButton(block) {
    if (block.querySelector('.code-copy-btn')) return;

    const button = createCopyButton();
    button.addEventListener('click', handleCopyClick);
    block.appendChild(button);
  }

  /**
   * Initialize copy buttons for all code blocks
   */
  function init() {
    const codeBlocks = document.querySelectorAll('.highlight');
    codeBlocks.forEach(addCopyButton);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
