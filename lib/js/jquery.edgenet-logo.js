/**
 * jQuery Plugin to apply the animating Edge Net logo to a DOM element
 * 
 * 
 * Requires paper.js and the edgenet-logo.js
 * https://github.com/paperjs/paper.js 
 * 
 * @author bummzack
 */
(function($, paper) {
	var loadQueue = [];
	var methods = {
		init : function($$options){
			// build main options before element iteration
			var $settings = $.extend( {}, $.fn.edgenetLogo.defaults, $$options);
			// iterate and handle each matched element
			return this.each(function() {
				var $this = $(this);
				$this.data("settings", $settings);
				
				var loadCallback = function(){
					var self = $(this);
					var opts = self.data("settings");
					
					$("#" + opts.svgContainerId).data("loaded", true);
					
					var wi = opts.width == "auto" ? self.width() : parseInt(opts.width);
					var he = opts.height == "auto" ? self.height() : parseInt(opts.height);
					
					var canvas = $("<canvas"+ (opts.paperResize ? " data-paper-resize='true'" : "") +"></canvas>");
					var wrapper = $("<div class='"+ opts.wrapperClass +"'></div>");
					
					wrapper.width(wi).height(he).css("textAlign", "center");
					self.wrap(wrapper);
					self.after(canvas);
					self.hide();
					var fallback = $("<img />");
					fallback.attr("src", opts.logoFallback);
					canvas.append(fallback);
					var scope = paper.setup(canvas[0]);
					
					scope.view.viewSize = new paper.Size(wi, he);
					
					var item = scope.project.importSVG($("#" + opts.svgContainerId + " svg")[0]);
					var logo = new Logo(item, opts.padding, scope);
					
					scope.view.on("frame", function(event){
						logo.update(Math.min(event.delta, 0.1));
					});
					logo.update(0);
					
					scope.view.draw();
				};
				
				var svgC = $("#" + $settings.svgContainerId);
				if(svgC.length == 0){
					$("body").append("<div id='" + $settings.svgContainerId + "'></div>");
					loadQueue.push(this);
					$("#" + $settings.svgContainerId).data("loaded", false).css("display", "none").load($settings.svgLogo, function(){
						while(loadQueue.length > 0){
							loadCallback.call(loadQueue.pop());
						}
						if(typeof $settings.callback == "function"){
							$settings.callback.call(this);
						}
					});
				} else {
					if(!svgC.data("loaded")){
						loadQueue.push(this);
					} else {
						loadCallback.call(this);
					}
				}
			});
		},
		
		destroy : function(){
			return this.each(function() {
				var $this = $(this);
				if($this.data("hasLogo")){
					var settings = $this.data(settings) || $.fn.imageZoom.defaults;
					
					$this.data("hasLogo", false);
				}
			});
		}
	};
	
	$.fn.edgenetLogo = function(method) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || !method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.edgenetLogo' );
		}
	};
	
	// Plugin defaults
	$.fn.edgenetLogo.defaults = {
		// The path to the logo file
		"svgLogo" : "lib/images/EdgeNet-Logo.svg",
		// The path to the fallback image file (if canvas doesn't work)
		"logoFallback" : "lib/images/EdgeNet-Logo-fallback.png",
		// ID of the svg-container (where the logo will be loaded into)
		"svgContainerId" : "SvgContainer",
		// class of the wrapper element
		"wrapperClass" : "logoWrapper",
		// width of the logo container. Either a number or "auto" (which will take the width of the element)
		"width" : "auto",
		// height of the logo container. Either a number or "auto" (which will take the height of the element)
		"height" : "auto",
		// wheter or not to activate paper auto-resize
		"paperResize" : false,
		// svg load callback
		"callback" : null,
		// minimal logo padding (room to move)
		"padding" : 10
	};
})(jQuery, paper);
