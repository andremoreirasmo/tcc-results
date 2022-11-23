import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexStroke,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexYAxis,
  ChartComponent,
} from 'ng-apexcharts';

type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  markers: ApexMarkers;
  tooltip: any; // ApexTooltip;
  grid: ApexGrid;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
};

interface ResultCSV {
  date: string;
  open: string;
  high: string;
  low: string;
  close: string;
  adjclose: string;
  volume: string;
  ticker: string;
  adjclose_1: number;
  true_adjclose_1: number;
  buy_profit: string;
  sell_profit: '0.042548179626464844\r';
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('chartAmer3') chartAmer3?: ChartComponent;
  dataAmer3: [ApexAxisChartSeries, ApexXAxis, number] = [[], {}, 0];

  @ViewChild('chartPbr') chartPbr?: ChartComponent;
  dataPbr: [ApexAxisChartSeries, ApexXAxis, number] = [[], {}, 0];

  @ViewChild('chartMglu') chartMglu?: ChartComponent;
  dataMglu: [ApexAxisChartSeries, ApexXAxis, number] = [[], {}, 0];

  chartOptions: ChartOptions;

  constructor(private http: HttpClient) {
    this.chartOptions = {
      series: [],
      chart: {
        height: 350,
        type: 'line',
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 5,
        curve: 'straight',
        dashArray: [0, 8, 5],
      },
      title: {
        text: 'AMER3.SA',
        align: 'left',
      },
      legend: {},
      markers: {
        size: 0,
        hover: {
          sizeOffset: 6,
        },
      },
      xaxis: {
        labels: {
          trim: false,
        },
        categories: [],
      },
      tooltip: {
        y: {
          formatter: (_val: number, opts: any) => {
            const real = opts.series[1][opts.dataPointIndex];
            const estimado = opts.series[0][opts.dataPointIndex];
            const erro =
              Math.round(this.getErroPercentual(estimado, real) * 100) / 100;
            return `Valor real: ${real}<br>Valor Estimado:${estimado} <br>Erro percentual: ${erro}`;
          },
        },
      },
      grid: {
        borderColor: '#f1f1f1',
      },
    };
  }

  private getErroPercentual(value: number, trueValue: number) {
    const diff = Math.abs(value - trueValue);

    return (diff / trueValue) * 100;
  }

  private csvJSON(csv: string) {
    const lines = csv.replaceAll('\r', '').split('\n');
    const result = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i]) continue;
      const obj: any = {};
      const currentline = lines[i].split(',');

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }
      result.push(obj);
    }
    return result;
  }

  private loadData(csv: ResultCSV[]): [ApexAxisChartSeries, ApexXAxis, number] {
    const trueValue = csv.map((e) => Math.round(e.true_adjclose_1 * 100) / 100);
    const predictValue = csv.map((e) => Math.round(e.adjclose_1 * 100) / 100);

    const series = [
      {
        name: `${csv[0].ticker} Valor real`,
        data: trueValue,
      },
      {
        name: `${csv[0].ticker} Valor estimado`,
        data: predictValue,
      },
    ];

    const categories = csv.map((e) => e.date);
    const errosPercentuais = trueValue.map((e, i) =>
      this.getErroPercentual(e, predictValue[i])
    );

    const erroPercentual =
      errosPercentuais.reduce((p, c) => p + c) / errosPercentuais.length;

    return [
      series,
      {
        categories,
      },
      Math.round(erroPercentual * 100) / 100,
    ];
  }

  ngOnInit(): void {
    this.http
      .get('assets/AMER3.SA.csv', { responseType: 'text' })
      .subscribe((data: any) => {
        const csv: ResultCSV[] = this.csvJSON(data);

        this.dataAmer3 = this.loadData(csv);
        const [_, xaxis] = this.dataAmer3;

        this.chartAmer3?.updateOptions({
          xaxis,
        });
      });

    this.http
      .get('assets/PBR.csv', { responseType: 'text' })
      .subscribe((data: any) => {
        const csv: ResultCSV[] = this.csvJSON(data);

        this.dataPbr = this.loadData(csv);
        const [_, xaxis] = this.dataPbr;

        this.chartPbr?.updateOptions({
          xaxis,
        });
      });

    this.http
      .get('assets/MGLU3.SA.csv', { responseType: 'text' })
      .subscribe((data: any) => {
        const csv: ResultCSV[] = this.csvJSON(data);

        this.dataMglu = this.loadData(csv);
        const [_, xaxis] = this.dataMglu;

        this.chartMglu?.updateOptions({
          xaxis,
        });
      });
  }
}
