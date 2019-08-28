import { Color } from './color.util';

// Chart JS datatypes
export class ChartJS {

    type: string;

    data: ChartJSData;
}

export class ChartJSData {

    constructor(labels: string[], datasets: ChartJSDataset[]) {
        this.labels = labels;
        this.datasets = datasets;
    }

    labels: string[];
    datasets: ChartJSDataset[];
}

export class ChartJSDataset {

    constructor(private l: string, private c: Color, private d: number[]) {
    }

    get label(): string {
        return this.l;
    }

    get color(): Color {
        return this.c;
    }

    get data(): number[] {
        return this.d;
    }
}
