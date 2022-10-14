var myWorker, workerOutput; // nested array where indexes are lightness and hue, 100 long 360 wide

let colorArray = [];

function getColors() {
	colorArray = [];

	let numberOfColors = document.getElementById('num_h').value; // 0 to 20
	let numberOfLevels = document.getElementById('num_l').value; // 0 to 5
	let percentOverChroma = document.getElementById('num_c').value; // 0 to 10
	let hueOffset = document.getElementById('off_x').value; // -10 to 10

	let shift = Math.round((hueOffset / 10) * ((360 / numberOfColors) / 2)); // convert hueOffset to edge extents at max

	for(let levelIndex = 0; levelIndex < numberOfLevels; levelIndex++) {
		colorArray[levelIndex] = [];

		for(let colorIndex = 0; colorIndex < numberOfColors; colorIndex++) {
			let lightness = Math.round((levelIndex * (100 / numberOfLevels)) + ((100 / numberOfLevels) / 2));
			let hue = Math.round((colorIndex * (360 / numberOfColors)) + ((360 / numberOfColors) / 2) + shift);
			if(hue < 1) {
				hue = hue + 360
			}

			let colorData = workerOutput[lightness-1][hue-1];

			let adjustedChroma = colorData.even + (colorData.max - colorData.even) * (percentOverChroma / 10);
			let finalColor = chroma.lch(99 - lightness, adjustedChroma, hue).hex(); // this is what  flips it

			colorArray[levelIndex][colorIndex] = finalColor;
		}
	}

	//return output;
	showColors();
	buildCss();
}

function buildCss() {
	let styleSheet = new CSSStyleSheet();

	styleSheet.insertRule(':root { --black: #000; }');
	styleSheet.cssRules[0].style.setProperty('--white', '#fff');

	// would like to rearrange this and group by color

	for(let levelIndex = 0; levelIndex < colorArray.length; levelIndex++) {
		for(let colorIndex = 0; colorIndex < colorArray[levelIndex].length; colorIndex++) {
			let finalColor = colorArray[levelIndex][colorIndex];

			styleSheet.cssRules[0].style.setProperty(`--level${levelIndex}-color${colorIndex}`, finalColor);
		}
	}

	return styleSheet.cssRules[0].cssText;
}

function downloadCss(e) {
	e.preventDefault();

	let cssText = buildCss();
	let cssFormatted = cssText.replace(/([;{])\s?/g, '$1\n\t').replace('\t}', '}\n');

	let link = document.createElement("a");
	link.setAttribute("href", "data:text/css;charset=utf-8," + encodeURIComponent(cssFormatted));
	link.setAttribute("download", "colors.css");
	link.click();
}

function showColors() {
	let swatches = document.getElementById('swatches');
	swatches.innerHTML = '';

	for(let levelIndex = 0; levelIndex < colorArray.length; levelIndex++) {
		for(let colorIndex = 0; colorIndex < colorArray[levelIndex].length; colorIndex++) {
			let finalColor = colorArray[levelIndex][colorIndex];

			var swatch = document.createElement('div');
			swatch.style.background = finalColor;
			swatch.title = finalColor;
			swatch.addEventListener('click', () => {
				navigator.clipboard.writeText(finalColor);
			});
			swatch.style.gridRow = levelIndex + 1;
			swatches.appendChild(swatch);
		}
	}
}

function startWorker() {
	if(typeof(Worker) !== "undefined") {
		if(typeof(myWorker) == "undefined") {
			myWorker = new Worker("worker.js");
			//document.getElementById("result").innerHTML = 'loading';
		}

		myWorker.onmessage = function(event) {
			if(event.data.success) {
				stopWorker();
				//console.log(event.data.data);

				// actually build the table
				var canvas = document.createElement('canvas');
				canvas.setAttribute('height', '100px');
				canvas.setAttribute('width', '360px');
				var ctx = canvas.getContext("2d");

				event.data.data.forEach((item, l) => {
					item.forEach((c, h) => {
						ctx.fillStyle = c.hex;
						ctx.fillRect(h, l, 1, 1);
					});
				});

				var dataUrl = canvas.toDataURL();
				var myElement = document.getElementById('palette');
				myElement.style.backgroundImage = 'url('+dataUrl+')';

				var progressBar = document.getElementById('progress');
				progressBar.parentElement.removeChild(progressBar);

				var swatches = document.createElement('div')
				swatches.id = 'swatches';
				document.getElementById('palette').appendChild(swatches);

				workerOutput = event.data.data;
				getColors();
			} else {
				//document.getElementById("result").innerHTML = event.data;
				document.getElementById('progress').value = event.data;
			}
		};
	} else {
		//document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Workers...";
	}
}

function stopWorker() { 
	myWorker.terminate();
	myWorker = undefined;
	//document.getElementById("result").innerHTML = 'finished';
}

startWorker();

document.getElementById('num_h').addEventListener('change', getColors);
document.getElementById('num_l').addEventListener('change', getColors);
document.getElementById('num_c').addEventListener('change', getColors);
document.getElementById('off_x').addEventListener('change', getColors);
document.getElementById('download').addEventListener('click', downloadCss);
