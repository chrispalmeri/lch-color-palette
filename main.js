var w, palData;


function showColors() {
  let swatches = document.getElementById('swatches');
  swatches.innerHTML = '';
  
  let numH = document.getElementById('num_h').value;
  let numL = document.getElementById('num_l').value;
  let numC = document.getElementById('num_c').value;

  for(i = 0; i < numL; i++) {
    for(j = 0; j < numH; j++) {
      var bob = document.createElement('div');
      let l = Math.round((i * (100 / numL)) + ((100 / numL) / 2));
      let h = Math.round((j * (360 / numH)) + ((360 / numH) / 2));
      console.log(l, h);
      let c = palData[l][h];

      let adj = c.even + (c.max - c.even) * (numC / 10);
      let col = chroma.lch(99-l, adj, h).hex();
      bob.style.background = col;
      bob.title = col;

      bob.style.gridRow = i + 1;
      swatches.appendChild(bob);
    }
  }
}

function startWorker() {
  if(typeof(Worker) !== "undefined") {
    if(typeof(w) == "undefined") {
      w = new Worker("worker.js");
      //document.getElementById("result").innerHTML = 'loading';
    }

    w.onmessage = function(event) {
      if(event.data.success) {
        stopWorker();
        console.log(event.data.data);
        
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
        
        var data = canvas.toDataURL();
        var myElement = document.getElementById('palette');

        myElement.style.backgroundImage = 'url('+data+')';
        
        var kid = document.getElementById('progress');
        kid.parentElement.removeChild(kid);

        var swatches = document.createElement('div')
        swatches.id = 'swatches';
        document.getElementById('palette').appendChild(swatches);

        palData = event.data.data;
        showColors();
        
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
  w.terminate();
  w = undefined;
  //document.getElementById("result").innerHTML = 'finished';
}

startWorker();

document.getElementById('num_h').addEventListener('change', showColors);
document.getElementById('num_l').addEventListener('change', showColors);
document.getElementById('num_c').addEventListener('change', showColors);