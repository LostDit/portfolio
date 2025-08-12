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

    // init textarea value from preview
    textarea.value = previewCode.textContent.trim();

    // helper: update preview (with highlight.js if available)
    function updatePreview() {
      // set textContent to preserve raw code (avoid HTML injection)
      previewCode.textContent = textarea.value;
      // update language class from select (or card dataset)
      let lang = (langSelect && langSelect.value) || (card.dataset.lang) || '';
      if (lang) {
        // set classes on code element
        previewCode.className = 'language-' + lang;
        if (langLabel) langLabel.textContent = (lang === 'cpp' ? 'C++' : lang.toUpperCase());
      }
      // run highlight
      if (window.hljs) {
        try {
          hljs.highlightElement(previewCode);
        } catch (e) { /* ignore */ }
      }
    }

    // Toggle editing
    btnEdit && btnEdit.addEventListener('click', () => {
      card.classList.add('editing');
      textarea.style.display = '';
      previewPre.style.display = 'none';
      btnEdit.style.display = 'none';
      btnSave.style.display = '';
      textarea.focus();
      // put cursor at end
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
    });

    btnSave && btnSave.addEventListener('click', () => {
      card.classList.remove('editing');
      textarea.style.display = 'none';
      previewPre.style.display = '';
      btnEdit.style.display = '';
      btnSave.style.display = 'none';
      updatePreview();
    });

    // Copy
    btnCopy && btnCopy.addEventListener('click', async () => {
      const text = textarea.style.display !== 'none' ? textarea.value : previewCode.textContent;
      try {
        await navigator.clipboard.writeText(text);
        btnCopy.textContent = 'Скопировано!';
        setTimeout(() => btnCopy.textContent = 'Копировать', 1400);
      } catch (err) {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); btnCopy.textContent = 'Скопировано!'; }
        catch (e) { btnCopy.textContent = 'Ошибка'; }
        ta.remove();
        setTimeout(() => btnCopy.textContent = 'Копировать', 1400);
      }
    });

    // Download
    btnDownload && btnDownload.addEventListener('click', () => {
      const text = textarea.style.display !== 'none' ? textarea.value : previewCode.textContent;
      const filename = (filenameInput && filenameInput.value) ? filenameInput.value : 'code.txt';
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

    // language select change => update preview immediately
    if (langSelect) {
      langSelect.addEventListener('change', () => {
        updatePreview();
      });
    }

    // filename input change reflect maybe to UI (optional)
    if (filenameInput) {
      filenameInput.addEventListener('input', () => {
        // you could validate or auto-suggest ext based on language
      });
    }

    // live preview on input (debounced)
    let timer = null;
    textarea.addEventListener('input', () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        updatePreview();
        timer = null;
      }, 220);
    });

    // initial highlight
    updatePreview();
  });
});
