(() => {
  const dialog = document.querySelector('#diagram-viewer');
  if (typeof dialog.showModal !== 'function') return;

  const title = dialog.querySelector('h2');
  const original = dialog.querySelector('#viewer-original');
  const pane = dialog.querySelector('.viewer-pane');
  const zoom = dialog.querySelector('.viewer-zoom');
  const image = zoom.querySelector('img');
  let opener;

  for (const thumbnail of document.querySelectorAll('.project .diagram-link')) {
    const project = thumbnail.closest('.project');
    const preview = thumbnail.querySelector('img');
    const name = project.querySelector('h3').firstChild.textContent.trim();
    const links = [...project.querySelectorAll('a')].filter(link => link.href === thumbnail.href);
    for (const link of links) {
      link.setAttribute('aria-haspopup', 'dialog');
      link.setAttribute('aria-controls', dialog.id);
      link.setAttribute('aria-label', '预览 ' + name + ' 架构图');
      link.title = '预览架构图';
      link.querySelector('.arrow')?.remove();
      link.addEventListener('click', event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        opener = link;
        title.textContent = name;
        original.href = link.href;
        image.src = preview.src;
        image.alt = preview.alt;
        zoom.style.setProperty('--diagram-width', preview.getAttribute('width') + 'px');
        zoom.setAttribute('aria-pressed', 'false');
        dialog.showModal();
        pane.scrollTo(0, 0);
      });
    }
  }

  zoom.addEventListener('click', event => {
    const expand = zoom.getAttribute('aria-pressed') !== 'true';
    const box = image.getBoundingClientRect();
    const scale = Math.min(box.width / image.naturalWidth, box.height / image.naturalHeight);
    const axis = (point, start, extent, drawn) => event.detail && drawn
      ? Math.max(0, Math.min(1, (point - start - (extent - drawn) / 2) / drawn)) : 0.5;
    const x = axis(event.clientX, box.left, box.width, image.naturalWidth * scale);
    const y = axis(event.clientY, box.top, box.height, image.naturalHeight * scale);
    zoom.setAttribute('aria-pressed', String(expand));
    pane.scrollTo(expand ? x * image.clientWidth - pane.clientWidth / 2 : 0,
      expand ? y * image.clientHeight - pane.clientHeight / 2 : 0);
  });
  dialog.querySelector('.viewer-close').addEventListener('click', () => dialog.close());
  let pressedBackdrop = false;
  dialog.addEventListener('pointerdown', event => { pressedBackdrop = event.target === dialog; });
  dialog.addEventListener('click', event => {
    if (pressedBackdrop && event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus({ preventScroll: true }));
})();
