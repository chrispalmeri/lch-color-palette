var w;

function startWorker() {
  if(typeof(Worker) !== "undefined") {
    if(typeof(w) == "undefined") {
      w = new Worker("worker.js");
      document.getElementById("result").innerHTML = 'loading';
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
            ctx.fillStyle = c;
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

        for(i=0;i<5;i++) {
          for(j=0;j<10;j++) {
            var bob = document.createElement('div')
            //bob.style.background = '#f00';
            bob.style.gridRow = i;
            swatches.appendChild(bob);
          }
        }
        
      } else {
        //document.getElementById("result").innerHTML = event.data;
        document.getElementById('progress').value = event.data;
      }
    };
  } else {
    document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Workers...";
  }
}

function stopWorker() { 
  w.terminate();
  w = undefined;
  document.getElementById("result").innerHTML = 'finished';
}

startWorker();