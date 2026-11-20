// =========================================================
// WebGL & Canvas Sphere Renderer for Solar System Planets
// =========================================================

class PlanetRenderer {
  constructor(canvas, textureUrl, options = {}) {
    this.canvas = canvas;
    this.textureUrl = textureUrl;
    this.options = Object.assign({
      tilt: 0,
      rotationSpeed: 0.0015,
      atmosphereColor: [0.1, 0.4, 0.8],
      hasAtmosphere: false,
      isSaturn: false,
      isUranus: false,
      saturationFactor: 1.0
    }, options);

    this.gl = null;
    this.program = null;
    this.texture = null;
    this.rotation = 0;
    this.isVisible = false;
    this.animId = null;

    this.init();
  }

  init() {
    // Cap devicePixelRatio at 2
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(rect.width || 300, 300);
    const height = Math.max(rect.height || 300, 300);
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;

    try {
      this.gl = this.canvas.getContext('webgl', { alpha: true, antialias: true }) ||
                this.canvas.getContext('experimental-webgl', { alpha: true, antialias: true });
    } catch(e) {}

    if (!this.gl) {
      console.warn('WebGL not supported for planet, falling back to CSS.');
      const fallback = this.canvas.nextElementSibling;
      if (fallback) fallback.classList.remove('hidden');
      return;
    }

    this.initShaders();
    this.initBuffers();
    this.loadTexture();

    // IntersectionObserver for lazy loading & pausing off-screen
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
        if (this.isVisible) {
          this.start();
        } else {
          this.stop();
        }
      });
    }, { rootMargin: '200px' });

    this.observer.observe(this.canvas);
  }

  initShaders() {
    const vsSource = `
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec2 vUv;
      uniform sampler2D uSampler;
      uniform float uRotation;
      uniform float uTilt;
      uniform vec3 uAtmosphere;
      uniform bool uHasAtmo;
      uniform bool uIsSaturn;
      uniform bool uIsUranus;
      uniform float uSaturation;

      const float PI = 3.14159265359;

      void main() {
        // Centered coordinates [-1, 1]
        vec2 p = vUv * 2.0 - 1.0;
        float r = length(p);

        // Planet sphere radius: Saturn scaled to 0.44 so rings fit entirely within [-1, 1]
        float sphereRadius = uIsSaturn ? 0.44 : (uIsUranus ? 0.70 : 0.78);

        // Shadow / Light direction (sunlight from top-right)
        vec3 lightDir = normalize(vec3(0.65, 0.45, 0.60));

        // Saturn ring rendering (passing in front of and behind planet, completely unclipped)
        if (uIsSaturn) {
          float ringAngle = radians(-22.0);
          mat2 rot = mat2(cos(ringAngle), -sin(ringAngle), sin(ringAngle), cos(ringAngle));
          vec2 ringP = rot * p;
          ringP.y *= 3.6; // flatten ring plane
          float ringDist = length(ringP);

          float rInner = 0.56;
          float rOuter = 0.94;

          // Pixel within Saturn ring boundary
          if (ringDist >= rInner && ringDist <= rOuter) {
            bool ringInFront = (ringP.y <= 0.0);
            bool onSphere = (r <= sphereRadius);

            if (!onSphere || ringInFront) {
              // Multi-band ring with Cassini division gap (~0.76 to 0.79)
              float band = sin(ringDist * 65.0) * 0.18 + 0.78;
              if (ringDist > 0.76 && ringDist < 0.79) {
                band *= 0.12; // Cassini division
              }
              vec3 ringCol = vec3(0.85, 0.76, 0.60) * band;

              // Planet shadow cast onto back half of rings
              float ringLighting = 0.95;
              if (!ringInFront && length(p) < sphereRadius * 1.06) {
                ringLighting = 0.12;
              }
              ringCol *= ringLighting;

              float ringAlpha = 0.88 * smoothstep(rOuter, rOuter - 0.03, ringDist) * smoothstep(rInner, rInner + 0.03, ringDist);
              gl_FragColor = vec4(ringCol, ringAlpha);
              return;
            }
          }
        }

        // Uranus thin faint ring (rendered with depth: behind planet vs in front)
        if (uIsUranus) {
          float uAngle = radians(82.0); // Spins on its side
          mat2 uRot = mat2(cos(uAngle), -sin(uAngle), sin(uAngle), cos(uAngle));
          vec2 uRingP = uRot * p;
          uRingP.y *= 5.2;
          float uRingDist = length(uRingP);
          float uInner = 0.78;
          float uOuter = 0.88;

          if (uRingDist >= uInner && uRingDist <= uOuter) {
            bool uRingInFront = (uRingP.y <= 0.0);
            bool onSphere = (r <= sphereRadius);

            if (!onSphere || uRingInFront) {
              float uAlpha = 0.30 * smoothstep(uOuter, uOuter - 0.02, uRingDist) * smoothstep(uInner, uInner + 0.02, uRingDist);
              if (onSphere && uRingInFront) {
                uAlpha *= 0.7; // subtle over disk
              }
              gl_FragColor = vec4(0.55, 0.82, 0.88, uAlpha);
              return;
            }
          }
        }

        if (r > sphereRadius) {
          // Soft atmospheric glow with gentle falloff (no visible hard edge)
          if (uHasAtmo && r <= sphereRadius * 1.06) {
            float atmoFactor = smoothstep(sphereRadius * 1.06, sphereRadius, r) * 0.22;
            gl_FragColor = vec4(uAtmosphere, atmoFactor);
            return;
          }
          discard;
        }

        // Inside sphere: compute normal on 3D sphere
        float z = sqrt(sphereRadius * sphereRadius - p.x * p.x - p.y * p.y);
        vec3 normal = normalize(vec3(p.x, p.y, z));

        // Apply axial tilt
        float tiltAngle = radians(uTilt);
        mat3 tiltMat = mat3(
          cos(tiltAngle), sin(tiltAngle), 0.0,
          -sin(tiltAngle), cos(tiltAngle), 0.0,
          0.0, 0.0, 1.0
        );
        vec3 tiltedNorm = tiltMat * normal;

        // Spherical UV mapping with continuous rotation
        float u = atan(tiltedNorm.x, tiltedNorm.z) / (2.0 * PI) + 0.5 + uRotation;
        float v = asin(clamp(tiltedNorm.y, -1.0, 1.0)) / PI + 0.5;
        u = fract(u);

        vec4 texColor = texture2D(uSampler, vec2(u, v));

        // Adjust saturation (e.g. tone down electric blue for Neptune)
        if (uSaturation < 0.99) {
          float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
          texColor.rgb = mix(vec3(gray), texColor.rgb, uSaturation);
          texColor.rgb *= vec3(0.82, 0.90, 0.98); // deep oceanic blue tone
        }

        // Diffuse lighting + Terminator shadow (night side completely darkened)
        float diff = max(dot(normal, lightDir), 0.0);
        float terminator = smoothstep(-0.04, 0.22, dot(normal, lightDir));
        float ambient = 0.03;

        // Saturn ring shadow cast onto planet sphere
        if (uIsSaturn) {
          float ringAngle = radians(-22.0);
          mat2 rot = mat2(cos(ringAngle), -sin(ringAngle), sin(ringAngle), cos(ringAngle));
          vec2 shadowP = rot * p;
          if (shadowP.y > -0.10 && shadowP.y < 0.04) {
            terminator *= 0.35; // Ring shadow band on planet surface
          }
        }

        // Limb darkening
        float fresnel = 1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0);
        fresnel = pow(fresnel, 2.5);

        vec3 litColor = texColor.rgb * (ambient + diff * 0.95);
        if (uHasAtmo) {
          litColor += uAtmosphere * fresnel * 0.25 * terminator;
        }

        gl_FragColor = vec4(litColor, 1.0);
      }
    `;

    const gl = this.gl;
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);

    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);
    gl.useProgram(this.program);
  }

  initBuffers() {
    const gl = this.gl;
    const quad = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(this.program, 'aPosition');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  }

  loadTexture() {
    const gl = this.gl;
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    // Initial placeholder 1x1 dark pixel
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 25, 35, 255]));

    const isPowerOf2 = (v) => (v & (v - 1)) === 0;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

      let source = img;
      // If either dimension is not power of two, redraw onto an offscreen canvas
      if (!isPowerOf2(img.naturalWidth) || !isPowerOf2(img.naturalHeight)) {
        const offscreen = document.createElement('canvas');
        offscreen.width = 2048;
        offscreen.height = 1024;
        const ctx = offscreen.getContext('2d');
        ctx.drawImage(img, 0, 0, 2048, 1024);
        source = offscreen;
      }

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

      // WebGL 1 NPOT-safe settings: CLAMP_TO_EDGE and LINEAR filter with no mipmaps
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      this.render();
    };
    img.onerror = () => {
      console.warn("Failed loading texture: " + this.textureUrl + ", activating CSS fallback");
      const fallback = this.canvas.nextElementSibling;
      if (fallback) fallback.classList.remove('hidden');
    };
    img.src = this.textureUrl;
  }

  render() {
    if (!this.gl || !this.program) return;
    const gl = this.gl;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);

    gl.uniform1f(gl.getUniformLocation(this.program, 'uRotation'), this.rotation);
    gl.uniform1f(gl.getUniformLocation(this.program, 'uTilt'), this.options.tilt);
    gl.uniform3fv(gl.getUniformLocation(this.program, 'uAtmosphere'), this.options.atmosphereColor);
    gl.uniform1i(gl.getUniformLocation(this.program, 'uHasAtmo'), this.options.hasAtmosphere ? 1 : 0);
    gl.uniform1i(gl.getUniformLocation(this.program, 'uIsSaturn'), this.options.isSaturn ? 1 : 0);
    gl.uniform1i(gl.getUniformLocation(this.program, 'uIsUranus'), this.options.isUranus ? 1 : 0);
    gl.uniform1f(gl.getUniformLocation(this.program, 'uSaturation'), this.options.saturationFactor);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(gl.getUniformLocation(this.program, 'uSampler'), 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      const loop = () => {
        if (!this.isRunning) return;
        this.rotation += this.options.rotationSpeed;
        this.render();
        this.animId = requestAnimationFrame(loop);
      };
      this.animId = requestAnimationFrame(loop);
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }
}

window.PlanetRenderer = PlanetRenderer;
