
var query_overpass = require('query-overpass');
var turf = require('turf');
var fc = require('turf-featurecollection');

module.exports = function(id, callback) {
  query_overpass('[out:json];relation('+id+');>;out;', function(error, data){
    if(!error){
      linestringArray = [];
      pointPolygon = [];

      data.features.forEach(function(entry) {
        if(entry.geometry.type == 'LineString'){
          linestringArray.push(entry.geometry.coordinates);
        }
      });

      var n = linestringArray.length;
      var igeo = 0;

      for (var i = 0; i < n; i++) {
        if(!pointPolygon[igeo]){
          pointPolygon[igeo] = linestringArray[igeo];
          linestringArray.splice(0,1);
        }
        var pointtofind = pointPolygon[igeo][pointPolygon[igeo].length-1];
        linestringArray.forEach(function(entry,index) {
          if(entry[0][0] == pointtofind[0] && entry[0][1] == pointtofind[1]){
            var arraytoadd = entry;
            arraytoadd.splice(0,1);
            pointPolygon[igeo] = pointPolygon[igeo].concat(arraytoadd);
            linestringArray.splice(index,1);
          }
          if(entry[entry.length-1][0] == pointtofind[0] && entry[entry.length-1][1] == pointtofind[1]){
            var arraytoadd = entry.reverse();
            arraytoadd.splice(0,1);
            pointPolygon[igeo] = pointPolygon[igeo].concat(arraytoadd);
            linestringArray.splice(index,1);
          }
        });
        if(
          pointPolygon[igeo][0][0] == pointPolygon[igeo][pointPolygon[igeo].length-1][0]
          && pointPolygon[igeo][0][1] == pointPolygon[igeo][pointPolygon[igeo].length-1][1]
          && linestringArray.length != 0
        ){
          igeo++;
        }
      }

      if(linestringArray.length == 0){
        try {
          var poly1 = turf.polygon(pointPolygon);
          var poly2 = turf.polygon(pointPolygon, {bbox:turf.bbox(poly1)});
          callback(fc([poly2]));
        }
        catch (e) {
           callback(false);
        }
      }else{
        callback(false);
      }
    }else{
      callback(false);
    }

  }, {flatProperties:true});
};
