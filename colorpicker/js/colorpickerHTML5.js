
function distanceFromCenter ( x, y, radius ) {
	x -= radius;
	y -= radius;
	return Math.sqrt((x*x) + (y*y))
}

function hslToRgb ( HSL ) {
	var r, g, b;
	var h = Math.round(HSL.h/3.6) / 100;
	var s = HSL.s / 100;
	var l = HSL.l / 100;
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
		r = hue2rgb ( p, q, h + 1/3 );
		g = hue2rgb ( p, q, h );
		b = hue2rgb ( p, q, h - 1/3 );
	}
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function calculateLuminance ( HSL ) {
	var RGB = hslToRgb ( HSL );
	var a = RGB.map ( function ( v ) {
		v /= 255;
		return ( v <= 0.03928 ) ? v / 12.92 : Math.pow( ((v+0.055)/1.055), 2.4 );
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function calculateContrastRatio ( lum1, lum2 ) {
	return ( lum1 > lum2 )? (lum1 + 0.05)/(lum2 + 0.05) : (lum2 + 0.05)/(lum1 + 0.05);
}

function calculateCoordinates ( angle, distanceFromCenter ) {
	angle = angle * Math.PI/180;
	x = Math.round( (distanceFromCenter * Math.cos(angle)) );
	y = Math.round( (distanceFromCenter * Math.sin(angle)) );
	return {'x': x, 'y': y, 'distance': distanceFromCenter};
}

function findLowerLuminanceTreshold ( HSL, angle, contrastTreshold ) {
	var luminance = calculateLuminance ( HSL );
	
	var H = angle;
	var S = 100;
	var L = 0;
	
	for ( L = 0; L <= 100; L++ ) {
		var luminance2 = calculateLuminance ( { h: H, s: S, l: L} );
		var contrastRatio = calculateContrastRatio(luminance, luminance2);
		if ( contrastRatio > contrastTreshold ) {
			return L;
		}
	}
	return L;
}

function findUpperLuminanceTreshold ( HSL, angle, contrastTreshold ) {
	var luminance = calculateLuminance ( HSL );
	
	var H = angle;
	var S = 100;
	var L = 100;
	
	for ( L = 100; L >= 0; L-- ) {
		var luminance2 = calculateLuminance ( { h: H, s: S , l: L} );
		var contrastRatio = calculateContrastRatio(luminance, luminance2);
		if ( contrastRatio > contrastTreshold ) {
			return L;
		}
	}
	return L;
}

function drawCircle ( context, radius, lineWidth ) {
	context.arc ( 0, 0, radius + lineWidth, 0, 360, false );
	context.lineWidth = lineWidth;
	context.strokeStyle = 'black';
	context.stroke();
}

function drawRestrictedColorWheel ( context, radius, HSL, contrastTreshold ) {
	drawCircle(context,radius, 1);
	for ( var angle = 0; angle <= 360; angle++ ) {
		var startAngle = (angle-2) * Math.PI / 180;
		var endAngle = angle * Math.PI / 180;
		
		context.beginPath ();
		context.moveTo ( 0, 0 );
		context.arc ( 0, 0, radius, startAngle, endAngle, false );
		context.closePath ();
		
		var edgeCoordinates = calculateCoordinates ( angle, radius );
		var gradient = context.createLinearGradient ( 0, 0, edgeCoordinates.x, edgeCoordinates.y );

		// Find minimum L
		var minL = findLowerLuminanceTreshold ( HSL, angle, contrastTreshold );
		
		// Set start gradient color and position
		if ( minL > 0 ) {
			gradient.addColorStop ( 0, 'hsl(0, 100%, 100%)' );
			if ( minL > 1 )
				gradient.addColorStop ( (minL/100), 'hsl(0, 100%, 100%)' );
			gradient.addColorStop ( (minL/100), 'hsl('+angle+', 100%, ' + minL + '%)' );
		} else {
			gradient.addColorStop ( 0, 'hsl('+angle+', 100%, 0%)' );		
		}
		
		// Find max L
		var maxL = findUpperLuminanceTreshold ( HSL, angle, contrastTreshold );

		// Set stop gradient color and position
		gradient.addColorStop ( (maxL/100), 'hsl('+angle+', 100%, ' + maxL + '%)' );
		if ( maxL < 100 ) {
			if ( maxL < 99 )		
				gradient.addColorStop ( ((maxL)/100), 'hsl(0, 100%, 100%)' );
			gradient.addColorStop ( 1, 'hsl(0, 100%, 100%)' );
		}

		
		context.fillStyle = gradient;
		context.fill();
	}
}

function drawFullColorWheel ( context, radius ) {
	drawCircle(context,radius, 1);
	for ( var angle = 0; angle <= 360; angle++ ) {
		var startAngle = (angle-2) * Math.PI / 180;
		var endAngle = angle * Math.PI / 180;
		
		// Draw circle
		context.beginPath ();
		context.moveTo ( 0, 0 );
		context.arc ( 0, 0, radius, startAngle, endAngle, false );
		context.closePath ();
		
		context.strokeStyle = 'transient';
		
		var edgeCoordinates = calculateCoordinates ( angle, radius );
		var gradient = context.createLinearGradient ( 0, 0, edgeCoordinates.x, edgeCoordinates.y );

		// Set start cradient color
		gradient.addColorStop ( 0, 'hsl('+angle+', 100%, 0%)' );
		// Set mid way cradient color
		gradient.addColorStop ( 0.5, 'hsl('+angle+', 100%, 50%)' );
		// Set stop gradient color and position
		gradient.addColorStop ( 1, 'hsl('+angle+', 100%, 100%)' );

		
		context.fillStyle = gradient;
		context.fill();
	}
}

function addMarker () {
	var marker = $('<div>').addClass('marker');
	marker.appendTo($('#canvas-container'));
	return marker;
}

function getMousePosition ( canvas, event, radius ) {
	var rect = canvas.getBoundingClientRect();
	return {
	  x: event.clientX - rect.left - radius,
	  y: event.clientY - rect.top - radius
	};
}
function initCanvas ( canvas, context, radius ) {
	canvas.width = radius*2;
	canvas.height = radius*2;
	context.translate ( radius, radius );
}

var canvas = document.getElementById ( 'canvas1' );
var context = canvas.getContext ( '2d' );

var HSL = {
	h: 20,
	s: 20,
	l: 0
};
var colorWheelRadius = 250;
var contrastTreshold = 3;

initCanvas ( canvas, context, colorWheelRadius+10 );
//drawRestrictedColorWheel ( context, colorWheelRadius, HSL, contrastTreshold );
drawFullColorWheel(context, colorWheelRadius);
//var marker = drawMarker(context, 'images/cross.png', 0, 0);

var marker = addMarker(canvas);

canvas.addEventListener('mousedown', function( event ) {
	var position = getMousePosition(canvas, event, colorWheelRadius);
	//console.log(position);
	//context.putImageData(marker, position.x, position.y);
	//drawMarker( context, 'images/cross.png', position.x, position.y);
	marker.css({top: event.clientY, left: event.clientX});
});
