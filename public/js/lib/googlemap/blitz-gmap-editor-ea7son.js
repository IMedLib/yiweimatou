
var BlitzMap =new function(){
    var mapOverlays=[];

	function mapToObject(){
        var tmpMap = {};
        var tmpOverlay, paths;
        // tmpMap.zoom = map.getZoom();
        // tmpMap.tilt = map.getTilt();
        // tmpMap.mapTypeId = map.getMapTypeId();
        // tmpMap.center = { lat: map.getCenter().lat(), lng: map.getCenter().lng() };
        tmpMap.overlays = [];
        for( var i=0; i < mapOverlays.length; i++ ){
            if( mapOverlays[i].getMap() == null ){
                continue;
            }
            tmpOverlay = {};
            tmpOverlay.type = mapOverlays[i].type;
            tmpOverlay.title = mapOverlays[i].title;
            tmpOverlay.content = mapOverlays[i].content;
            tmpOverlay.group = mapOverlays[i].group || "未分组";
            tmpOverlay.uid = mapOverlays[i].uid;
            tmpOverlay.id = mapOverlays[i].id || getUniqueId();

            if( mapOverlays[i].fillColor ){
                tmpOverlay.fillColor = mapOverlays[i].fillColor;
            }

            if( mapOverlays[i].fillOpacity ){
                tmpOverlay.fillOpacity = mapOverlays[i].fillOpacity;
            }

            if( mapOverlays[i].strokeColor ){
                tmpOverlay.strokeColor = mapOverlays[i].strokeColor;
            }

            if( mapOverlays[i].strokeOpacity ){
                tmpOverlay.strokeOpacity = mapOverlays[i].strokeOpacity;
            }

            if( mapOverlays[i].strokeWeight ){
                tmpOverlay.strokeWeight = mapOverlays[i].strokeWeight;
            }

             if( mapOverlays[i].icon ){
                 tmpOverlay.icon = mapOverlays[i].icon;
             }

            if( mapOverlays[i].flat ){
                tmpOverlay.flat = mapOverlays[i].flat;
            }

            if( mapOverlays[i].type == "polygon" ){
                tmpOverlay.paths = [];
                paths = mapOverlays[i].getPaths();
                for( var j=0; j < paths.length; j++ ){
                    tmpOverlay.paths[j] = [];
                    for( var k=0; k < paths.getAt(j).length; k++ ){
                        tmpOverlay.paths[j][k] = { lat: paths.getAt(j).getAt(k).lat().toString() , lng: paths.getAt(j).getAt(k).lng().toString() };
                    }
                }

            }else if( mapOverlays[i].type == "polyline" ){
                tmpOverlay.path = [];
                path = mapOverlays[i].getPath();
                for( var j=0; j < path.length; j++ ){
                    tmpOverlay.path[j] = { lat: path.getAt(j).lat().toString() , lng: path.getAt(j).lng().toString() };
                }

            }else if( mapOverlays[i].type == "circle" ){
                tmpOverlay.center = { lat: mapOverlays[i].getCenter().lat(), lng: mapOverlays[i].getCenter().lng() };
                tmpOverlay.radius = mapOverlays[i].radius;
            }else if( mapOverlays[i].type == "rectangle" ){
                tmpOverlay.bounds = {  sw: {lat: mapOverlays[i].getBounds().getSouthWest().lat(), lng: mapOverlays[i].getBounds().getSouthWest().lng()},
                    ne:     {lat: mapOverlays[i].getBounds().getNorthEast().lat(), lng: mapOverlays[i].getBounds().getNorthEast().lng()}
                };
            }else if( mapOverlays[i].type == "marker" ){
                tmpOverlay.position = { lat: mapOverlays[i].getPosition().lat(), lng: mapOverlays[i].getPosition().lng() };
            }
            tmpMap.overlays.push( tmpOverlay );
        }

        return tmpMap;

    }
    this.setMapData=function( map,isEditable,jsonString){
        if( typeof jsonString == 'undefined' || jsonString.length == 0 ){
            return false;
        }
        var inputData = JSON.parse( jsonString );
        // if( inputData.zoom ){
        //     map.setZoom( inputData.zoom );
        // }else{
        //     map.setZoom( 10 );
        // }

        // if( inputData.tilt ){
        //     map.setTilt( inputData.tilt );
        // }else{
        //     map.setTilt( 0 );
        // }

        // if( inputData.mapTypeId ){
        //     map.setMapTypeId( inputData.mapTypeId );
        // }else{
        //     map.setMapTypeId( "hybrid" );
        // }

        // if( inputData.center ){
        //     map.setCenter( new google.maps.LatLng( inputData.center.lat, inputData.center.lng ) );
        // }else{
        //     map.setCenter( new google.maps.LatLng( 19.006295, 73.309021 ) );
        // }



        var tmpOverlay, ovrOptions;
        var properties = ['fillColor', 'fillOpacity', 'strokeColor', 'strokeOpacity','strokeWeight', 'icon'];
        for( var m = inputData.overlays.length-1; m >= 0; m-- ){
            ovrOptions = {};

            for( var x=properties.length; x>=0; x-- ){
                if( inputData.overlays[m][ properties[x] ] ){
                    ovrOptions[ properties[x] ] = inputData.overlays[m][ properties[x] ];
                }
            }


            if( inputData.overlays[m].type == "polygon" ){

                var tmpPaths = [];
                for( var n=0; n < inputData.overlays[m].paths.length; n++ ){

                    var tmpPath = [];
                    for( var p=0; p < inputData.overlays[m].paths[n].length; p++ ){
                        tmpPath.push(  new google.maps.LatLng( inputData.overlays[m].paths[n][p].lat, inputData.overlays[m].paths[n][p].lng ) );
                    }
                    tmpPaths.push( tmpPath );
                }
                ovrOptions.paths = tmpPaths;
                tmpOverlay = new google.maps.Polygon( ovrOptions );

            }else if( inputData.overlays[m].type == "polyline" ){

                var tmpPath = [];
                for( var p=0; p < inputData.overlays[m].path.length; p++ ){
                    tmpPath.push(  new google.maps.LatLng( inputData.overlays[m].path[p].lat, inputData.overlays[m].path[p].lng ) );
                }
                ovrOptions.path = tmpPath;
                tmpOverlay = new google.maps.Polyline( ovrOptions );

            }else if( inputData.overlays[m].type == "rectangle" ){
                var tmpBounds = new google.maps.LatLngBounds(
                    new google.maps.LatLng( inputData.overlays[m].bounds.sw.lat, inputData.overlays[m].bounds.sw.lng ),
                    new google.maps.LatLng( inputData.overlays[m].bounds.ne.lat, inputData.overlays[m].bounds.ne.lng ) );
                ovrOptions.bounds = tmpBounds;
                tmpOverlay = new google.maps.Rectangle( ovrOptions );

            }else if( inputData.overlays[m].type == "circle" ){
                var cntr = new google.maps.LatLng( inputData.overlays[m].center.lat, inputData.overlays[m].center.lng );
                ovrOptions.center = cntr;
                ovrOptions.radius = inputData.overlays[m].radius;
                tmpOverlay = new google.maps.Circle( ovrOptions );

            }else if( inputData.overlays[m].type == "marker" ){
                var pos = new google.maps.LatLng( inputData.overlays[m].position.lat, inputData.overlays[m].position.lng );
                ovrOptions.position = pos;
                 if( inputData.overlays[m].icon ){
                     ovrOptions.icon = inputData.overlays[m].icon ;
                 }
                if( isEditable ){
                    ovrOptions.draggable =true;
                }
                tmpOverlay = new google.maps.Marker( ovrOptions );
                if( inputData.overlays[m].content ){
                    tmpOverlay.content = inputData.overlays[m].content;
                    var infoWindow= new google.maps.InfoWindow({
                      content: inputData.overlays[m].content
                    });
                    tmpOverlay.addListener('click', function() {
                      infoWindow.open(map, tmpOverlay);
                    });
                }else{
                    tmpOverlay.content = "";
                }

            }
            tmpOverlay.type = inputData.overlays[m].type;
            if( isEditable && inputData.overlays[m].type != "marker"){
                tmpOverlay.setEditable( true );
            }
            tmpOverlay.setMap( map );
            tmpOverlay.id = inputData.overlays[m].id || this.getUniqueId();
            tmpOverlay.title = inputData.overlays[m].title || '';
            tmpOverlay.uid = inputData.overlays[m].uid || 0;
            tmpOverlay.group = inputData.overlays[m].group || '未分组';
            //save the overlay in the array
            mapOverlays.push( tmpOverlay );

        }

    };
    function getUniqueId (){
        var newDate=new Date;
        return newDate.getTime();
    }
    this.getUniqueId = function(){
        return getUniqueId();
    };
    this.push=function(overlay){
       return mapOverlays.push(overlay)-1;
    };

    this.indexOf =function(overlay){
        return mapOverlays.indexOf(overlay);
    };
    this.update = function(oldOverlay,newOverlay){
        var i = mapOverlays.indexOf(oldOverlay);
        if(i === -1) return;
        mapOverlays[i]=newOverlay;
        console.log(mapOverlays[i]);
    };
    this.remove = function(overlay){
        var index  = this.indexOf(overlay);
        if(index > -1){
            mapOverlays.splice(index,1);
            return true;
        }else{
            return false;
        }
    };
    this.find=function(func){
        return mapOverlays.find(func);
    };

    this.map =  function(func){
        return mapOverlays.map(func);
    };
    
	this.toJSONString=function(){
        return JSON.stringify(mapToObject());
    }
    
};
