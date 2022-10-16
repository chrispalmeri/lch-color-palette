# lch-color-palette

Generate equidistant color palettes

https://chrispalmeri.github.io/lch-color-palette/

## notes

used to have a bug I think, roughly lightness -1, so colors will not match exactly
to old version, but should look similar visually, other than 1% brighter overall

## to do

  * add a comment to the css with link and config used
  * refactor worker now that it is all in the same place
    * change format of returned data
    * so many loops
    * also some constants can move out of loops
    * if fast enough, no progress

## later

  * some kind of css color names matchup
  * horizontal swatch layout, with gaps, vertically scrollable?
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
