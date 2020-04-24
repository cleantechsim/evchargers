
/*
Ensures that if user quickly moves or zooms the map multiple times,
old responses are ignored and one runs the query again.

*/

function RESTQueryCaller() {

    this.requestSequenceNo = 0;
}

RESTQueryCaller.prototype.callQuery = function(performQuery, onresponse, onfinally) {

    this._callQuery(performQuery, onresponse, onfinally, ++ this._requestSequenceNo);
}

RESTQueryCaller.prototype._callQuery = function(performQuery, onresponse, onfinally, sequenceNo) {

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
        },
        () => {
            // finally
            if (onfinally) {
                onfinally();
            }
        });

}
