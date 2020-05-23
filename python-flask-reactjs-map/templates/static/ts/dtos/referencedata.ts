
export class ReferenceData {

    ChargerTypes: ReferenceChargerType[];

    ConnectionTypes: ReferenceConnectionType[];
    
    Operators: ReferenceOperator[];
}

export class ReferenceChargerType {
    Comments: string;
    IsFastChargeCapable: boolean;
    ID: number;
    Title: string;
}

export class ReferenceOperator {

    WebSiteURL: string;
    ID: number;
    Title: string;
}

export class ReferenceConnectionType {

    FormalName: string;
    IsDiscontinued: boolean;
    IsObsolete: boolean;
    ID: number;
    Title: string;
}
