# Animated Logo integration guide

## Requirements

The animated logo relies on the [paper.js](http://paperjs.org/) and [jQuery](http://jquery.com/) libraries. It's advisable to use the [Google hosted jQuery library](https://developers.google.com/speed/libraries/devguide#jquery). The other required files can be found in the GitHub repository in the [`lib` folder](https://github.com/edgenet/edgenet.github.io/tree/master/lib)

 - `js/paper-full.min.js` The paper js library.
 - `js/edgenet-logo.js` The script that brings the logo to life.
 - `js/jquery.edgenet-logo.js` Simple jQuery plugin to easily integrate the logo into your site.
 - `images/edgenet.svg` The svg logo file that will be animated
 - `images/edgenet.png` A static fallback image in case canvas isn't supported (optional)

## Adding the required JavaScript files

The JavaScript files should be added right before the closing `</body>` tag.
Example:

```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<script type="text/javascript" src="lib/js/paper-full.min.js"></script>
<script type="text/javascript" src="lib/js/edgenet-logo.js"></script>
<script type="text/javascript" src="lib/js/jquery.edgenet-logo.js"></script>
```

## The edgenet-logo jQuery plugin

The edgenet-logo plugin allows you to replace certain DOM elements with the animated edenet-logo. So you could place a static image or a title within your site and have it replaced with the animated logo.

Here's an example using a static image that will be replaced with the logo.

```html
<img src="lib/images/edgenet.png" class="edgenet-logo" />
```

Then add the following JavaScript right before the closing `</body>` tag.

```html
<script type="text/javascript">
(function($){
    $(function(){
        $(".edgenet-logo").edgenetLogo({
        	// tell the plugin where it can find the edgenet logo
            "svgLogo" : "images/edgenet.svg"
        });
    });
})(jQuery);
</script>
```

This will then replace the static image with the animated logo. See this [demo page](http://theedg.es/logo/demo.html).

**Important:**
By default, the plugin will create a canvas with exactly the same dimensions as the DOM element and try to scale the logo within these bounds. If you apply this to very small DOM elements (either in height or width), the logo might not show up at all.
Also make sure your path to the SVG file is correct.

### Plugin options

<table class = 'data'>
	<thead>
		<tr>
			<th width="16%">Key</th>
			<th width="30%">Default</th>
			<th width="54%">Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>svgLogo</td>
			<td>"lib/images/edgenet.svg"</td>
			<td>The path to the logo SVG file.</td>
		</tr>
		<tr>
			<td>logoFallback</td>
			<td>"lib/images/edgenet.png"</td>
			<td>Fallback image file in case the browser doesn't support the `canvas` element</td>
		</tr>
		<tr>
			<td>width</td>
			<td>"auto"</td>
			<td>The desired width for the canvas. Either a numeric value (pixels) or "auto" which will result in the same size as the original DOM element</td>
		</tr>
		<tr>
			<td>height</td>
			<td>"auto"</td>
			<td>The desired height for the canvas. Either a numeric value (pixels) or "auto" which will result in the same size as the original DOM element</td>
		</tr>
		<tr>
			<td>padding</td>
			<td>10</td>
			<td>Inner padding (it's advisable to add some space for the logo elements to move around, otherwise they will get cropped)</td>
		</tr>
		<tr>
			<td>wrapperClass</td>
			<td>"logoWrapper"</td>
			<td>CSS class that will be added to the wrapper (wraps the animated logo)</td>
		</tr>
	</tbody>
</table>