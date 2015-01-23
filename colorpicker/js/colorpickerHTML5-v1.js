function positionToDegrees ( x, y, radius ) {
	x -= radius; y -= radius;
	var theta = Math.atan2(-y, x);
	if ( theta < 0 ) theta += 2 * Math.PI;
	return Math.round(theta * (180 / Math.PI));
}

function distanceFromCenter ( x, y, radius ) {
	x -= radius;
	y -= radius;
	return Math.sqrt((x*x) + (y*y))
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
		r = hue2rgb ( p, q, h + 1/3 );
		g = hue2rgb ( p, q, h );
		b = hue2rgb ( p, q, h - 1/3 );
	}
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function calculateLuminance ( h, s, l ) {
	var rgb = hslToRgb ( h, s, l );
	var a = rgb.map ( function ( v ) {
		v /= 255;
		return ( v <= 0.03928 ) ? v / 12.92 : Math.pow( ((v+0.055)/1.055), 2.4 );
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
// TODO: FIX THIS FUNCTION
function calculateContrastRatio ( lum1, lum2 ) {
	return ( lum1 > lum2 )? (lum1 + 0.05)/(lum2 + 0.05) : (lum2 + 0.05)/(lum1 + 0.05);
}

function calculateCoordinates ( angle, distanceFromCenter ) {
	angle = angle * Math.PI/180;
	x = Math.round( (distanceFromCenter * Math.cos(angle)) );
	y = Math.round( (distanceFromCenter * Math.sin(angle)) );
	return {'x': x, 'y': y, 'distance': distanceFromCenter};
}

function drawColorWheel ( context, radius ) {
	for ( var angle = 0; angle <= 360; angle++ ) {
		var startAngle = (angle-2) * Math.PI / 180;
		var endAngle = angle * Math.PI / 180;
		context.beginPath ();
		context.moveTo ( 0, 0 );
		context.arc ( 0, 0, radius, startAngle, endAngle, false );
		context.closePath ();
		
		var edgeCoordinates = calculateCoordinates(angle, radius);
		var gradient = context.createLinearGradient(0, 0, edgeCoordinates.x, edgeCoordinates.y);
		gradient.addColorStop(0, 'hsl('+angle+', 100%, 100%)')
		gradient.addColorStop(0.5, 'hsl('+angle+', 100%, 50%)')
		gradient.addColorStop(1, 'hsl('+angle+', 100%, 0%)')
		context.fillStyle = gradient;
		
		//context.fillStyle = 'hsl('+angle+', 100%, 50%)';
		context.fill();
	}
}

function findLuminanceTresholdCoordinates ( h, s, l, radius ) {
	var luminance = calculateLuminance(h, s, l);
	for ( var angle = 0; angle <= 360; angle++ ) {
		var ch = Math.round(angle/3.6)/100;
		var cs = 1;
		var cl = 0;
		for ( cl = 0; cl <= 100; cl++ ) {
			var cLuminance = calculateLuminance(ch, cs, cl);
			var contrastRatio = calculateContrastRatio(luminance, cLuminance);
			if ( contrastRatio > 7 ) {
				var distance = (cl/100)*radius;
				return calculateCoordinates(angle, distance);
			}
		}
	}
}

function findLowerLuminanceTreshold ( H, S, L, angle, contrastTreshold ) {
	var luminance = calculateLuminance ( H, S, L );
	//var compareH = Math.round(angle/3.6)/100;
	var compareH = Math.round(angle/3.6)/100;
	var compareS = 1;
	var compareL = 0;
	for ( compareL = 0; compareL <= 100; compareL++ ) {
		var compareLuminance = calculateLuminance ( compareH, compareS , compareL/100 );
		var contrastRatio = calculateContrastRatio(luminance, compareLuminance);
		if ( contrastRatio > contrastTreshold ) {
			return compareL;
		}
	}
	return compareL;
}

function findUpperLuminanceTreshold ( H, S, L, angle, contrastTreshold ) {
	var luminance = calculateLuminance ( H, S, L );
	var compareH = Math.round(angle/3.6)/100;
	var compareS = 1;
	var compareL = 100;
	for ( compareL = 100; compareL >= 0; compareL-- ) {
		var compareLuminance = calculateLuminance ( compareH, compareS , compareL );
		var contrastRatio = calculateContrastRatio(luminance, compareLuminance);
		if ( contrastRatio > contrastTreshold ) {
			return compareL;
		}
	}
	return compareL;
}

function drawRestrictedColorWheel ( context, radius, H, S, L, contrastTreshold ) {
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
		var minL = findLowerLuminanceTreshold ( H, S, L, angle, contrastTreshold );
		
		// Set start gradient color and position
		if ( minL > 0 )
			gradient.addColorStop ( 1, 'hsl(0, 100%, 100%)' );
		if ( minL > 1 )
			gradient.addColorStop ( ((101-minL)/100), 'hsl(0, 100%, 100%)' );
		gradient.addColorStop ( ((100-minL)/100), 'hsl('+angle+', 100%, ' + minL + '%)' );
		
		// Set mid way cradient color
		gradient.addColorStop ( 0.5, 'hsl('+angle+', 100%, 50%)' );

		// Find max L
		var maxL = findUpperLuminanceTreshold ( H, S, L, angle, contrastTreshold );
		
		// Set stop gradient color and position
		gradient.addColorStop ( ((100-maxL)/100), 'hsl('+angle+', 100%, ' + maxL + '%)' );
		if ( maxL < 100 )
			gradient.addColorStop ( ((99-maxL)/100), 'hsl(0, 100%, 100%)' );
		if ( maxL < 99 )		
			gradient.addColorStop ( 0, 'hsl(0, 100%, 100%)' );

		
		context.fillStyle = gradient;
		context.fill();
	}
	/*
	for ( var angle = 0; angle <= 360; angle++ ) {
		var startAngle = (angle-2) * Math.PI / 180;
		var endAngle = angle * Math.PI / 180;
		var edgeCoordinates = findLuminanceTresholdCoordinates ( h, s, l, radius );
		context.beginPath ();
		context.moveTo ( 0, 0 );
		context.arc ( 0, 0, edgeCoordinates.distance, startAngle, endAngle, false );
		context.closePath ();
		
		var gradient = context.createLinearGradient ( 0, 0, edgeCoordinates.x, edgeCoordinates.y );
		gradient.addColorStop ( 0, 'hsl('+angle+', 100%, 100%)' );
		gradient.addColorStop ( 0.5, 'hsl('+angle+', 100%, 50%)' );
		gradient.addColorStop ( 1, 'hsl('+angle+', 100%, 0%)' );
		context.fillStyle = gradient;
		context.fill();
	}
	*/

}
/*
function drawRestrictionPath ( canvas, context, radius, h, s, l ) {
	var luminance = calculateLuminance(h, s, l);
	var first = true;
	context.beginPath();
	for ( var angle = 0; angle <= 360; angle++ ) {
		var ch = Math.round(angle/3.6)/100;
		var cs = 1;
		var cl = 0;
		for ( cl = 0; cl <= 100; cl++ ) {
			var cLuminance = calculateLuminance(ch, cs, cl);
			var contrastRatio = calculateContrastRatio(luminance, cLuminance);
			if ( contrastRatio > 7 ) {
				var distance = (cl/100)*radius;
				var coordinates = calculateCoordinates(angle, distance);
				if ( first == true ) {
					context.moveTo(coordinates.x, coordinates.y);
					first = false;
				} else {
					context.lineTo(coordinates.x, coordinates.y);
				}
				cl = 101;
			}
		}
	}
	context.closePath();
	context.strokeStyle = 'white';
	context.stroke();

	first = true;
	context.beginPath();
	for ( var angle = 0; angle <= 360; angle++ ) {
		var ch = Math.round(angle/3.6)/100;
		var cs = 1;
		var cl = 0;
		for ( cl = 100; cl > 0; cl-- ) {
			var cLuminance = calculateLuminance(ch, cs, cl);
			var contrastRatio = calculateContrastRatio(luminance, cLuminance);
			if ( contrastRatio > 7 ) {
				var distance = (cl/100)*radius;
				var coordinates = calculateCoordinates(angle, distance);
				if ( first == true ) {
					context.moveTo(coordinates.x, coordinates.y);
					first = false;
				} else {
					context.lineTo(coordinates.x, coordinates.y);
				}
				cl = 0;
			}
		}
	}
	context.closePath();
	context.stroke();

}
*/
function getMousePos ( canvas, evt ) {
	var rect = canvas.getBoundingClientRect ();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

function initCanvas ( canvas, context, radius ) {
	canvas.width = radius*2;
	canvas.height = radius*2;
	context.translate ( radius, radius );
	/*
	var mouseDown = false;
	
	canvas.addEventListener('mousedown', function() {
		mouseDown = true;
	}, false);

	canvas.addEventListener('mouseup', function() {
		mouseDown = false;
	}, false);

	canvas.addEventListener('mousemove', function(evt) {
		var mousePos = getMousePos(canvas, evt);
		if ( mouseDown && mousePos !== null ) {
			console.log(mousePos);
			//console.log(marker);
		}
	}, false);
	*/
}

//$(window).load(function(){
	var canvas = document.getElementById ( 'canvas1' );
	var context = canvas.getContext ( '2d' );
	/*
	var marker = new Kinetic.Image({
		x: 0,
		y: 0,
		image: marker,
		draggable: true
	});
	marker.onload = function () {
		context.drawImage(marker, 0, 0);
	};
	marker.src = 'images/cross.png';
	*/
	initCanvas ( canvas, context, 250 );
	//drawColorWheel ( context, 250 );
	//drawRestrictionPath( canvas, context, 300, 0, 1, 0.5);
	drawRestrictedColorWheel ( context, 250, 0.5, 1, 0.5, 7 );

//});

