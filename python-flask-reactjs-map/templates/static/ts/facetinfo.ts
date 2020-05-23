
import { Operator, ConnectionType } from './dtos/clusterssresult';

export class NamedOperator extends Operator {

    name: string;
}

export class NamedConnectionType extends ConnectionType {
    
    name: string;
}
