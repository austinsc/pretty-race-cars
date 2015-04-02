var async = require('async');
var _ = require('lodash');
var xray = require('x-ray');
var raven = require('ravenjs');
raven.connectionString('Url=http://raven-17b05tsu.cloudapp.net:8080;Database=RaceCars;');

xray('http://www.race-cars.com/carsales/complist.htm')
  .select([{
      $root: 'tr',
      title: 'a b',
      link: 'a[href]',
      description: 'td'
  }])
  .run(function(err, array){
    async.each(array, function(item, next){
      if(!item.title || item.title.indexOf('SEARCH') === 0) {
        next();
      } else {
        var client = raven.connect();
        item.desc = item.description.split('\n').filter(function (x) {
          return x.replace(/\s/, '').length;
        });
        var offset = item.desc[0].indexOf(item.title);
        item.link = item.link.replace('/complist.htm', '');
        item.description = item.desc[1 + offset];
        item.price = item.desc[2 + offset];
        item.id = item.link.replace('http://www.race-cars.com/carsales/', '');
        item.year = item.title.slice(0, 4);
        item.category = item.id.slice(0, item.id.indexOf('/'))
        var segment = item.id.slice(item.id.indexOf('/') + 1);
        item.id = segment.slice(0, segment.indexOf('/'));

        xray(item.link)
          .select([{
            
          }])
          .run(function(childErr, childArr){
            client.save(item, function () {
              console.log(item);
              next();
            });
          });
      }
    }).then()
  });

