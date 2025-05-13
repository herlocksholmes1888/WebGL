const canvas = document.querySelector('canvas');
        const gl = canvas.getContext('webgl');

        if (!gl) throw new Error('WebGL não suportado.');

        const positions = [
            0, 0, 0,  // V1
            5, 0, 0,  // V2
            5, 5, 0,  // V3
            0, 5, 0,  // V4
            0, 0, 5,  // V5
            5, 0, 5,  // V6
            5, 5, 5,  // V7
            0, 5, 5   // V8
        ];

        const indices = [
            0, 1, 2,  0, 2, 3,  // face frontal
            4, 5, 6,  4, 6, 7,  // face traseira
            0, 1, 5,  0, 5, 4,  // face inferior
            3, 2, 6,  3, 6, 7,  // face superior
            1, 2, 6,  1, 6, 5,  // face direita
            0, 3, 7,  0, 7, 4   // face esquerda
        ];

        const colors = [
            1, 0, 0, 1,   // V1 - vermelho
            1, 0, 1, 1,   // V2 - magenta
            1, 0, 0, 1,   // V3 - vermelho
            1, 0, 1, 1,   // V4 - magenta
            1, 0, 0, 1,   // V5 - ...
            1, 0, 1, 1,   // V6 - ...
            1, 0, 0, 1,   // V7 - ...
            1, 0, 1, 1    // V8 - ...
        ];

        // Buffers
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        // Shaders
        const vertexShaderSource = `
            attribute vec3 position;
            attribute vec4 color;
            uniform mat4 model;
            uniform mat4 view;
            uniform mat4 projection;
            varying vec4 vColor;
            void main() {
                gl_Position = projection * view * model * vec4(position, 1.0);
                vColor = color;
            }
        `;
        const fragmentShaderSource = `
            precision mediump float;
            varying vec4 vColor;
            void main() {
                gl_FragColor = vColor;
            }
        `;

        function createShader(type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        }

        const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        const positionLocation = gl.getAttribLocation(program, "position");
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLocation);

        const colorLocation = gl.getAttribLocation(program, "color");
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorLocation);

        // Matrizes com glMatrix
        const modelMatrix = mat4.create();
        mat4.rotateY(modelMatrix, modelMatrix, Math.PI / 6); 
        mat4.rotateX(modelMatrix, modelMatrix, Math.PI / 6);

        const viewMatrix = mat4.create();
        mat4.translate(viewMatrix, viewMatrix, [-2.5, -2.5, -15]);

        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100);

        // Uniforms
        const modelLoc = gl.getUniformLocation(program, "model");
        const viewLoc = gl.getUniformLocation(program, "view");
        const projLoc = gl.getUniformLocation(program, "projection");

        gl.uniformMatrix4fv(modelLoc, false, modelMatrix);
        gl.uniformMatrix4fv(viewLoc, false, viewMatrix);
        gl.uniformMatrix4fv(projLoc, false, projectionMatrix);

        // Render
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
