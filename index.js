
var query_overpass = require('query-overpass');
var turf = require('turf');
var fc = require('turf-featurecollection');

module.exports = function(id) {
  query_overpass('[out:json];relation('+id+');>;out;', function(error, data){
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

    /*pointPolygon.forEach(function(polygon,index) {
      if(polygon[0][0] != polygon[polygon.length-1][0] || polygon[0][1] != polygon[polygon.length-1][1]){
        pointPolygon[index].push(pointPolygon[index][0]);
      }
    });*/

    if(linestringArray.length == 0){
      try {
        return fc([turf.polygon(pointPolygon)]));
      }
      catch (e) {
         return false;
      }
    }else{
      return false;
    }

  }, {flatProperties:true});
};
