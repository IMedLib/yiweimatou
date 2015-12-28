var map;
var drawingManager;
var pencil = 0;


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
/**
 *本地地图配置结束 
 */
/**
 *初始化地图 
 */
function initialize() {
	var mapOptions = {
		zoom: 4,
		center: new google.maps.LatLng(43.61221676817571, 33.7060546875)
	};
	map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
	map.mapTypes.set('localMap', localMapType); //绑定本地地图类型
	map.setMapTypeId('localMap'); //指定显示本地地图

	/**
	 *涂鸦 
	 */
	google.maps.event.addDomListener(map.getDiv(), 'mousedown', function(e) {
		//do it with the right mouse-button only
		if (e.button != 0 || pencil == 0) return;
		//the polygon
		poly = new google.maps.Polyline({
			map: map,
			clickable: false,
			fillColor: $('#color').val(),
			strokeColor: $('#color').val(),
			strokeWeight: $('#strokeWeight').val()
		});
		//move-listener
		var move = google.maps.event.addListener(map, 'mousemove', function(e) {
			poly.getPath().push(e.latLng);
		});
		//mouseup-listener
		google.maps.event.addListenerOnce(map, 'mouseup', function(e) {
			google.maps.event.removeListener(move);
			if (pencil == 2) {
				var path = poly.getPath();
				poly.setMap(null);
				poly = new google.maps.Polygon({
					map: map,
					path: path,
					strokeColor: $('#color').val(),
					fillColor: $('#color').val(),
					strokeWeight: $('#strokeWeight').val()

				});
			}
		});
	});



	/**
	 * 绘图小工具
	 */
	drawingManager = new google.maps.drawing.DrawingManager({
		drawingControl: true,
		drawingControlOptions: {
			position: google.maps.ControlPosition.BOTTOM_LEFT,
			drawingModes: [
				google.maps.drawing.OverlayType.MARKER,
				google.maps.drawing.OverlayType.CIRCLE,
				google.maps.drawing.OverlayType.POLYGON,
				google.maps.drawing.OverlayType.POLYLINE,
				google.maps.drawing.OverlayType.RECTANGLE,
			]
		},
		markerOptions: {
			icon:'/dist/js/lib/mapfiles/markers2/marker_sprite.png',
			clickable: true
		},

	});
	drawingManager.setMap(map);
	/**
	 * marker点击跳出弹出框
	 */
	//google.maps.event.addListener(drawingManager, 'markercomplete', function(marker) {
	//		var contentString = "<div id='summernote' style='width:1000px;height:1000px;'>请输入标注内容...</div>";
    //
	//		var infowindow = new google.maps.InfoWindow({
	//			content: contentString
	//		});
	//		marker.addListener('click', function() {
	//			infowindow.open(map, marker);
	//		});
	//		$('#tool-button .menu:eq(0)').click();
	//		infowindow.open(map, marker);
	//		setTimeout("$('#summernote').summernote({height: 200,lang: 'zh-CN' }); ",100);
    //
    //
	//});
}



$(function() {
	setTimeout("changeHref();$('.gmnoprint:last').hide();", 300);
	setTimeout("changeHref();$('.gmnoprint:last').hide();", 1000);
	$('#color').change(function() {
		changeDraw()
	});
	$('#strokeWeight').change(function() {
		changeDraw()
	});

	$('#tool-button .menu').click(function() {
		pencil = 0;
		if ($(this).html() == '涂鸦') {
			var mapOptions = {
				zoom: 5,
				draggable: false
			};
			map.setOptions(mapOptions);
			$('.gmnoprint:last').children('div:eq(0)').find('div').click();
			pencil = 1;
		} else if ($(this).html() == '移动') {
			var mapOptions = {
				zoom: 5,
				draggable: true
			};
			map.setOptions(mapOptions);
			$('.gmnoprint:last').children('div:eq(0)').find('div').click();
		} else if ($(this).html() == '标注') {
			$('.gmnoprint:last').children('div:eq(1)').find('div').click();
		} else if ($(this).html() == '区域') {
			var mapOptions = {
				zoom: 5,
				draggable: false
			};
			map.setOptions(mapOptions);
			$('.gmnoprint:last').children('div:eq(0)').find('div').click();
			pencil = 2;
		} else if ($(this).html() == '直线') {
			$('.gmnoprint:last').children('div:eq(4)').find('div').click();
		} else if ($(this).html() == '矩形') {
			$('.gmnoprint:last').children('div:eq(5)').find('div').click();
		} else {
			return;
		}
		$('#tool-button li').removeClass('green');
		$(this).addClass('green');
	})
})

function changeHref() {
	$('.gm-style').find('a').attr('href', "http://www.baidu.com");
}

function changeDraw() {
	drawingManager.setOptions({
		polylineOptions: {
			strokeColor: $('#color').val(),
			fillColor: $('#color').val(),
			strokeWeight: $('#strokeWeight').val(),
			clickable: false,
			editable: true
		},
		rectangleOptions: {
			strokeColor: $('#color').val(),
			fillColor: $('#color').val(),
			strokeWeight: $('#strokeWeight').val(),
			clickable: true,
			editable: true
		}
	});
}