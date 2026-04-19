const jsonInput = document.getElementById('jsonInput');
const loadDataBtn = document.getElementById('loadDataBtn');
const renderBtn = document.getElementById('renderBtn');
const formatBtn = document.getElementById('formatBtn');
const errorBox = document.getElementById('errorBox');
const totalLeadsEl = document.getElementById('totalLeads');
const qualifiedLeadsEl = document.getElementById('qualifiedLeads');
const wonLeadsEl = document.getElementById('wonLeads');
const conversionRateEl = document.getElementById('conversionRate');
const pipelineValueEl = document.getElementById('pipelineValue');
const leadTableBody = document.getElementById('leadTableBody');

let statusChart;
let sourceChart;
let valueChart;

function normalizeLeads(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && Array.isArray(payload.leads)) {
    return payload.leads;
  }
  throw new Error('JSON must be an array of leads or an object with a "leads" array.');
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function countBy(leads, key) {
  return leads.reduce((acc, lead) => {
    const group = lead[key] ?? 'Unknown';
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

function groupValueByMonth(leads) {
  return leads.reduce((acc, lead) => {
    const rawDate = typeof lead.createdAt === 'string' ? lead.createdAt : '';
    const month = rawDate.length >= 7 ? rawDate.slice(0, 7) : 'Unknown';
    acc[month] = (acc[month] || 0) + toNumber(lead.value);
    return acc;
  }, {});
}

function renderCards(leads) {
  const total = leads.length;
  const qualified = leads.filter((lead) => String(lead.status).toLowerCase() === 'qualified').length;
  const won = leads.filter((lead) => String(lead.status).toLowerCase() === 'won').length;
  const conversion = total ? ((won / total) * 100).toFixed(1) : '0.0';
  const value = leads.reduce((sum, lead) => sum + toNumber(lead.value), 0);

  totalLeadsEl.textContent = total;
  qualifiedLeadsEl.textContent = qualified;
  wonLeadsEl.textContent = won;
  conversionRateEl.textContent = `${conversion}%`;
  pipelineValueEl.textContent = formatCurrency(value);
}

function renderCharts(leads) {
  const statusCounts = countBy(leads, 'status');
  const sourceCounts = countBy(leads, 'source');
  const monthlyValues = groupValueByMonth(leads);

  if (statusChart) statusChart.destroy();
  if (sourceChart) sourceChart.destroy();
  if (valueChart) valueChart.destroy();

  statusChart = new Chart(document.getElementById('statusChart'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: ['#2563eb', '#0ea5e9', '#16a34a', '#f97316', '#e11d48', '#7c3aed']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });

  sourceChart = new Chart(document.getElementById('sourceChart'), {
    type: 'bar',
    data: {
      labels: Object.keys(sourceCounts),
      datasets: [{
        label: 'Leads',
        data: Object.values(sourceCounts),
        backgroundColor: '#2563eb'
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      plugins: { legend: { display: false } }
    }
  });

  valueChart = new Chart(document.getElementById('valueChart'), {
    type: 'line',
    data: {
      labels: Object.keys(monthlyValues),
      datasets: [{
        label: 'Pipeline Value',
        data: Object.values(monthlyValues),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.15)',
        fill: true,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback(value) {
              return formatCurrency(Number(value));
            }
          }
        }
      }
    }
  });
}

function renderTable(leads) {
  leadTableBody.innerHTML = '';
  leads.forEach((lead) => {
    const tr = document.createElement('tr');

    const cells = [
      lead.id ?? '-',
      lead.name ?? '-',
      lead.source ?? '-',
      lead.status ?? '-',
      lead.owner ?? '-',
      formatCurrency(toNumber(lead.value)),
      lead.createdAt ?? '-'
    ];

    cells.forEach((value) => {
      const td = document.createElement('td');
      td.textContent = String(value);
      tr.appendChild(td);
    });

    leadTableBody.appendChild(tr);
  });
}

function renderDashboard(payload) {
  const leads = normalizeLeads(payload);
  renderCards(leads);
  renderCharts(leads);
  renderTable(leads);
}

async function loadJsonFromPath(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Unable to load JSON file at "${path}" (HTTP ${response.status}).`);
  }
  return response.json();
}

async function loadDefaultJson() {
  errorBox.textContent = '';
  try {
    const payload = await loadJsonFromPath('./data/leads.json');
    jsonInput.value = JSON.stringify(payload, null, 2);
    renderDashboard(payload);
  } catch (error) {
    errorBox.textContent = error.message;
  }
}

function renderFromInput() {
  errorBox.textContent = '';
  try {
    const payload = JSON.parse(jsonInput.value);
    renderDashboard(payload);
  } catch (error) {
    errorBox.textContent = `Invalid JSON input:\n${error.message}`;
  }
}

function formatInputJson() {
  errorBox.textContent = '';
  try {
    const payload = JSON.parse(jsonInput.value);
    jsonInput.value = JSON.stringify(payload, null, 2);
  } catch (error) {
    errorBox.textContent = `Cannot format invalid JSON:\n${error.message}`;
  }
}

loadDataBtn.addEventListener('click', loadDefaultJson);
renderBtn.addEventListener('click', renderFromInput);
formatBtn.addEventListener('click', formatInputJson);

loadDefaultJson();
