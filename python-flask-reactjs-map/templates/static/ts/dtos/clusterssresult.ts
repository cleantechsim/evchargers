

export class ClustersResult {

    points: MarkerPos[];
    operators: Operator[];
}

export class Operator {
    id: string;
    count: number;
}

export class MarkerPos {
    latitude: number;
    longitude: number;
    count: number;
}
