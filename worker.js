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

function getColors(workerOutput, numberOfColors, numberOfLevels, percentOverChroma, hueOffset) {
	let colorArray = [];

	let shift = Math.round((hueOffset / 10) * ((360 / numberOfColors) / 2)); // convert hueOffset to edge extents at max

	for(let levelIndex = 0; levelIndex < numberOfLevels; levelIndex++) {
		colorArray[levelIndex] = [];

		for(let colorIndex = 0; colorIndex < numberOfColors; colorIndex++) {
			let lightness = Math.round((levelIndex * (100 / numberOfLevels)) + ((100 / numberOfLevels) / 2));
			let hue = Math.round((colorIndex * (360 / numberOfColors)) + ((360 / numberOfColors) / 2) + shift);

			lightness = 99 - lightness; // this is what flips it

			// these are weird, just to match current behavior
			let colorData = workerOutput.palette[(lightness + 1) * 360 + (hue - 1)];
			let maxData = workerOutput.even[lightness + 1];

			let adjustedChroma = maxData + (colorData.c - maxData) * (percentOverChroma / 10);
			let finalColor = chroma.lch(lightness, adjustedChroma, hue).hex();

			colorArray[levelIndex][colorIndex] = finalColor;
		}
	}

	return colorArray;
}

function run() {
	let progress = 0;

	let palette = [];
	let even = [];
	let shades = Array.from({length: 100}, (v, i) => i);
	let colors = Array.from({length: 360}, (v, i) => i);

	for (let l = 0; l < shades.length; l++) {
		even[l] = 100;

		for (let h = 0; h < colors.length; h++) {
			let max = maxChroma(l, h);
			if(max < even[l]) {
				even[l] = max;
			}
			palette.push({
				l: l,
				c: max,
				h: h,
			});
		}

		progress = progress + 1;
		postMessage(progress / 100);
	}

	for (let i = 0; i < palette.length; i++) {
		palette[i].hex = chroma.lch(palette[i].l, even[palette[i].l], palette[i].h).hex();
	}

	return { palette: palette, even: even };
}

// the progress mask is immersion breaking
// not really a fix, just keeping old behavior, by only doing it once
// that should be the only thing sending progress updates, so no mask
let out = null;

self.addEventListener("message", function(e) {
	if(!out) {
		out = run();
	}

	let calc = getColors(out, e.data.colors, e.data.levels, e.data.chroma, e.data.offset);

	postMessage({
		success: true,
		calc: calc
	});
});
