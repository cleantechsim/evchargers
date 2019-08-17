
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

    constructor(label: string, data: number[]) {
        this.label = label;
        this.data = data;
    }

    label: string;
    data: number[];
}
