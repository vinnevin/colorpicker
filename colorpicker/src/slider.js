class Slider {

	constructor (options) {
		this.el = options.el;
		this.handle = this.addHandle();
		this.addEventListeners();
		this.value = 0;
	}

	addHandle () {
		const div = document.createElement('div');
		div.id = 'handle';
		div.classList.add('handle');
		this.el.append(div);
		return div;
	}

	addEventListeners () {
		this.handle.addEventListener('drag', this.setHandlePosition.bind(this));
		this.handle.addEventListener('dragend', this.setHandlePosition.bind(this));
	}

	setHandlePosition ( event ) {
		let position;
		const max = this.el.clientHeight - this.handle.clientHeight;
		if ( event.clientY < 0 ) {
			position = 0;
		} else if ( event.clientY > max ) {
			position = max;
		} else {
			position = event.clientY;
		}
		this.handle.style.top = position;
		this.value = Math.round((position / max) * 100);
	}

}