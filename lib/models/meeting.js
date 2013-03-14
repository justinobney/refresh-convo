var Meeting = function ( db, properties ) {
    var _ClassName = "Meeting";
    var _Kaiseki = db;

    var _Properties = {
        name: '',
        date: '',
        topic: ''
    };

    //check for properties sent in..
    if (properties) {
        for (var prop in properties) {
            _Properties[prop] = properties[prop];
        }
    }

    function Save( cb ){
        _Kaiseki.createObject(_ClassName, _Properties, function(err, res, body, success) {
            if (success) {
                _Properties = body;
                cb();
            } else {
                throw new Error('Error saving ' + _ClassName + ' ::: ' + JSON.stringify(body));
            }
        });
    }

    function Get( key ){
        if (_Properties[key] !== null && typeof _Properties[key] !== 'undefined') {
            return _Properties[key];
        } else {
            throw new Error('Property does not exist');
        }
    }

    function Set( key, value ){
        _Properties[key] = value;
    }

    // RETURN the functions & variables that need to be exposed.
    return {
        save: Save,
        get: Get,
        set: Set
    };
};

// By attaching a create method to the function and forcing a closue
// I am further making sure my private variables don't get contaminated
Meeting.create = function( db, properties ){
    var newMeeting = Meeting(db, properties); // Pass in dependancies();
    return newMeeting;
};

module.exports = Meeting;
