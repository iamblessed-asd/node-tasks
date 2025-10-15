import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

const width = 1200;
const height = 400;
const canvasRenderService = new ChartJSNodeCanvas({ width, height });

export async function createTempChartDataUrl(labels: string[], data: number[], title = 'Температура') {
  const buffer = await renderChart(labels, data, title);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

export async function createTempChartBuffer(labels: string[], data: number[], title = 'Температура') {
  return renderChart(labels, data, title);
}

async function renderChart(labels: string[], data: number[], title: string) {
  const configuration = {
    type: 'line' as const,
    data: {
      labels,
      datasets: [{ label: '°C', data, borderWidth: 2, tension: 0.2 }]
    },
    options: {
      plugins: { title: { display: true, text: title } },
      scales: {
        x: { title: { display: true, text: 'ч.' } },
        y: { title: { display: true, text: '°C' } }
      }
    }
  };
  return await canvasRenderService.renderToBuffer(configuration);
}
