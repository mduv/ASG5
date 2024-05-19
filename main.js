import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function initializeScene() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas, alpha: true });

    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    const scene = new THREE.Scene();

    return { renderer, camera, scene, controls };
}

function createGround(scene) {
    const planeSize = 40;
    const loader = new THREE.TextureLoader();
    const texture = loader.load('./compressed-but-large-wood-texture.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMaterial = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.rotation.x = Math.PI * -0.5;
    scene.add(planeMesh);
}

function createCube(scene, cubes, textureLoader) {
    const boxSize = 3;
    const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const texture = textureLoader.load('./kobe.jpeg');
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(5, 4, -6);
    scene.add(cube);
    cubes.push(cube);
}

function loadCustomModel(scene, camera) {
    const objLoader = new OBJLoader();
    objLoader.load(
        'https://threejs.org/manual/examples/resources/models/windmill_2/windmill.obj',
        (obj) => {
            obj.position.set(0, 0, 3);
            obj.scale.set(0.005, 0.005, 0.005);
            scene.add(obj);

            const box = new THREE.Box3().setFromObject(obj);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxSize = Math.max(size.x, size.y, size.z);
            const fitHeightDistance = maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360));
            const fitWidthDistance = fitHeightDistance / camera.aspect;
            const distance = Math.max(fitHeightDistance, fitWidthDistance);
            const direction = new THREE.Vector3().subVectors(camera.position, center).normalize();
        },
        undefined,
        (error) => {
            console.error('An error happened while loading the windmill:', error);
        }
    );
}

function createSphere(scene) {
    const sphereRadius = 3;
    const widthDivisions = 32;
    const heightDivisions = 16;
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, widthDivisions, heightDivisions);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: '#CA8' });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
    scene.add(sphereMesh);
}

function setupLighting(scene) {
    const color = 0xFFFFFF;
    const intensity = 5;
    const width = 12;
    const height = 4;
    const rectLight = new THREE.RectAreaLight(color, intensity, width, height);
    rectLight.position.set(0, 10, 0);
    rectLight.rotation.x = THREE.MathUtils.degToRad(-90);
    scene.add(rectLight);

    const helper = new RectAreaLightHelper(rectLight);
    rectLight.add(helper);

    const gui = new GUI();
    gui.addColor(new ColorGUIHelper(rectLight, 'color'), 'value').name('color');
    gui.add(rectLight, 'intensity', 0, 10, 0.01);
    gui.add(rectLight, 'width', 0, 20);
    gui.add(rectLight, 'height', 0, 20);
    gui.add(new DegRadHelper(rectLight.rotation, 'x'), 'value', -180, 180).name('x rotation');
    gui.add(new DegRadHelper(rectLight.rotation, 'y'), 'value', -180, 180).name('y rotation');
    gui.add(new DegRadHelper(rectLight.rotation, 'z'), 'value', -180, 180).name('z rotation');
    makeXYZGUI(gui, rectLight.position, 'position');
}

function addExtraLights(scene) {
    const pointLight = new THREE.PointLight(0xFFFFFF, 1, 50);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const spotLight = new THREE.SpotLight(0xFFFFFF, 1);
    spotLight.position.set(-10, 20, -10);
    spotLight.angle = Math.PI / 6;
    scene.add(spotLight);
}

function createSkybox(scene) {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        './pos-x.jpg',
        './neg-x.jpg',
        './pos-y.jpg',
        './neg-y.jpg',
        './pos-z.jpg',
        './neg-z.jpg'
    ]);
    scene.background = texture;
}

function addMultipleShapes(scene) {
    const shapes = [];
    const material = new THREE.MeshStandardMaterial({ color: 0x808080 });

    for (let i = 0; i < 20; i++) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(Math.random() * 20 - 10, Math.random() * 10, Math.random() * 20 - 10);
        scene.add(cube);
        shapes.push(cube);
    }

    for (let i = 0; i < 10; i++) {
        const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 16);
        const sphere = new THREE.Mesh(sphereGeometry, material);
        sphere.position.set(Math.random() * 20 - 10, Math.random() * 10, Math.random() * 20 - 10);
        scene.add(sphere);
        shapes.push(sphere);

        const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
        const cylinder = new THREE.Mesh(cylinderGeometry, material);
        cylinder.position.set(Math.random() * 20 - 10, Math.random() * 10, Math.random() * 20 - 10);
        scene.add(cylinder);
        shapes.push(cylinder);
    }

    return shapes;
}

function rotateCubes(cubes, time) {
    cubes.forEach((cube, ndx) => {
        const speed = 0.2 + ndx * 0.1;
        const rot = time * speed;
        cube.rotation.x = rot;
        cube.rotation.y = rot;
    });
}

function renderScene(renderer, scene, camera, cubes) {
    function render(time) {
        time *= 0.001; // convert time to seconds

        rotateCubes(cubes, time);

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

class ColorGUIHelper {
    constructor(object, prop) {
        this.object = object;
        this.prop = prop;
    }
    get value() {
        return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
        this.object[this.prop].set(hexString);
    }
}

class DegRadHelper {
    constructor(obj, prop) {
        this.obj = obj;
        this.prop = prop;
    }
    get value() {
        return THREE.MathUtils.radToDeg(this.obj[this.prop]);
    }
    set value(v) {
        this.obj[this.prop] = THREE.MathUtils.degToRad(v);
    }
}

function makeXYZGUI(gui, vector3, name, onChangeFn) {
    const folder = gui.addFolder(name);
    folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
    folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
    folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
    folder.open();
}

function main() {
    const { renderer, camera, scene, controls } = initializeScene();
    const textureLoader = new THREE.TextureLoader();
    const cubes = [];

    createGround(scene);
    createCube(scene, cubes, textureLoader);
    loadCustomModel(scene, camera);
    createSphere(scene);
    setupLighting(scene);
    addExtraLights(scene);
    createSkybox(scene);
    const shapes = addMultipleShapes(scene);

    renderScene(renderer, scene, camera, cubes);
}

main();
