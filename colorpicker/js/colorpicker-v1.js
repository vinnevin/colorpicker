var containment_radius = 150;

function limit ( x, y, x1, y1 ) {
	var dist = distance([x, y], [x1, y1]);
	if ( dist <= containment_radius ) {
		return {x: x, y: y};
	} else {
		return {limit: true, x: x, y: y};
	}
}

function distance ( dot1, dot2 ) {
	var	x1 = dot1[0], y1 = dot1[1], x2 = dot2[0], y2 = dot2[1];
	return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function hslToRgb ( h, s, l ) {
    var r, g, b;
    if ( s == 0 ) {
        r = g = b = l; // achromatic
    } else {
        function hue2rgb ( p, q, t ) {
            if ( t < 0 ) t += 1;
            if ( t > 1 ) t -= 1;
            if ( t < 1/6 ) return p + (q - p) * 6 * t;
            if ( t < 1/2 ) return q;
            if ( t < 2/3 ) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
/*
function rgbToHsl ( r, g, b ) {
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if ( max == min ) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch ( max ) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, l];
}
*/
/*
function componentToHex ( c ) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex ( r, g, b ) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
*/
function positionToDegrees ( x, y, r ) {
	x -= r;
	y -= r;
	var theta = Math.atan2(-y, x);
	if ( theta < 0 )
		theta += 2 * Math.PI;
	return Math.round(theta * (180 / Math.PI));
}

function distanceFromCenter ( x, y, r ) {
	x -= r;
	y -= r;
	return Math.sqrt((x*x) + (y*y))
}

$('.colorpicker .cross').draggable({
	//containment: 'parent',
	drag: function ( event, ui ) {
        var position = ui.position;
        var result = limit(position.left, position.top, containment_radius, containment_radius);
        //ui.position.top = event.clientX + "px";
        //ui.position.left = event.clientY + "px";
        if ( result.limit ) {
            ui.position.top = result.x + "px";
            ui.position.left = result.y + "px";
        } else {
			updateTarget('#target', result.x, result.y, 150);
			/*
			var deg = positionToDegrees(result.x, result.y, 150);
			var dis = distanceFromCenter(result.x, result.y, 150);
			var h = Math.round(deg/3.6)/100;
			var s = 1;
			var l = 1 - Math.round(((dis)*50)/150)/100;
			var rgb = hslToRgb(h,s,l);
			$('#target').css('background-color', 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')');
			*/
			//$('#target').css('background-color', rgbToHex(rgb[0], rgb[1], rgb[2]));
		}
		
	}
});
/*
$( ".colorpicker .cross" ).on("dragstart", function( event, ui ) {
		ui.position.top = event.clientX + "px";
		ui.position.left = event.clientY + "px";
		console.log(ui.position.top + '--' + event.clientX);
});
*/
function updateTarget ( target, x, y, r ) {
	var deg = positionToDegrees(x, y, r);
	var dis = distanceFromCenter(x, y, r);
	var h = Math.round(deg/3.6)/100;
	var s = 1;
	var l = 1 - Math.round(((dis)*50)/r)/100;
	var rgb = hslToRgb(h,s,l);
	$(target).css('background-color', 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')');
}
/*
$('.colorpicker').mousedown(function(event) {
	//updateTarget('#target', event.clientX, event.clientY, 150);
	//$('.colorpicker .cross').trigger(event);
});
*/
/*
drawColorWheel();
function drawColorWheel () {
	var cw = $('#colorWheel');
	var width = cw.width();
	var r = width/2;
	for ( var x = 0; x < width; x++ ) {
		for ( var y = 0; y < width; y++ ) {
			var pixel = $('<span class="pixel"></span>');
			var dis = distanceFromCenter(x, y, r);
			if ( dis <= r ) {
				var deg = positionToDegrees(x, y, r);
				var h = deg/360;
				var s = 1;
				var l = 1 - ((dis*50)/r)/100;
				var rgb = hslToRgb(h,s,l);
				$(pixel).css('background-color', 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')');
			}
			cw.append(pixel);
		}
	}
}
*/