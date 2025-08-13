// Блокируем copy/selectstart для элементов с классом .no-copy
document.addEventListener('DOMContentLoaded', () => {
  // отмена стандартного копирования для элементов no-copy
  document.querySelectorAll('.no-copy').forEach(el => {
    el.addEventListener('copy', (e) => {
      e.preventDefault();
    });
    // предотвращаем выделение через мышь и touchstart
    el.addEventListener('selectstart', (e) => {
      e.preventDefault();
    });
    // (опционально) блокируем выделение по двойному клику
    el.addEventListener('mousedown', (e) => {
      // разрешаем клик, но не выделение (только если не удерживается Shift)
      if (e.detail > 1) e.preventDefault();
    });
  });

  // дополнительная защита: если пользователь пытается скопировать из DOM,
  // проверяем, содержит ли selection элемент с .no-copy — и отменяем.
  document.addEventListener('copy', (e) => {
    const sel = document.getSelection();
    if (!sel) return;
    const node = sel.anchorNode;
    if (!node) return;
    if (node.nodeType === 3) {
      // поднять до родителя
      const parent = node.parentElement;
      if (parent && parent.closest && parent.closest('.no-copy')) {
        e.preventDefault();
      }
    } else {
      if (node.closest && node.closest('.no-copy')) {
        e.preventDefault();
      }
    }
  });
});
