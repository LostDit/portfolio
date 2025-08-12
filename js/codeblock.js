// js/codeblock.js
document.addEventListener('DOMContentLoaded', () => {
  // Handle copy buttons
  document.querySelectorAll('.code-card').forEach(card => {
    const btn = card.querySelector('.code-copy');
    const codeEl = card.querySelector('pre code');

    if (!btn || !codeEl) return;

    btn.addEventListener('click', async () => {
      const text = codeEl.innerText;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'Скопировано!';
        setTimeout(() => btn.textContent = 'Копировать', 1400);
      } catch (err) {
        // fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try { document.execCommand('copy'); btn.textContent = 'Скопировано!'; }
        catch(e) { btn.textContent = 'Ошибка'; }
        textarea.remove();
        setTimeout(() => btn.textContent = 'Копировать', 1400);
      }
    });
  });

  // highlight.js init (если подключили через CDN)
  if (window.hljs) {
    document.querySelectorAll('pre code').forEach((block) => {
      try { hljs.highlightElement(block); } catch (e) { /* ignore */ }
    });
  }
});
