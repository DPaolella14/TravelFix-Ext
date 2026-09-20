/**
 * TravelFix 3D Globe Engine
 * Powered by Three.js with authentic NASA satellite Earth textures,
 * realistic night lights, normal maps, dynamic multi-tier LOD zoom (Hubs, Cities, Towns),
 * interactive pins, smooth fly-to camera animations, and dynamic flight arcs.
 */

import { esc } from './escape.js';

export class TravelFixGlobe {
  constructor(containerElement, onSelectDestination, onAltitudeChange) {
    this.container = containerElement;
    this.onSelectDestination = onSelectDestination;
    this.onAltitudeChange = onAltitudeChange;

    this.destinations = [];
    this.pins = [];
    this.flightArcs = [];
    this.radius = 100;
    this.isAutoRotating = true;
    this.targetRotation = null;
    this.targetCameraDistance = null;
    this.isFlying = false;
    this.tooltipEl = document.getElementById('globe-pin-tooltip');

    // LOD Tiers: 'orbit' (>205), 'regional' (145-205), 'local' (<145)
    this.currentTier = 'orbit';

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    this.camera.position.set(0, 45, 280);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // OrbitControls with close-up zoom capability
    if (window.THREE && window.THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.06;
      this.controls.minDistance = 106; // Allows intimate zoom right down to town level!
      this.controls.maxDistance = 450;
      this.controls.rotateSpeed = 0.55;
      this.controls.zoomSpeed = 0.85;
      this.controls.enablePan = false;
    }

    // Starfield Background
    this.createStarfield();

    // Earth Sphere with Authentic NASA Textures
    this.createEarth();

    // Atmospheric Glow Halo
    this.createAtmosphere();

    // Lighting
    this.setupLighting();

    // Raycaster for pin interactions
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Event Listeners
    this.bindEvents();

    // Start Render Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    // Ambient light with midnight blue tint
    this.ambientLight = new THREE.AmbientLight(0x233554, 1.4);
    this.scene.add(this.ambientLight);

    // Sunlight illuminating Earth
    this.sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    this.sunLight.position.set(350, 180, 250);
    this.scene.add(this.sunLight);

    // Subtle cyan backlight for edge definition
    this.rimLight = new THREE.DirectionalLight(0x00f2fe, 0.7);
    this.rimLight.position.set(-350, -100, -250);
    this.scene.add(this.rimLight);
  }

  createStarfield() {
    const starCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const r = 850 + Math.random() * 850;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const brightness = 0.45 + Math.random() * 0.55;
      colors[i * 3] = brightness * 0.85;
      colors[i * 3 + 1] = brightness * 0.95;
      colors[i * 3 + 2] = brightness;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);
  }

  createEarth() {
    this.earthGroup = new THREE.Group();
    this.scene.add(this.earthGroup);

    const earthGeo = new THREE.SphereGeometry(this.radius, 64, 64);
    const textureLoader = new THREE.TextureLoader();

    // Load authentic NASA satellite texture
    const earthTexture = textureLoader.load('assets/textures/earth-dark.jpg', () => {
      this.renderer.render(this.scene, this.camera);
    });
    earthTexture.anisotropy = 8;

    // Authentic NASA Normal Map for 3D mountain relief
    const normalTexture = textureLoader.load('assets/textures/earth-normal.jpg');

    // Authentic NASA night lights texture
    const lightsTexture = textureLoader.load('assets/textures/earth-lights.png');

    this.earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.85, 0.85),
      emissiveMap: lightsTexture,
      emissive: new THREE.Color(0xfff0b3),
      emissiveIntensity: 0.85,
      roughness: 0.7,
      metalness: 0.1
    });

    this.earthMesh = new THREE.Mesh(earthGeo, this.earthMaterial);
    this.earthGroup.add(this.earthMesh);

    // Realistic Cloud Layer
    const cloudGeo = new THREE.SphereGeometry(this.radius + 1.2, 48, 48);
    const cloudsTexture = textureLoader.load('assets/textures/earth-clouds.png');

    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
    this.earthGroup.add(this.cloudsMesh);
  }

  createAtmosphere() {
    const atmosGeo = new THREE.SphereGeometry(this.radius * 1.13, 48, 48);

    const customAtmosShader = {
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
          gl_FragColor = vec4(0.0, 0.82, 1.0, 1.0) * intensity * 1.35;
        }
      `
    };

    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: customAtmosShader.vertexShader,
      fragmentShader: customAtmosShader.fragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });

    this.atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
    this.scene.add(this.atmosphereMesh);
  }

  /**
   * Convert latitude and longitude to 3D Cartesian coordinates on sphere
   */
  latLngToVector3(lat, lng, altitude = 0) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const r = this.radius + altitude;

    return new THREE.Vector3(
      -(r * Math.sin(phi) * Math.cos(theta)),
      (r * Math.cos(phi)),
      (r * Math.sin(phi) * Math.sin(theta))
    );
  }

  /**
   * Set destinations and construct multi-tier LOD pins
   */
  setDestinations(destinations) {
    this.destinations = destinations;

    // Clear old pins
    this.pins.forEach(p => {
      this.earthGroup.remove(p.mesh);
    });
    this.pins = [];

    destinations.forEach(dest => {
      const tier = dest.tier || 'hub';
      const pinGroup = new THREE.Group();
      const altitude = 0.4;
      const pos = this.latLngToVector3(dest.lat, dest.lng, altitude);
      pinGroup.position.copy(pos);
      pinGroup.lookAt(pos.clone().multiplyScalar(2));

      // Sleek, refined, jewel-like glowing pin dimensions
      const orbColor = tier === 'hub' ? 0x00f2fe : (tier === 'city' ? 0x38bdf8 : 0xf59e0b);
      const orbRadius = tier === 'hub' ? 0.95 : (tier === 'city' ? 0.75 : 0.65);
      const ringRadius = tier === 'hub' ? 1.75 : (tier === 'city' ? 1.4 : 1.2);

      // Core Beacon Point
      const orbGeo = new THREE.SphereGeometry(orbRadius, 14, 14);
      const orbMat = new THREE.MeshBasicMaterial({ color: orbColor, transparent: true, opacity: 0.95 });
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      orbMesh.position.z = orbRadius;
      pinGroup.add(orbMesh);

      // Delicate Pulsing Wave Ring
      const ringGeo = new THREE.RingGeometry(orbRadius * 0.9, ringRadius, 20);
      const ringMat = new THREE.MeshBasicMaterial({
        color: orbColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      pinGroup.add(ringMesh);

      pinGroup.userData = {
        destination: dest,
        tier,
        ringMesh,
        baseScale: 1
      };

      // Set initial visibility based on tier
      if (tier === 'town' || tier === 'city') {
        pinGroup.visible = false;
      }

      this.earthGroup.add(pinGroup);
      this.pins.push({ mesh: pinGroup, data: dest, tier, ring: ringMesh });
    });
  }

  /**
   * Add or focus a custom glowing point for dynamically searched locations
   */
  addCustomPin(dest) {
    const existing = this.pins.find(p => p.data.id === dest.id || (Math.abs(p.data.lat - dest.lat) < 0.05 && Math.abs(p.data.lng - dest.lng) < 0.05));
    if (existing) {
      existing.mesh.visible = true;
      return existing;
    }

    const pinGroup = new THREE.Group();
    const pos = this.latLngToVector3(dest.lat, dest.lng, 0.4);
    pinGroup.position.copy(pos);
    pinGroup.lookAt(pos.clone().multiplyScalar(2));

    const orbGeo = new THREE.SphereGeometry(1.05, 14, 14);
    const orbMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const orbMesh = new THREE.Mesh(orbGeo, orbMat);
    orbMesh.position.z = 1.05;
    pinGroup.add(orbMesh);

    const ringGeo = new THREE.RingGeometry(1.0, 2.0, 20);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    pinGroup.add(ringMesh);

    pinGroup.userData = { destination: dest, tier: dest.tier || 'hub', ringMesh };
    this.earthGroup.add(pinGroup);
    const pinObj = { mesh: pinGroup, data: dest, tier: dest.tier || 'hub', ring: ringMesh };
    this.pins.push(pinObj);
    return pinObj;
  }

  /**
   * Toggle visibility of hotspot markers
   */
  toggleHotspots() {
    this.hotspotsVisible = (this.hotspotsVisible === undefined) ? false : !this.hotspotsVisible;
    this.pins.forEach(p => {
      p.mesh.visible = this.hotspotsVisible;
    });
    return this.hotspotsVisible;
  }

  /**
   * Update visibility of pins based on camera altitude (LOD zoom)
   */
  updateLOD(distance) {
    let newTier;
    if (distance > 205) {
      newTier = 'orbit';
    } else if (distance > 145) {
      newTier = 'regional';
    } else {
      newTier = 'local';
    }

    if (newTier !== this.currentTier) {
      this.currentTier = newTier;
      if (this.onAltitudeChange) {
        this.onAltitudeChange({ tier: newTier, distance });
      }
    }

    this.pins.forEach(p => {
      if (p.tier === 'hub') {
        p.mesh.visible = true;
      } else if (p.tier === 'city') {
        // Cities visible in 'regional' and 'local'
        p.mesh.visible = (newTier === 'regional' || newTier === 'local');
      } else if (p.tier === 'town') {
        // Towns only visible upon zooming in deep (< 145)
        p.mesh.visible = (newTier === 'local');
      }
    });
  }

  /**
   * Draw dynamic 3D curved flight routes between itinerary stops
   */
  renderFlightArcs(itineraryDays) {
    this.flightArcs.forEach(arc => {
      this.earthGroup.remove(arc.line);
      this.earthGroup.remove(arc.pulseMesh);
    });
    this.flightArcs = [];

    if (!itineraryDays || itineraryDays.length < 2) return;

    const stops = [];
    itineraryDays.forEach(day => {
      const dest = this.destinations.find(d => d.id === day.destinationId);
      if (dest && (!stops.length || stops[stops.length - 1].id !== dest.id)) {
        stops.push(dest);
      }
    });

    for (let i = 0; i < stops.length - 1; i++) {
      const start = stops[i];
      const end = stops[i + 1];

      const vStart = this.latLngToVector3(start.lat, start.lng, 1.2);
      const vEnd = this.latLngToVector3(end.lat, end.lng, 1.2);

      const mid = vStart.clone().add(vEnd).multiplyScalar(0.5);
      const distance = vStart.distanceTo(vEnd);
      const altitude = Math.min(distance * 0.4, 45);
      mid.normalize().multiplyScalar(this.radius + altitude);

      const curve = new THREE.QuadraticBezierCurve3(vStart, mid, vEnd);
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = new THREE.LineBasicMaterial({
        color: 0x00f2fe,
        linewidth: 2,
        transparent: true,
        opacity: 0.85
      });

      const line = new THREE.Line(geometry, material);
      this.earthGroup.add(line);

      const pulseGeo = new THREE.SphereGeometry(1.4, 12, 12);
      const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      this.earthGroup.add(pulseMesh);

      this.flightArcs.push({
        line,
        curve,
        pulseMesh,
        progress: Math.random(),
        speed: 0.007 + Math.random() * 0.003
      });
    }
  }

  /**
   * Smoothly fly camera to face destination, adapting target zoom distance to tier
   */
  flyTo(lat, lng, targetDistance = null) {
    this.isAutoRotating = false;
    this.isFlying = true;

    // Calculate rotation of Earth to face lat/lng towards positive Z
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const targetY = -theta + Math.PI / 2;
    const targetX = phi - Math.PI / 2;

    this.targetRotation = { x: targetX, y: targetY };

    // Default target distance if not specified
    this.targetCameraDistance = targetDistance || 170;
  }

  flyToLocation(destination) {
    let zoomDist = 175;
    if (destination.tier === 'town') {
      zoomDist = 114; // Intimate close-up for mountain towns and coastal villages!
    } else if (destination.tier === 'city') {
      zoomDist = 138;
    }
    this.flyTo(destination.lat, destination.lng, zoomDist);
  }

  resetView() {
    this.targetRotation = { x: 0.2, y: 0 };
    this.targetCameraDistance = 280;
    this.isFlying = true;
    this.isAutoRotating = true;
  }

  zoomBy(delta) {
    this.targetCameraDistance = Math.max(106, Math.min(450, this.camera.position.z + delta));
    this.isFlying = true;
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    const canvas = this.renderer.domElement;
    let downX = 0, downY = 0;

    canvas.addEventListener('mousedown', (e) => {
      downX = e.clientX;
      downY = e.clientY;
      canvas.style.cursor = 'grabbing';
      this.isAutoRotating = false;
    });

    canvas.addEventListener('mouseup', () => {
      canvas.style.cursor = 'grab';
    });

    // Raycast Pin Clicks (distinguish from orbiting drags)
    canvas.addEventListener('click', (event) => {
      if (Math.hypot(event.clientX - downX, event.clientY - downY) > 8) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const interactiveMeshes = [];
      this.pins.forEach(p => {
        if (!p.mesh.visible) return;
        p.mesh.traverse(child => {
          if (child.isMesh || child.isSprite) {
            child.userData = p.mesh.userData;
            interactiveMeshes.push(child);
          }
        });
      });

      const intersects = this.raycaster.intersectObjects(interactiveMeshes, false);
      if (intersects.length > 0) {
        const dest = intersects[0].object.userData.destination;
        if (dest && this.onSelectDestination) {
          this.flyToLocation(dest);
          this.onSelectDestination(dest);
        }
      }
    });

    // Pointer cursor on hover
    canvas.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const interactiveMeshes = [];
      this.pins.forEach(p => {
        if (!p.mesh.visible) return;
        p.mesh.traverse(child => {
          if (child.isMesh) interactiveMeshes.push(child);
        });
      });
      const intersects = this.raycaster.intersectObjects(interactiveMeshes, false);
      if (intersects.length > 0) {
        canvas.style.cursor = 'pointer';
        const dest = intersects[0].object.userData.destination;
        if (dest && this.tooltipEl) {
          const tierTag = dest.tier === 'town' ? 'Town / Pueblo' : (dest.tier === 'city' ? 'City' : 'World Hub');
          this.tooltipEl.innerHTML = `<strong>${esc(dest.name)}</strong> <span>${esc(dest.country)} &bull; ${esc(tierTag)}</span>`;
          this.tooltipEl.style.left = (event.clientX + 14) + 'px';
          this.tooltipEl.style.top = (event.clientY - 12) + 'px';
          this.tooltipEl.style.display = 'block';
        }
      } else {
        canvas.style.cursor = 'grab';
        if (this.tooltipEl) this.tooltipEl.style.display = 'none';
      }
    });

    canvas.addEventListener('mouseleave', () => {
      if (this.tooltipEl) this.tooltipEl.style.display = 'none';
    });
  }

  animate() {
    requestAnimationFrame(this.animate);

    const time = performance.now() * 0.001;
    const camDist = this.camera.position.length();

    // Check LOD tiers dynamically as user zooms in/out
    this.updateLOD(camDist);

    // Smooth camera fly-to interpolation
    if (this.isFlying && this.targetRotation) {
      this.earthGroup.rotation.y += (this.targetRotation.y - this.earthGroup.rotation.y) * 0.06;
      this.earthGroup.rotation.x += (this.targetRotation.x - this.earthGroup.rotation.x) * 0.06;

      if (this.targetCameraDistance && Math.abs(this.camera.position.z - this.targetCameraDistance) > 0.5) {
        this.camera.position.z += (this.targetCameraDistance - this.camera.position.z) * 0.06;
      }

      if (
        Math.abs(this.targetRotation.y - this.earthGroup.rotation.y) < 0.002 &&
        Math.abs(this.targetRotation.x - this.earthGroup.rotation.x) < 0.002 &&
        Math.abs(this.camera.position.z - (this.targetCameraDistance || 0)) < 1
      ) {
        this.isFlying = false;
      }
    } else if (this.isAutoRotating) {
      this.earthGroup.rotation.y += 0.0012;
    }

    // Cloud drift
    if (this.cloudsMesh) {
      this.cloudsMesh.rotation.y += 0.00035;
    }

    // Pulse pin wave rings
    this.pins.forEach((p, idx) => {
      if (p.mesh.visible) {
        const scale = 1 + 0.3 * Math.sin(time * 3.5 + idx);
        p.ring.scale.set(scale, scale, 1);
        p.ring.material.opacity = 0.8 - (scale - 1);
      }
    });

    // Animate traveling flight pulses
    this.flightArcs.forEach(arc => {
      arc.progress = (arc.progress + arc.speed) % 1;
      const point = arc.curve.getPointAt(arc.progress);
      arc.pulseMesh.position.copy(point);
    });

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }
}
