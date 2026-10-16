// Filtros progresivos: sin JavaScript, el contenido completo permanece visible.
(() => {
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  document.querySelectorAll('[data-query-target]').forEach(input => {
    const target = document.getElementById(input.dataset.queryTarget);
    if (!target) return;
    const selector = input.dataset.queryItems || 'tbody tr';
    const items = [...target.querySelectorAll(selector)];
    const feedback = document.getElementById(input.getAttribute('aria-describedby'));
    const aliases = {chivas:'guadalajara', rayados:'monterrey', 'la maquina':'cruz azul', aguilas:'america'};
    const run = () => {
      const raw = normalize(input.value.trim());
      const query = aliases[raw] || raw;
      let visible = 0;
      items.forEach(item => {
        const text = normalize(item.textContent);
        item.hidden = !!query && !text.includes(query) && !text.includes(raw);
        if (!item.hidden) visible++;
      });
      if (feedback) feedback.textContent = visible ? `${visible} coincidencias de ${items.length}.` : 'Sin coincidencias. Prueba otro nombre o borra la búsqueda.';
    };
    input.closest('[data-query-controls]').hidden = false;
    input.addEventListener('input', run);
    run();
  });
})();
