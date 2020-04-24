
/*
   Ensures that if user quickly moves or zooms the map multiple times,
   old responses are ignored and one runs the query again.
*/

function RESTQueryCaller() {

    this._requestSequenceNo = 0;
}

RESTQueryCaller.prototype.callQuery = function(performQuery, onresponse) {

    var sequenceNo = ++ this._requestSequenceNo;

    this._callQuery(performQuery, onresponse, sequenceNo);
}

RESTQueryCaller.prototype._callQuery = function(performQuery, onresponse, sequenceNo) {

    performQuery(
        responseData => {

            if (sequenceNo < this._requestSequenceNo) {
                // Expired request, new ones sent
            }
            else {
                if (onresponse) {
                    onresponse(responseData);
                }
            }
        });
}
