/**
 * Created by zhangruofan on 2015/12/25.
 */
var map,
    marker;
function LocalMapType() {}

/**
 *本地地图配置
 */
LocalMapType.prototype.tileSize = new google.maps.Size(256, 256);
LocalMapType.prototype.maxZoom = 14; //地图显示最大级别
LocalMapType.prototype.minZoom = 4; //地图显示最小级别
LocalMapType.prototype.name = "本地地图";
LocalMapType.prototype.alt = "显示本地地图数据";
LocalMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
    var img = ownerDocument.createElement("img");
    img.style.width = this.tileSize.width + "px";
    img.style.height = this.tileSize.height + "px";
    strURL = 'http://121.41.92.56/FieldHome' + '/' + --zoom + '/' + coord.x + '/' + (coord.y) + '.png';
    img.src = strURL;
    return img;
};

var localMapType = new LocalMapType();

function initialize() {
    var located=false;
    var mapOptions = {
        zoom: 4,
        center: new google.maps.LatLng(43.61221676817571, 33.7060546875)
    };
    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
    map.mapTypes.set('localMap', localMapType); //绑定本地地图类型
    map.setMapTypeId('localMap'); //指定显示本地地图
    map.addListener('click',function(e){
        if(!located && $('#tool-button .menu.green').html()==="定位") {
            marker = new google.maps.Marker({
                position: e.latLng,
                map: map,
                icon: '/dist/js/lib/mapfiles/markers2/marker_sprite.png',
                draggable: true
            });
            located = true;
        }
    });
}



$(function() {
    $('#tool-button .menu').click(function() {

        $('#tool-button li').removeClass('green');
        $(this).addClass('green');
    })
})
