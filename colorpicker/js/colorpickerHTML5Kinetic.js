function loadImages ( images, stage ) {
	for ( var image in images ) {
		imageObject = new Image();
		imageObject.onload = function () {
			addImageToStage ( imageObject, stage );
		}
		imageObject.src = images[image];
	}
}

function addImageToStage ( image, stage ) {
	var imageLayer = new Kinetic.Layer();
	var kineticImage = new Kinetic.Image({
		x: 0,
		y: 0,
		image: image,
		width: 10,
		height: 10,
		name: 'image',
		draggable: true
	});

	imageLayer.add(kineticImage);
	stage.add(imageLayer);

}

function initStage ( tagID ) {
	var stage = new Kinetic.Stage({
		container: tagID,
		width: 500,
		height: 500
	});
	return stage;
}

function drawColorWheel ( stage ) {
	var canvas = $('#stage1 canvas').first();
	var context = canvas.getContext ( '2d' );
	var radius = canvas.width / 2;
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
	/*
	var radius = stage.getWidth() / 2;
	var layer = new Kinetic.Layer();
	for ( var angle = 0; angle >= 360; angle++ ) {
		var arc = new Kinetic.Arc ({
			angle: 1,
			innerRadius: 0,
			outerRadius: radius,
			fillRadialGradientStartRadius: 0,
			fillRadialGradientEndRadius: radius,
			fillRadialGradientColorStops: [0, 'hsl(' + angle + ', 100%, 100%)', 0.5, 'hsl((' + angle + ', 100%, 50%)', 1, 'hsl((' + angle + ', 100%, 0%)']
		});

		layer.add(arc);
	}
	*/
	/*
	var circle = new Kinetic.Circle({
		x: radius,
		y: radius,
		radius: radius,
		fillRadialGradientStartRadius: 0,
		fillRadialGradientEndRadius: radius,
		fillRadialGradientColorStops: [0, 'hsl(0, 100%, 100%)', 0.5, 'hsl(0, 100%, 50%)', 1, 'hsl(0, 100%, 0%)']
	});

	layer.add(circle);
	*/
	stage.add(layer);
}

$(document).ready(function(){
	var images = [ 'images/cross.png' ];
	var stage = initStage('stage1');
	loadImages(images, stage);
	drawColorWheel(stage);
	stage.draw();
	//console.log(stage);
});