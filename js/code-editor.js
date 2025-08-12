// js/code-editor.js
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.code-card').forEach(card => {
    const previewCode = card.querySelector('.code-preview code');
    const previewPre = card.querySelector('.code-preview');
    const textarea = card.querySelector('.code-editor-textarea');
    const btnEdit = card.querySelector('.code-edit');
    const btnSave = card.querySelector('.code-save');
    const btnCopy = card.querySelector('.code-copy');
    const btnDownload = card.querySelector('.code-download');
    const langSelect = card.querySelector('.code-lang-select');
    const langLabel = card.querySelector('.code-lang');
    const filenameInput = card.querySelector('.code-filename');

    // Initialize textarea value
    if (previewCode && textarea) {
      textarea.value = previewCode.textContent.trim();
    }

    // Update code preview
    function updatePreview() {
      if (!previewCode || !textarea) return;
      
      previewCode.textContent = textarea.value;
      
      let lang = (langSelect && langSelect.value) || (card.dataset.lang) || '';
      if (lang) {
        previewCode.className = 'language-' + lang;
        if (langLabel) {
          langLabel.textContent = lang === 'cpp' ? 'C++' : lang.toUpperCase();
        }
      }
      
      if (window.hljs) {
        try {
          hljs.highlightElement(previewCode);
        } catch (e) {
          console.error('Highlight error:', e);
        }
      }
    }

    // Toggle edit mode
    if (btnEdit && btnSave && textarea && previewPre) {
      btnEdit.addEventListener('click', () => {
        card.classList.add('editing');
        textarea.style.display = 'block';
        previewPre.style.display = 'none';
        btnEdit.style.display = 'none';
        btnSave.style.display = 'inline-block';
        textarea.focus();
        textarea.selectionStart = textarea.value.length;
      });

      btnSave.addEventListener('click', () => {
        card.classList.remove('editing');
        textarea.style.display = 'none';
        previewPre.style.display = 'block';
        btnEdit.style.display = 'inline-block';
        btnSave.style.display = 'none';
        updatePreview();
      });
    }

    // Copy code
    if (btnCopy) {
      btnCopy.addEventListener('click', async () => {
        const text = textarea.style.display !== 'none' ? textarea.value : previewCode.textContent;
        try {
          await navigator.clipboard.writeText(text);
          btnCopy.textContent = 'Скопировано!';
          setTimeout(() => btnCopy.textContent = 'Копировать', 1400);
        } catch (err) {
          const ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand('copy');
            btnCopy.textContent = 'Скопировано!';
          } catch (e) {
            btnCopy.textContent = 'Ошибка';
          }
          setTimeout(() => btnCopy.textContent = 'Копировать', 1400);
          ta.remove();
        }
      });
    }

    // Download code
    if (btnDownload) {
      btnDownload.addEventListener('click', () => {
        const text = textarea.style.display !== 'none' ? textarea.value : previewCode.textContent;
        const filename = (filenameInput && filenameInput.value) ? filenameInput.value : 'code.txt';
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    // Language selection
    if (langSelect) {
      langSelect.addEventListener('change', updatePreview);
    }

    // Live preview
    if (textarea) {
      let timer = null;
      textarea.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(updatePreview, 220);
      });
    }

    // Initial highlight
    if (previewCode) {
      updatePreview();
    }
  });
});