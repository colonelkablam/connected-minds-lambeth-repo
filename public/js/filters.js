document.addEventListener('DOMContentLoaded', () => {
  // Toggle Filters Panel Visibility
  const filtersEnabledCheckbox = document.querySelector('input[name="filtersEnabled"]');
  const filtersPanel = document.getElementById('filters-panel');

  filtersEnabledCheckbox.addEventListener('change', () => {
    if (filtersEnabledCheckbox.checked) {
      filtersPanel.classList.remove('hidden');
    } else {
      filtersPanel.classList.add('hidden');
    }
  });

  // Ensure the filters panel is hidden by default if the checkbox is unchecked
  if (!filtersEnabledCheckbox.checked) {
    filtersPanel.classList.add('hidden');
  }

  // Handle Distance Slider Label
  const distanceSlider = document.getElementById('distance-slider');
  const distanceLabel = distanceSlider.nextElementSibling;

  distanceSlider.addEventListener('input', () => {
    distanceLabel.textContent = `${distanceSlider.value} miles`;
  });
});
