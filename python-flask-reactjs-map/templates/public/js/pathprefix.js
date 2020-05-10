
var _initialPathNamePrefix = null;

function setPathNamePrefix(prefix) {
    
    _initialPathNamePrefix = prefix;
}

function getPathNamePrefix() {

    return _initialPathNamePrefix
        && _initialPathNamePrefix.length > 0
        && _initialPathNamePrefix !== '/'

        ? _initialPathNamePrefix
        : '';
}

