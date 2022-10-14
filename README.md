# lch-color-palette

Generate equidistant color palettes

https://chrispalmeri.github.io/lch-color-palette/

## to do

  * you probably don't need to generate every possible color with clipping data
  * definitley don't need to generate the background image if it isn't seen
  * should factor the logic out of `showColors()` into new function that returns an object
    * then show that, and separately convert to css

previous list

  * vertical slider would be nice
     * or just space the top and bottom even instead of 1/2
  * actually showing the offset moving on the screen would be nice
     * non-issue/unfixable now that circles are hidden

# local sever

```bash
python -V
# Or you might have the py command available,
# in which case try py -V

# If Python version returned above is 3.X
python3 -m http.server
# On windows try "python" instead of "python3", or "py -3"

# If Python version returned above is 2.X
python -m SimpleHTTPServer
```
