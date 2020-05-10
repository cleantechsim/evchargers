
/*
   Ensures that if user quickly moves or zooms the map multiple times,
   old responses are ignored and one runs the query again.
*/

export type OnResponse = (data: any) => void;
export type PerformQuery = (r: OnResponse) => void;

export class RESTQueryCaller {

    private requestSequenceNo: number;

    constructor() {
        this.requestSequenceNo = 0;
    }
    

    public callQuery(performQuery: PerformQuery, onresponse: OnResponse) {

        const sequenceNo: number = ++ this.requestSequenceNo;

        this._callQuery(performQuery, onresponse, sequenceNo);
    }

    private _callQuery(
        performQuery : PerformQuery, 
        onresponse: OnResponse,
        sequenceNo: number) {

        performQuery(
            (responseData: any) => {

                if (sequenceNo < this.requestSequenceNo) {
                    // Expired request, new ones sent
                }
                else {
                    if (onresponse) {
                        onresponse(responseData);
                    }
                }
            });

    }
}
