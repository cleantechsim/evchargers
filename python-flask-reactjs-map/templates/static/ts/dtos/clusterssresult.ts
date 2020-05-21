import { Range } from "../range";


export class ClustersResult {

    points: MarkerPos[];
    operators: Operator[];
    kw_min_max: Range;    
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
