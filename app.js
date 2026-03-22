let data = null;
let selectedCountries = [];
let currentYear = new Date().getFullYear();
let maxGdp = 0;
let hoveredCountry = null;

const COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
  '#06B6D4', '#A855F7', '#F43F5E', '#22C55E', '#0EA5E9',
  '#D946EF', '#FB923C', '#4ADE80', '#818CF8', '#FBBF24'
];

// Stable color assignment - each country keeps its color
const countryColorMap = new Map();

function getCountryColor(code) {
  if (!countryColorMap.has(code)) {
    countryColorMap.set(code, COLORS[countryColorMap.size % COLORS.length]);
  }
  return countryColorMap.get(code);
}

const DEFAULT_COUNTRIES = [
  'USA', 'FRA', 'JPN', 'RUS', 'CHN', 'IND', 'ARG', 'KEN', 'ISR', 'ARE'
];

async function init() {
  const response = await fetch('data/gdp-per-capita.json');
  data = await response.json();

  const maxYear = Math.max(...data.years);
  currentYear = Math.min(new Date().getFullYear(), maxYear);

  document.getElementById('current-year-note').textContent = currentYear;

  // Calculate max GDP using latest available value for each country
  maxGdp = Math.max(...data.countries.map(c => getLatestValue(c)));

  const urlParams = new URLSearchParams(window.location.search);
  const urlCountries = urlParams.get('country');

  if (urlCountries) {
    selectedCountries = urlCountries.split('~').filter(code =>
      data.countries.find(c => c.code === code)
    );
  } else {
    selectedCountries = DEFAULT_COUNTRIES.filter(code =>
      data.countries.find(c => c.code === code)
    );
  }

  setupCountrySearch();
  setupActionButtons();
  loadViewCount();

  renderCountryList();
  renderChart();
  updateURL();
  updateSelectedCount();
}

// Get latest non-null value for a country
function getLatestValue(country) {
  // Try current year first, then go backwards
  for (let year = currentYear; year >= 1980; year--) {
    if (country.data[year] && country.data[year] > 0) {
      return country.data[year];
    }
  }
  return 0;
}

// Get latest year with data for a country
function getLatestYear(country) {
  for (let year = currentYear; year >= 1980; year--) {
    if (country.data[year] && country.data[year] > 0) {
      return year;
    }
  }
  return null;
}

async function loadViewCount() {
  try {
    // Call Netlify function (proxies to counterapi.dev)
    const response = await fetch('/api/views');
    const result = await response.json();
    if (result.count !== undefined) {
      document.getElementById('view-count').textContent = `${formatViewCount(result.count)} views`;
    }
  } catch (e) {
    // Silent fail - counter not available locally, works on Netlify
    console.log('View counter unavailable (works after deploy)');
  }
}

function formatViewCount(count) {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}

function setupCountrySearch() {
  const input = document.getElementById('country-input');
  input.addEventListener('input', () => renderCountryList(input.value.toLowerCase()));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      renderCountryList();
    }
  });
}

function setupActionButtons() {
  document.getElementById('btn-download-png').addEventListener('click', downloadPNG);
  document.getElementById('btn-download-json').addEventListener('click', downloadJSON);
  document.getElementById('btn-copy-citation').addEventListener('click', () => {
    const citation = document.querySelector('.citation-box code').textContent;
    navigator.clipboard.writeText(citation);
    showToast('Citation copied to clipboard');
  });

  document.getElementById('btn-share').addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard');
  });

  document.getElementById('btn-clear').addEventListener('click', () => {
    selectedCountries = [];
    renderCountryList();
    renderChart();
    updateURL();
    updateSelectedCount();
  });
}

function updateSelectedCount() {
  document.getElementById('selected-count').textContent = selectedCountries.length;
}

function getCountriesSorted() {
  return data.countries
    .map(c => ({ ...c, value: getLatestValue(c), latestYear: getLatestYear(c) }))
    .sort((a, b) => b.value - a.value);
}

function renderCountryList(filter = '') {
  const container = document.getElementById('country-list');
  let countries = getCountriesSorted();

  if (filter) {
    countries = countries.filter(c =>
      c.name.toLowerCase().includes(filter) ||
      c.code.toLowerCase().includes(filter)
    );
  }

  // Keep countries sorted by GDP (no reordering based on selection)
  // But show selected countries at top as a separate section

  const selectedList = selectedCountries
    .map(code => countries.find(c => c.code === code))
    .filter(Boolean)
    .sort((a, b) => b.value - a.value);

  let html = '';

  // Selected section at top (if any selected and not filtering)
  if (selectedList.length > 0 && !filter) {
    html += '<div class="country-section-label">Selected</div>';
    html += selectedList.map(c => renderCountryItem(c, true)).join('');
    html += '<div class="country-section-label">All countries</div>';
  }

  // All countries sorted by GDP
  html += countries.map(c => renderCountryItem(c, false)).join('');

  container.innerHTML = html;

  container.querySelectorAll('.country-item').forEach(item => {
    item.addEventListener('click', () => toggleCountry(item.dataset.code));

    if (selectedCountries.includes(item.dataset.code)) {
      item.addEventListener('mouseenter', () => setHoveredCountry(item.dataset.code));
      item.addEventListener('mouseleave', () => setHoveredCountry(null));
    }
  });
}

function renderCountryItem(c, isInSelectedSection) {
  const isSelected = selectedCountries.includes(c.code);
  const barColor = isSelected ? getCountryColor(c.code) : '#d1d5db';
  const barWidth = maxGdp > 0 ? (c.value / maxGdp) * 100 : 0;
  const yearNote = c.latestYear < currentYear ? ` (${c.latestYear})` : '';

  return `
    <div class="country-item ${isSelected ? 'selected' : ''}" data-code="${c.code}">
      <div class="country-checkbox"></div>
      <div class="country-info">
        <span class="country-name">${c.name}</span>
        <div class="country-bar-container">
          <div class="country-bar" style="width: ${barWidth}%; background: ${barColor}"></div>
        </div>
      </div>
      <span class="country-value">$${formatNumber(c.value)}${yearNote}</span>
    </div>
  `;
}

function setHoveredCountry(code) {
  hoveredCountry = code;
  updateChartHighlight();
}

function updateChartHighlight() {
  const svg = d3.select('#chart');

  selectedCountries.forEach((code) => {
    const dimmed = hoveredCountry && hoveredCountry !== code;
    svg.selectAll(`.line-${code}`).classed('dimmed', dimmed);
    svg.selectAll(`.point-${code}`).classed('dimmed', dimmed);
    svg.selectAll(`.label-${code}`).classed('dimmed', dimmed);
  });
}

function toggleCountry(code) {
  const container = document.getElementById('country-list');
  const wasSelected = selectedCountries.includes(code);
  const prevSelectedCount = selectedCountries.length;
  const scrollTop = container.scrollTop;

  // Measure height of the clicked item before re-render
  const clickedItem = container.querySelector(`.country-item[data-code="${code}"]`);
  const clickedItemHeight = clickedItem ? clickedItem.offsetHeight : 45;
  const existingLabel = container.querySelector('.country-section-label');
  const labelHeight = existingLabel ? existingLabel.offsetHeight : 25;

  const idx = selectedCountries.indexOf(code);
  if (idx === -1) {
    if (selectedCountries.length >= 20) {
      showToast('Maximum 20 countries');
      return;
    }
    selectedCountries.push(code);
  } else {
    selectedCountries.splice(idx, 1);
  }

  const filter = document.getElementById('country-input').value.toLowerCase();
  renderCountryList(filter);
  renderChart();
  updateURL();
  updateSelectedCount();

  // Adjust scroll to keep clicked item in place
  if (!filter) {
    if (!wasSelected && prevSelectedCount === 0) {
      // First selection: "Selected" label + item + "All countries" label added at top
      container.scrollTop = scrollTop + labelHeight + clickedItemHeight + labelHeight;
    } else if (!wasSelected) {
      // Adding another: just one item added to Selected section
      container.scrollTop = scrollTop + clickedItemHeight;
    } else if (wasSelected && selectedCountries.length === 0) {
      // Deselected last one: both labels + item removed
      container.scrollTop = Math.max(0, scrollTop - labelHeight - clickedItemHeight - labelHeight);
    } else {
      // Deselected but others remain: one item removed from Selected
      container.scrollTop = Math.max(0, scrollTop - clickedItemHeight);
    }
  }
}

function updateURL() {
  const url = new URL(window.location);
  if (selectedCountries.length > 0) {
    url.searchParams.set('country', selectedCountries.join('~'));
  } else {
    url.searchParams.delete('country');
  }
  window.history.replaceState({}, '', url);
}

function formatNumber(num) {
  if (num >= 1000) {
    return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return num.toFixed(0);
}

function renderChart() {
  const container = document.getElementById('chart-container');
  const svg = d3.select('#chart');
  const tooltip = document.getElementById('tooltip');

  svg.selectAll('*').remove();

  const rect = container.getBoundingClientRect();
  const width = rect.width - 32;
  const height = rect.height - 32;

  if (selectedCountries.length === 0) {
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#666666')
      .text('Select countries to compare');
    return;
  }

  // Calculate labelWidth based on longest selected country name
  const longestName = selectedCountries.reduce((max, code) => {
    const country = data.countries.find(c => c.code === code);
    return country && country.name.length > max ? country.name.length : max;
  }, 0);
  const charWidth = width < 400 ? 5 : 6;
  const labelWidth = Math.max(60, longestName * charWidth + 10);

  const leftMargin = width < 350 ? 45 : 60;
  const margin = { top: 20, right: labelWidth + 15, bottom: 40, left: leftMargin };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

  const series = selectedCountries.map((code) => {
    const country = data.countries.find(c => c.code === code);
    return {
      code,
      name: country.name,
      color: getCountryColor(code),
      values: data.years.map(year => ({
        year,
        value: country.data[year] || null,
        isProjection: year > currentYear
      })).filter(d => d.value !== null && d.value > 0)
    };
  });

  const allValues = series.flatMap(s => s.values.map(v => v.value));
  const x = d3.scaleLinear().domain(d3.extent(data.years)).range([0, innerWidth]);
  const y = d3.scaleLinear().domain([0, d3.max(allValues) * 1.1]).range([innerHeight, 0]);

  const xTicks = width < 350 ? 4 : width < 450 ? 6 : 10;
  g.append('g')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(xTicks))
    .selectAll('text').style('font-size', '11px');

  const yTicks = width < 400 ? 4 : 6;
  const yFormat = width < 400
    ? d => d >= 1000 ? '$' + (d/1000) + 'K' : '$' + d
    : d => '$' + d3.format(',.0f')(d);
  g.append('g')
    .call(d3.axisLeft(y).tickFormat(yFormat).ticks(yTicks))
    .selectAll('text').style('font-size', '11px');

  g.append('g').selectAll('line').data(y.ticks(yTicks)).join('line')
    .attr('x1', 0).attr('x2', innerWidth)
    .attr('y1', d => y(d)).attr('y2', d => y(d))
    .attr('stroke', '#e0e0e0').attr('stroke-dasharray', '2,2');

  const line = d3.line().x(d => x(d.year)).y(d => y(d.value)).defined(d => d.value !== null);

  const labelPositions = series.map(s => {
    const lastValue = s.values[s.values.length - 1];
    return { code: s.code, name: s.name, color: s.color, y: lastValue ? y(lastValue.value) : 0, originalY: lastValue ? y(lastValue.value) : 0 };
  }).sort((a, b) => a.y - b.y);

  const minGap = 14;
  const maxY = innerHeight - 15;
  // First pass: push labels down
  for (let i = 1; i < labelPositions.length; i++) {
    if (labelPositions[i].y - labelPositions[i - 1].y < minGap) {
      labelPositions[i].y = labelPositions[i - 1].y + minGap;
    }
  }
  // Second pass: if labels exceed maxY, push them up
  for (let i = labelPositions.length - 1; i >= 0; i--) {
    if (labelPositions[i].y > maxY) {
      labelPositions[i].y = maxY;
    }
    if (i > 0 && labelPositions[i].y - labelPositions[i - 1].y < minGap) {
      labelPositions[i - 1].y = labelPositions[i].y - minGap;
    }
  }

  // Crosshair (behind lines and points)
  const crosshair = g.append('line')
    .attr('class', 'crosshair')
    .attr('y1', 0).attr('y2', innerHeight)
    .style('opacity', 0);

  series.forEach(s => {
    const historical = s.values.filter(d => !d.isProjection);
    if (historical.length > 0) {
      g.append('path')
        .datum(historical)
        .attr('class', `chart-line line-${s.code}`)
        .attr('fill', 'none')
        .attr('stroke', s.color)
        .attr('stroke-width', 2)
        .attr('d', line);
    }

    const projection = s.values.filter(d => d.isProjection);
    const lastHistorical = historical[historical.length - 1];
    if (projection.length > 0 && lastHistorical) {
      g.append('path')
        .datum([lastHistorical, ...projection])
        .attr('class', `chart-line line-${s.code}`)
        .attr('fill', 'none')
        .attr('stroke', s.color)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '1,3').attr('stroke-linecap', 'round')
        .attr('d', line);
    }

    g.selectAll(`.point-${s.code}`)
      .data(s.values)
      .join('circle')
      .attr('class', `chart-point point-${s.code}`)
      .attr('cx', d => x(d.year))
      .attr('cy', d => y(d.value))
      .attr('r', 2)
      .attr('fill', s.color);
  });

  labelPositions.forEach(lp => {
    const xEnd = innerWidth;
    const xLabel = xEnd + 14;

    if (Math.abs(lp.y - lp.originalY) > 2) {
      g.append('path')
        .attr('class', 'label-line')
        .attr('d', `M${xEnd},${lp.originalY} L${xEnd + 4},${lp.originalY} L${xEnd + 4},${lp.y} L${xLabel - 2},${lp.y}`)
        .attr('stroke', '#9ca3af')
        .attr('stroke-width', 1)
        .attr('fill', 'none');
    }

    const labelFontSize = width < 400 ? '9px' : '11px';
    g.append('text')
      .attr('class', `country-label label-${lp.code}`)
      .attr('x', xLabel)
      .attr('y', lp.y)
      .attr('dy', '0.35em')
      .attr('fill', lp.color)
      .attr('font-size', labelFontSize)
      .attr('font-weight', '500')
      .text(lp.name)
      .style('cursor', 'pointer')
      .on('mouseenter', () => setHoveredCountry(lp.code))
      .on('mouseleave', () => setHoveredCountry(null));
  });

  const overlay = g.append('rect')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .attr('fill', 'transparent')
    .style('cursor', 'crosshair');

  overlay.on('mousemove', function(event) {
    const [mx] = d3.pointer(event);
    const year = Math.round(x.invert(mx));
    const clampedYear = Math.max(data.years[0], Math.min(year, data.years[data.years.length - 1]));

    crosshair.attr('x1', x(clampedYear)).attr('x2', x(clampedYear)).style('opacity', 1);

    series.forEach(s => {
      g.selectAll(`.point-${s.code}`).attr('r', d => d.year === clampedYear ? 4 : 2);
    });

    const tooltipData = series
      .map(s => {
        const d = s.values.find(v => v.year === clampedYear);
        return d ? { name: s.name, value: d.value, color: s.color, isProjection: d.isProjection } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.value - a.value);

    if (tooltipData.length > 0) {
      const yearLabel = clampedYear > currentYear ? `${clampedYear} (projection)` : clampedYear;
      tooltip.innerHTML = `
        <div class="tooltip-year">${yearLabel}</div>
        ${tooltipData.map(d => `
          <div class="tooltip-row">
            <span class="tooltip-country">
              <span class="tooltip-dot" style="background: ${d.color}"></span>
              ${d.name}
            </span>
            <span class="tooltip-value">$${formatNumber(d.value)}</span>
          </div>
        `).join('')}
      `;

      const containerRect = container.getBoundingClientRect();
      let left = event.clientX - containerRect.left + 15;
      let top = event.clientY - containerRect.top - 10;
      if (left + 220 > containerRect.width) left = event.clientX - containerRect.left - 230;

      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
      tooltip.classList.add('active');
    }
  });

  overlay.on('mouseleave', function() {
    crosshair.style('opacity', 0);
    tooltip.classList.remove('active');
    series.forEach(s => g.selectAll(`.point-${s.code}`).attr('r', 2));
  });

  document.getElementById('chart-legend').innerHTML = `
    <div class="legend-item"><span class="legend-color"></span>Historical</div>
    <div class="legend-item"><span class="legend-color dotted"></span>IMF Projection</div>
  `;
}

function downloadPNG() {
  // Create a temporary chart for export
  const exportWidth = 600;
  const exportHeight = 340;

  // Create temporary SVG for export
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.width = exportWidth + 'px';
  tempContainer.style.height = exportHeight + 'px';
  document.body.appendChild(tempContainer);

  const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  tempSvg.setAttribute('width', exportWidth);
  tempSvg.setAttribute('height', exportHeight);
  tempSvg.style.background = '#ffffff';
  tempContainer.appendChild(tempSvg);

  // Render chart to temp SVG
  renderChartToSvg(tempSvg, exportWidth, exportHeight);

  // Convert to canvas
  const scale = 2;
  const canvasWidth = exportWidth + 40;
  const canvasHeight = exportHeight + 120;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth * scale;
  canvas.height = canvasHeight * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const padding = 20;

  // Header - title
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'left';
  const titleY = 22;
  ctx.fillText('GDP per capita (nominal)', padding, titleY);

  // Subtitle - 11px like axis labels
  ctx.fillStyle = '#666666';
  ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
  const subtitleY = titleY + 20;
  const line1 = 'Average economic output per person in a country per year, in current US dollars.';
  ctx.fillText(line1, padding, subtitleY);

  const line2Y = subtitleY + 14;
  const line2part1 = 'Not';
  const line2part2 = ' adjusted for purchasing power or local prices.';
  ctx.fillText(line2part1, padding, line2Y);
  const w1 = ctx.measureText(line2part1).width;
  ctx.beginPath();
  ctx.moveTo(padding, line2Y + 2);
  ctx.lineTo(padding + w1, line2Y + 2);
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillText(line2part2, padding + w1, line2Y);

  // Chart
  const chartY = line2Y + 14;

  // Draw chart from temp SVG
  const svgData = new XMLSerializer().serializeToString(tempSvg);
  const img = new Image();

  img.onload = function() {
    ctx.drawImage(img, padding, chartY, exportWidth, exportHeight);

    // Footer
    const footerY = chartY + exportHeight + 24;

    ctx.fillStyle = '#666666';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Data: IMF World Economic Outlook (2026) · Years after ${currentYear} are projections`, padding, footerY);

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('gdppercapita.fyi', canvasWidth - padding, footerY);

    // Cleanup
    document.body.removeChild(tempContainer);

    // Download
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.download = `gdp-per-capita_${date}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}

function renderChartToSvg(svg, width, height) {
  const d3svg = d3.select(svg);
  d3svg.selectAll('*').remove();

  if (selectedCountries.length === 0) return;

  // Calculate labelWidth based on longest selected country name
  const longestName = selectedCountries.reduce((max, code) => {
    const country = data.countries.find(c => c.code === code);
    return country && country.name.length > max ? country.name.length : max;
  }, 0);
  const labelWidth = Math.max(60, longestName * 6 + 10);

  const margin = { top: 15, right: labelWidth + 15, bottom: 35, left: 55 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const g = d3svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

  const series = selectedCountries.map((code) => {
    const country = data.countries.find(c => c.code === code);
    return {
      code,
      name: country.name,
      color: getCountryColor(code),
      values: data.years.map(year => ({
        year,
        value: country.data[year] || null,
        isProjection: year > currentYear
      })).filter(d => d.value !== null && d.value > 0)
    };
  });

  const allValues = series.flatMap(s => s.values.map(v => v.value));
  const x = d3.scaleLinear().domain(d3.extent(data.years)).range([0, innerWidth]);
  const y = d3.scaleLinear().domain([0, d3.max(allValues) * 1.1]).range([innerHeight, 0]);

  // Axes
  g.append('g')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(6))
    .selectAll('text').style('font-size', '11px').style('fill', '#666');

  g.append('g')
    .call(d3.axisLeft(y).tickFormat(d => '$' + d3.format(',.0f')(d)).ticks(6))
    .selectAll('text').style('font-size', '11px').style('fill', '#666');

  // Grid
  g.append('g').selectAll('line').data(y.ticks(6)).join('line')
    .attr('x1', 0).attr('x2', innerWidth)
    .attr('y1', d => y(d)).attr('y2', d => y(d))
    .attr('stroke', '#e0e0e0').attr('stroke-dasharray', '3,3');

  const line = d3.line().x(d => x(d.year)).y(d => y(d.value)).defined(d => d.value !== null);

  // Label positions
  const labelPositions = series.map(s => {
    const lastValue = s.values[s.values.length - 1];
    return { code: s.code, name: s.name, color: s.color, y: lastValue ? y(lastValue.value) : 0, originalY: lastValue ? y(lastValue.value) : 0 };
  }).sort((a, b) => a.y - b.y);

  const minGap = 14;
  const maxY = innerHeight - 15;
  // First pass: push labels down
  for (let i = 1; i < labelPositions.length; i++) {
    if (labelPositions[i].y - labelPositions[i - 1].y < minGap) {
      labelPositions[i].y = labelPositions[i - 1].y + minGap;
    }
  }
  // Second pass: if labels exceed maxY, push them up
  for (let i = labelPositions.length - 1; i >= 0; i--) {
    if (labelPositions[i].y > maxY) {
      labelPositions[i].y = maxY;
    }
    if (i > 0 && labelPositions[i].y - labelPositions[i - 1].y < minGap) {
      labelPositions[i - 1].y = labelPositions[i].y - minGap;
    }
  }

  // Draw lines
  series.forEach(s => {
    const historical = s.values.filter(d => !d.isProjection);
    if (historical.length > 0) {
      g.append('path').datum(historical)
        .attr('fill', 'none').attr('stroke', s.color).attr('stroke-width', 2).attr('d', line);
    }

    const projection = s.values.filter(d => d.isProjection);
    const lastHistorical = historical[historical.length - 1];
    if (projection.length > 0 && lastHistorical) {
      g.append('path').datum([lastHistorical, ...projection])
        .attr('fill', 'none').attr('stroke', s.color).attr('stroke-width', 2)
        .attr('stroke-dasharray', '1,3').attr('stroke-linecap', 'round').attr('d', line);
    }
  });

  // Labels
  labelPositions.forEach(lp => {
    const xEnd = innerWidth;
    const xLabel = xEnd + 10;

    if (Math.abs(lp.y - lp.originalY) > 3) {
      g.append('path')
        .attr('d', `M${xEnd},${lp.originalY} L${xEnd + 5},${lp.originalY} L${xEnd + 5},${lp.y} L${xLabel - 3},${lp.y}`)
        .attr('stroke', '#aaa').attr('stroke-width', 1).attr('fill', 'none');
    }

    g.append('text')
      .attr('x', xLabel).attr('y', lp.y).attr('dy', '0.35em')
      .attr('fill', lp.color).attr('font-size', '11px').attr('font-weight', '500')
      .attr('font-family', '-apple-system, BlinkMacSystemFont, sans-serif')
      .text(lp.name);
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function downloadJSON() {
  // Download ALL data, not just selected countries
  const exportData = {
    source: data.source,
    indicator: data.indicator,
    retrieved: data.updated,
    years: data.years,
    countries: data.countries.map(c => ({
      code: c.code,
      name: c.name,
      data: c.data
    }))
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  link.download = `gdp-per-capita_${date}.json`;
  link.href = URL.createObjectURL(blob);
  link.click();
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('active');
  setTimeout(() => toast.classList.remove('active'), 2000);
}

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => { if (data) renderChart(); }, 100);
});

window.addEventListener('popstate', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlCountries = urlParams.get('country');
  selectedCountries = urlCountries ? urlCountries.split('~').filter(code => data.countries.find(c => c.code === code)) : [];
  renderCountryList();
  renderChart();
  updateSelectedCount();
});

init();
