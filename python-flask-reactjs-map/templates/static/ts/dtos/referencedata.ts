
export class ReferenceData {

    ChargerTypes: ReferenceChargerType[];
    
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
