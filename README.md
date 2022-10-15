# lch-color-palette

Generate equidistant color palettes

https://chrispalmeri.github.io/lch-color-palette/

## to do

  * add a comment to the css with link and config used
  * refactor worker now that it is all in the same place
    * change format of returned data
    * probably should generate only the colors requested
    * if fast enough, no progress

## later

  * some kind of css color names matchup
  * horizontal swatch layout, with gaps, vertically scrollable?
  * add gray, and black and white
  * ability to turn down chroma, or up more evenly ignoring clipping?
  * type module
  * favicon and stuff
  * local copy of chroma.js
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
