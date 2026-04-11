// public/script.js (Bad game version, reusable with Good game)
// Morality pointer behavior:
// - Uses the SAME angle mapping as Good game: angle = Math.PI * (value / 3 - 0.675)
// - Pointer is clamped to [1, 3] so it saturates:
//   * value < 1 => stays at 1 position
//   * value > 3 => stays at 3 position
// Text display stays as server value
// Credibility meter logic unchanged

let credibilityChart, moralityChart;

document.addEventListener('DOMContentLoaded', function () {
  initializeVisuals();
});

function initializeVisuals() {
  // 1) Morality Gauge
  const moralityCanvas = document.getElementById('moralityGauge');
  if (moralityCanvas) {
    const moralityCtx = moralityCanvas.getContext('2d');
    moralityChart = new Chart(moralityCtx, createGaugeOptions('#27ae60'));

    // wait for chart render then draw pointer
    setTimeout(() => {
      const initialMoralityRaw = document.getElementById('morality')?.textContent;
      const initialMorality = safeParseInt(initialMoralityRaw, 0);
      updateMoralityGauge(initialMorality);
    }, 100);
  }

  // 2) Credibility Meter
  const initialCredibilityRaw = document.getElementById('credibility')?.textContent;
  const initialCredibility = safeParseInt(initialCredibilityRaw, 0);
  updateCredibilityMeter(initialCredibility);
}

// Safe parse int helper
function safeParseInt(raw, fallback = 0) {
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

// Gauge background (unchanged)
function createGaugeOptions(color) {
  return {
    type: 'doughnut',
    data: {
      datasets: [
        {
          data: [1, 2],
          backgroundColor: ['#e74c3c', '#bdc3c7'],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      circumference: 180,
      rotation: 270,
      cutout: '75%',
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      events: []
    }
  };
}

// Draw morality pointer (Good-game angle mapping + saturation clamp)
function drawPointer(chart, value) {
  if (!chart || !chart.ctx || !chart.canvas || !chart.chartArea) return;

  const { ctx, chartArea } = chart;
  const centerX = (chartArea.left + chartArea.right) / 2;
  const centerY = chartArea.bottom - 37;
  const radius =
    Math.min(
      chartArea.right - chartArea.left,
      chartArea.bottom - chartArea.top
    ) /
    2 *
    0.8;

  // ✅ Saturate pointer to 1~3 (so it can "stick" at ends)
  const v = Math.min(Math.max(value, 1), 3);

  // ✅ SAME AS GOOD GAME (0~3 mapping style, but we clamp to 1~3 first)
  const angle = Math.PI * (v / 3 - 0.675);

  // clear + redraw gauge
  ctx.clearRect(0, 0, chart.canvas.width, chart.canvas.height);
  chart.draw();

  // draw pointer
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(-3, 0);
  ctx.lineTo(3, 0);
  ctx.lineTo(0, -radius);
  ctx.closePath();
  ctx.fillStyle = '#000000';
  ctx.fill();
  ctx.restore();
}

// Credibility Meter
function updateCredibilityMeter(value) {
  const meterFill = document.getElementById('credibilityMeterFill');
  const credibilitySpan = document.getElementById('credibility');
  if (!meterFill || !credibilitySpan) return;

  credibilitySpan.textContent = value;

  // Bad game: per question max 200, total 18 questions => 3600
  const maxScore = 3600;

  let percentage = (value / maxScore) * 100;
  percentage = Math.min(Math.max(percentage, 0), 100);
  meterFill.style.width = percentage + '%';
}

// Update morality UI
function updateMoralityGauge(value) {
  const moralitySpan = document.getElementById('morality');

  // Text display stays as server value (no clamp for text)
  if (moralitySpan) moralitySpan.textContent = value;

  requestAnimationFrame(() => {
    drawPointer(moralityChart, value); // pointer is clamped inside drawPointer()
  });
}

// Perform action
async function performAction(action) {
  const contextElement = document.querySelector('.context');
  const optionsElement = document.querySelector('.options');
  const contextText = document.querySelector('.context p');

  try {
    const response = await fetch('/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });

    const data = await response.json();

    // fail => redirect
    if (data.failed) {
      alert(data.message);
      window.location.href = data.redirect;
      return;
    }

    if (data.state) {
      updateCredibilityMeter(safeParseInt(data.state.credibility, 0));
      updateMoralityGauge(safeParseInt(data.state.morality, 0));

      if (contextElement) contextElement.classList.add('fade-out');
      if (optionsElement) optionsElement.classList.add('fade-out');

      setTimeout(() => {
        if (contextText) contextText.textContent = data.context || '...';

        const shuffledChoices = [...(data.choices || [])].sort(
          () => Math.random() - 0.5
        );

        if (optionsElement) {
          optionsElement.innerHTML = shuffledChoices
            .map(
              choice =>
                `<button type="button" onclick="performAction('${choice.index}')">${choice.text}</button>`
            )
            .join('');
        }

        if (contextElement) contextElement.classList.remove('fade-out');
        if (optionsElement) optionsElement.classList.remove('fade-out');
      }, 500);
    }

    // Finish badge
    if (data.state && safeParseInt(data.state.actionCount, 0) >= 3) {
      window.location.href = '/win';
    }
  } catch (error) {
    console.error('Error performing action:', error);
  }
}
