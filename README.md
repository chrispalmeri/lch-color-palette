# lch-color-palette

Generate equidistant color palettes

https://chrispalmeri.github.io/lch-color-palette/

## to do

  * could move names into worker, maybe even row/column numbers
  * use request animation frame
  * you might not _need_ to be using a worker anymore
  * horizontal swatch layout, with gaps, vertically scrollable?
  * move sidebar to left side?
  * ability to turn down chroma, or up more evenly ignoring clipping?
  * general metadata stuff
  * move to unrowdy and netlify if nice enough

# local web sever

```bash
# Check Python version
python -V
# Or you might have the py command available,
# in which case try py -V

# If Python version returned above is 3.X
python3 -m http.server
# On windows try "python" instead of "python3", or "py -3"

# If Python version returned above is 2.X
python -m SimpleHTTPServer
```
