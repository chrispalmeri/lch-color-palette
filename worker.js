importScripts('https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.0.3/chroma.min.js'); // FF has no 'import' still

function maxChroma(lightness, hue, min, max) {
	let unclipped = min || 0;
	let clipped = max || 100;
	let options = clipped - unclipped;

	if(options > 1) {
		let testChroma = Math.round((clipped + unclipped) / 2);
		let color = chroma.lch(99-lightness, testChroma, hue); // invert lightness

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

function run() {
	let progress = 0;

	let palette = Array.from({length: 100}, () => {
		return Array.from({length: 360}, () => {
			return {};
		});
	});

	palette.forEach((item, l) => {
		let even = 100;

		item.forEach((c, h) => {
			let max =  maxChroma(l, h);
			if(max < even) {
				even = max;
			}
			palette[l][h].max = max;
		});

		// save the max chroma per row
		item.forEach((c, h) => {
			palette[l][h].even = even;
		});

		even = 100;

		progress = progress + 1;
		postMessage(progress / 100);
		//console.log(progress / 100);
	});

	return palette;
}

// return a table of actual colors

let out = run();

out.forEach((item, l) => {
	item.forEach((c, h) => {
		// use the average chroma instead
		// or increase percentage
		out[l][h].hex = chroma.lch(99-l, c.even, h).hex();
	});
});

postMessage({
	success: true,
	data: out
});
