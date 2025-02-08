document.addEventListener('DOMContentLoaded', () => {
  console.log("Loading filters.js");

  // Setup Filters Panel
  function setupFiltersPanel() {
    const filtersEnabledCheckbox = document.querySelector('input[name="filtersEnabled"]');
    const filtersPanel = document.getElementById('filters-panel');

    if (!filtersEnabledCheckbox || !filtersPanel) {
      console.warn("Filters elements not found, skipping filters setup.");
      return;
    }

    filtersEnabledCheckbox.addEventListener('change', () => {
      filtersPanel.classList.toggle('hidden', !filtersEnabledCheckbox.checked);
    });

    // Ensure the filters panel is hidden by default if unchecked
    if (!filtersEnabledCheckbox.checked) {
      filtersPanel.classList.add('hidden');
    }
  }

  // Setup Distance Slider
  function setupDistanceSlider() {
    const distanceSlider = document.getElementById('distance-slider');
    if (!distanceSlider) {
      console.warn("Distance slider not found, skipping setup.");
      return;
    }

    const distanceLabel = distanceSlider.nextElementSibling;
    distanceSlider.addEventListener('input', () => {
      distanceLabel.textContent = `${distanceSlider.value} miles`;
    });
  }

  // Run Setup Functions
  setupFiltersPanel();
  setupDistanceSlider();
});

