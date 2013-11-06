// controls movement of one single bubble
var BubbleController = paper.Base.extend({
	_node: null,
	_origin: null,
	_wRadius: 16,
	_wDist: new paper.Point(10, 20),
	_wJitter: 1.5,
	_wTarget: null,
	_velocity: null,
	_maxSpeed: 6,
	_pull: 0,
	_bg: null,
	
	initialize: function BubbleController(node){
		this._node = node;
		this._origin = node.position.clone();
		this._wTarget = this._origin.clone();
		this._velocity = new paper.Point();
	},
	
	update: function(dt){
		var d = this._node.position.subtract(this._origin);
		var dx = d.x < 0 ? -1 : 1;
		var dy = d.y < 0 ? -1 : 1;
		
		var t = this._wTarget.add([
			(this._wJitter * (Math.random() * 2 - 1)) - (Math.pow(d.x / this._wDist.x * this._pull, 2) * dx), 
			(this._wJitter * (Math.random() * 2 - 1)) - (Math.pow(d.y / this._wDist.y * this._pull, 2) * dy)
		]);
		
		
		t = t.normalize().multiply(this._wRadius);
		
		this._wTarget = t;
		this._velocity = this._velocity.add(t.multiply(dt));
		if(this._velocity.getLength(true) > this._maxSpeed * this._maxSpeed){
			this._velocity = this._velocity.normalize(this._maxSpeed);
		}
		
		this._node.position = this._node.position.add(this._velocity.multiply(dt));
		if(this._bg){
			this._bg.position = this._node.position;
		}
	},
	
	getPull: function(){
		return this._pull;
	},
	
	setPull: function(value){
		this._pull = value;
	},
	
	getNode: function(){
		return this._node;
	},
	
	setNode: function(value){
		this._node = value;
	},
	
	getOrigin: function(){
		return this._origin;
	},
	
	setOrigin: function(value){
		this._origin = value;
	},
	
	getBg: function(){
		return this._bg;
	},
	
	setBg: function(value){
		this._bg = value;
	}
});

// The animated logo class.
// Initializes the logo parts and updates animation
var Logo = paper.Base.extend({
	_node: null,
	_radius: 0,
	_bubbles: null,
	_conn: null,
	_scope: null,
	_frame: 0,
	_minPadding: 0,
	initialize: function Logo(svgNode, padding, scope){
		this._scope = scope || paper;
		this._minPadding = padding || 0;
		
		var n = this._node = svgNode;
		var bubbles = this._bubbles = [];
		var lastPos = null;
		var firstPos = null;
		for(var len = n.children.length - 1, i = len; i >= 0; i--){
			var firstChar = n.children[i].name.substr(0,1);
			if(firstChar == "c"){
				// Remove connecting elements from the logo.
				// These will be created dynamically.
				n.children[i].remove();
			} else if(firstChar == "b"){
				// Store all bubbles (circles) in an array
				bubbles.push(new BubbleController(n.children[i]));
				
				// Keep first and last bubble position for later
				if(lastPos == null){
					lastPos = n.children[i].position;
				} else {
					firstPos = n.children[i].position;
				}
				this._radius = Math.max(this._radius, n.children[i].bounds.width * 0.5);
			}
		}
		
		var bg = new paper.Group();
		bg.name = "cbg";
		this._node.appendBottom(bg);
		
		// Straighten the bubble origin positions. 
		// Set bubble pull and separate bubble character from the background
		for(var i = 0, len = bubbles.length; i < len; i++){
			var y = lastPos.y;
			var x = lastPos.x - (lastPos.x - firstPos.x) / (len-1) * i;
			bubbles[i].origin.set(x,y);
			
			var c = new paper.Path.Circle({
				style: bubbles[i].node.style,
				radius: this._radius
			});
			bubbles[i].bg = c;
			bg.addChild(c);
			bubbles[i].node.children[0].visible = false;
			bubbles[i].node.children[0].opacity = 0;
			bubbles[i].pull = ((bubbles.length - i) / bubbles.length) * 0.6 + 0.4;
		}
		
		this._conn = new paper.Group();
		this._conn.name = "connectors";
		this._node.appendBottom(this._conn);
		
		var self = this;
		this._scope.view.on("resize", function(){
			self.resize();
		});
		
	},
	
	resize: function(){
		var size = this._scope.view.viewSize;
		var margin = Math.max(Math.min(size.width * 0.15, size.height * 0.15), this._minPadding) * 2;
		
		var bnds = this._node.bounds;
		var scale = Math.min(
			(size.width - margin) / bnds.width, 
			(size.height - margin) / bnds.height
		);
		this._node.scale(scale);
		this._node.position = [size.width * 0.5, size.height * 0.5];
	},
	
	update: function(dt){
		for(var i = 0, len = this._bubbles.length; i < len; i++){
			this._bubbles[i].update(dt);
		}
		this._conn.removeChildren();
		for(var i = 0, len = this._bubbles.length - 1; i < len; i++){
			var connection = this._createConnection(this._bubbles[i].node, this._bubbles[i+1].node, 0.45, Math.PI, this._radius * 3.6);
			if(connection){
				this._conn.appendTop(connection);
			}
		}
		
		if(this._frame == 0){
			this.resize();
			this._frame++;
		}
	},
	
	// Metaball connection script, taken straight from the paper.js examples:
	// http://paperjs.org/examples/meta-balls/
	_createConnection: function (ball1, ball2, v, handle_len_rate, maxDistance) {
		var center1 = ball1.position;
		var center2 = ball2.position;
		var radius1 = ball1.bounds.width / 2;
		var radius2 = ball2.bounds.width / 2;
		var pi2 = Math.PI / 2;
		var d = center1.getDistance(center2);
		var u1, u2;

		if (radius1 == 0 || radius2 == 0)
			return;

		if (d > maxDistance || d <= Math.abs(radius1 - radius2)) {
			return;
		} else if (d < radius1 + radius2) { // case circles are overlapping
			u1 = Math.acos((radius1 * radius1 + d * d - radius2 * radius2) /
					(2 * radius1 * d));
			u2 = Math.acos((radius2 * radius2 + d * d - radius1 * radius1) /
					(2 * radius2 * d));
		} else {
			u1 = 0;
			u2 = 0;
		}
		
		var angle1 = center2.subtract(center1).getAngleInRadians();
		var angle2 = Math.acos((radius1 - radius2) / d);
		var angle1a = angle1 + u1 + (angle2 - u1) * v;
		var angle1b = angle1 - u1 - (angle2 - u1) * v;
		var angle2a = angle1 + Math.PI - u2 - (Math.PI - u2 - angle2) * v;
		var angle2b = angle1 - Math.PI + u2 + (Math.PI - u2 - angle2) * v;
		var p1a = center1.add(this._getVector(angle1a, radius1));
		var p1b = center1.add(this._getVector(angle1b, radius1));
		var p2a = center2.add(this._getVector(angle2a, radius2));
		var p2b = center2.add(this._getVector(angle2b, radius2));

		// define handle length by the distance between
		// both ends of the curve to draw
		var totalRadius = (radius1 + radius2);
		var d2 = Math.min(v * handle_len_rate, p1a.subtract(p2a).length / totalRadius);

		// case circles are overlapping:
		d2 *= Math.min(1, d * 2 / (radius1 + radius2));

		radius1 *= d2;
		radius2 *= d2;

		var path = new paper.Path({
			segments: [p1a, p2a, p2b, p1b],
			style: ball1.style,
			closed: true
		});
		var segments = path.segments;
		segments[0].handleOut = this._getVector(angle1a - pi2, radius1);
		segments[1].handleIn = this._getVector(angle2a + pi2, radius2);
		segments[2].handleOut = this._getVector(angle2b - pi2, radius2);
		segments[3].handleIn = this._getVector(angle1b + pi2, radius1);
		return path;
	},
	
	_getVector: function (radians, length) {
		return new paper.Point({
			// Convert radians to degrees:
			angle: radians * 180 / Math.PI,
			length: length
		});
	}
});