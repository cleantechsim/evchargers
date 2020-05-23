import { Range } from "../range";


export class ClustersResult {

    points: MarkerPos[];
    operators: Operator[];
    connection_types: ConnectionType[];
    kw_min_max: Range;
}

export class Operator {
    id: number;
    count: number;
}

export class ConnectionType {
    id: number;
    count: number;
}

export class MarkerPos {
    latitude: number;
    longitude: number;
    count: number;
}
