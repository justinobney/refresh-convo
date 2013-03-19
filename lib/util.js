global.moment = require('moment');


moment().format();

moment.lang('en', {
    relativeTime : {
        future: "in %s",
        past:   "%s ago",
        s:  "seconds",
        m:  "a minute",
        mm: "%d minutes",
        h:  "an hour",
        hh: "%d hours",
        d:  "a day",
        dd: "%d days",
        M:  "a month",
        MM: "%d months",
        y:  "a year",
        yy: "%d years"
    }
});

moment.fn.twitter = function () {
  var diff = moment().diff(this, 'seconds');
  return diff < 60 ? diff + 's' :
    diff < 3600 ? ~~(diff / 60) + ' min' :
    diff < 86400 ? ~~(diff / 3600) + ' hr' : this.format('D MMM');
};
