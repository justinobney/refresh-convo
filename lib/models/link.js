var Link = function ( db, properties ) {
    var _ClassName = "Link";
    var _Kaiseki = db;

    var _Properties = {
        title: '',
        url: '',
        imageUrl: 'https://dl.dropbox.com/u/2857953/img/website_default.png',
        description: '',
        userId: '',
        userName: '',
        meetingId: ''
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

    function ToJSON(){
        return JSON.stringify(_Properties);
    }

    // RETURN the functions & variables that need to be exposed.
    return {
        save: Save,
        get: Get,
        set: Set,
        toJSON: ToJSON
    };
};

// By attaching a create method to the function and forcing a closue
// I am further making sure my private variables don't get contaminated
Link.create = function( db, properties ){
    var newLink = Link(db, properties); // Pass in dependancies();
    return newLink;
};

module.exports = Link;
