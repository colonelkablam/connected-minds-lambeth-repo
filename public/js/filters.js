document.addEventListener('DOMContentLoaded', () => {
    const filtersEnabledCheckbox = document.getElementById('filters-enabled');
    const filtersPanel = document.getElementById('filters-panel');
  
    filtersEnabledCheckbox.addEventListener('change', () => {
      if (filtersEnabledCheckbox.checked) {
        filtersPanel.classList.remove('hidden');
      } else {
        filtersPanel.classList.add('hidden');
      }
    });
});
  
