importScripts('vendor/chroma.js'); // FF has no 'import' still

function round(number, decimal = 2) {
	var magnitude = Math.pow(10, decimal);
	return Math.round(number * magnitude) / magnitude;
}

// absolute max seen was 133.52 at 100x360 plus running through offset
function maxChroma(lightness, hue, min = 0, max = 163.84) {
	if (max - min > 0.01) {
		let test = (max + min) / 2;
		let color = chroma.lch(lightness, test, hue);

		if (color.clipped()) {
			max = test;
		} else {
			min = test;
		}

		return maxChroma(lightness, hue, min, max);
	} else {
		return round(min);
	}
}

let cache = {
	colors: null,
	levels: null,
	chroma: null,
	offset: null
};

let state = {
	colors: [],
	levels: [],
	even: [],
	palette: [],
};

function run(input) {
	let changed = {};
	for (var key in cache) {
		if (cache[key] !== input[key]) {
			changed[key] = true;
			cache[key] = input[key];
		}
	}

	if (changed.colors || changed.offset) {
		// init colors
		state.colors = [];
		let colorStep = 360 / input.colors;
		let colorShift = (input.offset / 10) * (colorStep / 2);
		for (let i = 0; i < input.colors; i++) {
			state.colors[i] = round(i * colorStep + colorStep / 2 + colorShift);
		}
	}

	if (changed.levels) {
		// init levels and even
		state.levels = [];
		state.even = [];
		let levelStep = 100 / input.levels;
		for (let i = 0; i < input.levels; i++) {
			let invert = input.levels - 1 - i;
			state.levels[invert] = round(i * levelStep + levelStep / 2);
			state.even[invert] = 100;
		}
	}

	if (changed.colors || changed.levels || changed.offset) {
		// init palette and get even chroma per level
		state.palette = [];
		for (let h = 0; h < input.colors; h++) {
			for (let l = 0; l < input.levels; l++) {
				let max = maxChroma(state.levels[l], state.colors[h]);
				if (max < state.even[l]) {
					state.even[l] = max;
				}
				state.palette.push({
					l: state.levels[l],
					c: max,
					h: state.colors[h],
					li: l
				});
			}
		}

		// add gray at the front
		for (let l = input.levels - 1; l >= 0; l--) {
			state.palette.unshift({
				l: state.levels[l],
				c: 0,
				h: 0,
				li: l,
				hex: chroma.lch(state.levels[l], 0, 0).hex() // could make it slightly blue
			});
		}
	}

	// should you curve light colors down toward overall average chroma?
	// could over chroma bias to bumping dark colors?
	// or can chroma be bumped more evenly, ignoring clipping?

	if (changed.colors || changed.levels || changed.chroma || changed.offset) {
		// add hex using the adjusted chroma, skip gray
		for (let i = input.levels; i < state.palette.length; i++) {
			let maxData = state.even[state.palette[i].li];
			let adjustedChroma = maxData + (state.palette[i].c - maxData) * (input.chroma / 10);

			state.palette[i].hex = chroma.lch(state.palette[i].l, adjustedChroma, state.palette[i].h).hex();
		}
	}

	return {
		colors: state.palette,
		config: input
	};
}

self.addEventListener('message', function (event) {
	let result = run(event.data);
	postMessage(result);
});
