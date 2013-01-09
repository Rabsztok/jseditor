$(document).ready(function(){
	initTable();
	main();
})

function initTable() {
	var editTable = document.getElementById('editTable');
    for (var i = 0; i < 10; i++) {
        var row = document.createElement('tr')
        editTable.appendChild(row);
        for (var j = 0; j < 10; j++) {
            var col = document.createElement('td')
            row.appendChild(col);
        };
    };
    wallSegments = 0;
}
function main() {
    var canvas = document.getElementById("canvas");
    var gl = getWebGLContext(canvas);
    if (!gl) {
        return;
    }
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    vertexShader = createShaderFromScriptElement(gl, "3d-vertex-shader");
    fragmentShader = createShaderFromScriptElement(gl, "3d-fragment-shader");
    program = createProgram(gl, [vertexShader, fragmentShader]);
    gl.useProgram(program);
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var colorLocation = gl.getAttribLocation(program, "a_color");
    var matrixLocation = gl.getUniformLocation(program, "u_matrix");
    setBuffers();
    
    universalScale = 40;
	var translation = [canvas.width/2 - universalScale*2, canvas.height/2 - universalScale, 150];
    var rotation = [degToRad(120), degToRad(0), degToRad(245)];
    //var rotation = [degToRad(0), degToRad(0), degToRad(0)];
    var scale = [universalScale, universalScale, universalScale];
    drawScene();
    
    $("#scaleZ").gmanSlider({
        value: scale[2],
        slide: updateScale(2),
        min: 1,
        max: universalScale*5,
        step: 0.01,
        precision: 2
    });
    $("#angleX").gmanSlider({
        value: radToDeg(rotation[0]),
        slide: updateRotation(0),
        max: 360
    });
    $("#angleY").gmanSlider({
        value: radToDeg(rotation[1]),
        slide: updateRotation(1),
        max: 360
    });
    $("#angleZ").gmanSlider({
        value: radToDeg(rotation[2]),
        slide: updateRotation(2),
        max: 360
    });
	$('#editTable td').click(function(){
		$(this).toggleClass('checked');
		setBuffers();
	    drawScene();
	});
	
	function setBuffers() {
		var buffer = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	    gl.enableVertexAttribArray(positionLocation);
	    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
	    setGeometry(gl);
	    
	    var buffer = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	    gl.enableVertexAttribArray(colorLocation);
	    gl.vertexAttribPointer(colorLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);
	    setColors(gl);
	}
	
	function updateScale(index) {
	    return function (event, ui) {
	        scale[index] = ui.value;
	        drawScene();
	    }
	}

    function updateRotation(index) {
        return function (event, ui) {
            var angleInDegrees = ui.value;
            var angleInRadians = angleInDegrees * Math.PI / 180;
            rotation[index] = angleInRadians;
            drawScene();
        }
    }

    function updateScale(index) {
        return function (event, ui) {
            scale[index] = ui.value;
            drawScene();
        }
    }
	
    function drawScene() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        var projectionMatrix = make2DProjection(canvas.width, canvas.height, canvas.width);
        var translationMatrix = makeTranslation(translation[0], translation[1], translation[2]);
        var rotationXMatrix = makeXRotation(rotation[0]);
        var rotationYMatrix = makeYRotation(rotation[1]);
        var rotationZMatrix = makeZRotation(rotation[2]);
        var scaleMatrix = makeScale(scale[0], scale[1], scale[2]);
        var matrix = matrixMultiply(scaleMatrix, rotationZMatrix);
        matrix = matrixMultiply(matrix, rotationYMatrix);
        matrix = matrixMultiply(matrix, rotationXMatrix);
        matrix = matrixMultiply(matrix, translationMatrix);
        matrix = matrixMultiply(matrix, projectionMatrix);
        gl.uniformMatrix4fv(matrixLocation, false, matrix);
        gl.drawArrays(gl.TRIANGLES, 0, wallSegments * 6 * 6);
    }
}


// Funkcje pomocnicze

function make2DProjection(width, height, depth) {
    return [2 / width, 0, 0, 0, 0, -2 / height, 0, 0, 0, 0, 2 / depth, 0, -1, 1, 0, 1, ];
}

function makeTranslation(tx, ty, tz) {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1];
}

function makeXRotation(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
};

function makeYRotation(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
};

function makeZRotation(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, ];
}

function makeScale(sx, sy, sz) {
    return [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1, ];
}

function matrixMultiply(a, b) {
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    return [a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30, a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31, a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32, a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33, a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30, a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31, a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32, a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33, a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30, a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31, a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32, a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33, a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30, a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31, a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32, a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33];
}

function setGeometry(gl) {
    wallSegments = 0;
    var vertices = new Array();     
    walls = []; while(walls.push([]) < 10);
	for(var i=0,isize=$('#editTable tr').length; i<isize; i++){
	  var row = $('#editTable tr');
	  for(var j=0,jsize=row.children().length; j<jsize; j++){
		walls[i][j] = $('#editTable tr:nth('+i+') td:nth('+j+')').hasClass('checked');
		if(walls[i][j]){
    		wallSegments++;
			vertices = vertices.concat(wallSegment(i,j));
		}
	  };
	};
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}
function wallSegment(x,y){
	box = [
    		 //top
             0,   0,  0,
             0,  1,  0,
             1,  0,  0,
             1, 1,  0,
             1,  0,  0,
              0, 1,  0,
              
    		 //bottom
             0,  1, 1,
             0,   0, 1,
             1,  0, 1,
             1, 1, 1,
              0, 1, 1,
             1,  0, 1,
              
             //1
             0,  0,  0,
             1,  0, 0,
             0,  0,  1,
             1,  0, 0,
             1,  0, 1,
             0,  0,  1,
              
             //2
             1,  1, 0,
             0,  1,  0,
             0,  1,  1,
             1,  1, 0,
             0,  1,  1,
             1,  1, 1,
              
             //3
             0,  1, 0,
             0,  0,  0,
             0,  0,  1,
             0,  1, 0,
             0,  0,  1,
             0,  1, 1,
              
             //4
             1,  0,  0,
             1,  1, 0,
             1,  0,  1,
             1,  1, 0,
             1,  1,  1,
             1,   0,  1,];
             
	var wallSegment = box;
	for (var i=0; i < wallSegment.length; i+=1) {
	  	if((i)%3 == 0){
			wallSegment[i] += x
	  	}
	  	if((i-1)%3 == 0){
			wallSegment[i] += y
	  	}
	};
	return wallSegment;
}
function setColors(gl) {
	var verticeColors = [
			 //top
             200,   200,  200,
             0,  200,  0,
             200,  0,  0,
             200, 200,  0,
             200,  0,  0,
              0, 200,  0,
              
    		 //bottom
             0,   0, 30,
             0,  30, 30,
             30,  0, 30,
             30, 30, 300,
             30,  0, 300,
              0, 30, 300,
              
             //1
             0,   0,  0,
             0,   0, 30,
             30,  0,  0,
             30, 30,  900,
             30,  0,  900,
              0, 30,  900,
              
             //2
             0,   0, 30,
             0,  30, 30,
             30,  0, 30,
             30, 30, 30,
             30,  0, 30,
              0, 30, 30,
              
             //1
             0,   0,  0,
             0,   0, 30,
             30,  0,  0,
             30, 30,  900,
             30,  0,  900,
              0, 30,  900,
              
             //2
             0,   0, 30,
             0,  30, 30,
             30,  0, 30,
             30, 30, 30,
             30,  0, 30,
              0, 30, 30, ];
    var vertices = new Array();
    for (var i=0; i < wallSegments; i++) {
      vertices = vertices.concat(verticeColors);
    };
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(vertices), gl.STATIC_DRAW);
}

function radToDeg(r) {
    return r * 180 / Math.PI;
}

function degToRad(d) {
    return d * Math.PI / 180;
}

