importScripts('https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.0.3/chroma.min.js'); // FF has no 'import' still

function maxChroma(lightness, hue, min, max) {
	let unclipped = min || 0;
	let clipped = max || 100;
	let options = clipped - unclipped;

	if(options > 1) {
		let testChroma = Math.round((clipped + unclipped) / 2);
		let color = chroma.lch(lightness, testChroma, hue);

		if (color.clipped()) {
			clipped = testChroma;
		} else {
			unclipped = testChroma;
		}

		return maxChroma(lightness, hue, unclipped, clipped);
	} else {
		return unclipped;
	}
}

// the progress mask is just a quick flash now
// could stop sending progress updates
// should store max chroma, unless chroma slider changes

function run(config) {
	let progress = 0;
	let shift = Math.round((config.offset / 10) * ((360 / config.colors) / 2));

	let palette = [];
	let even = [];
	let shades = [];
	for (let i = 0; i < config.shades; i++) {
		let step = 100 / config.shades;
		shades[i] = Math.round(i * step + step / 2);
	}
	let colors = [];
	for (let i = 0; i < config.colors; i++) {
		let step = 360 / config.colors;
		colors[i] = Math.round(i * step + step / 2 + shift);
	}

	for (let l = 0; l < shades.length; l++) {
		even[l] = 100;

		for (let h = 0; h < colors.length; h++) {
			let max = maxChroma(shades[l], colors[h]);
			if(max < even[l]) {
				even[l] = max;
			}
			palette.push({
				l: shades[l],
				c: max,
				h: colors[h],
				li: l,
				hi: h
			});
		}

		progress = progress + 1;
		postMessage(progress / 100);
	}

	for (let i = 0; i < palette.length; i++) {
		palette[i].hex = chroma.lch(palette[i].l, even[palette[i].li], palette[i].h).hex();
	}

	//return { palette: palette, even: even };

	// old getColors format
	let colorArray = [];
	for (let i = 0; i < palette.length; i++) {
		let item = palette[i];

		let maxData = even[item.li];

		let adjustedChroma = maxData + (item.c - maxData) * (config.chroma / 10);
		let finalColor = chroma.lch(item.l, adjustedChroma, item.h).hex();

		if(!colorArray[item.hi]) {
			colorArray[item.hi] = [];
		}
		colorArray[item.hi][item.li] = finalColor;
	}

	// add gray
	colorArray.unshift([]);
	for (let i = 0; i < shades.length; i++) {
		let finalColor = chroma.lch(shades[i], 0, 0).hex(); // or change hue to blue
		colorArray[0][i] = finalColor;
	}

	return colorArray;
}

self.addEventListener("message", function(e) {
	let calc = run(e.data);

	postMessage({
		success: true,
		calc: calc
	});
});
