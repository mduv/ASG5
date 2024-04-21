import * as THREE from 'three';


function main() {


	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

	const fov = 75;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 5; 
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.z = 2;

	const scene = new THREE.Scene();

	{

		const color = 0xFFFFFF;
		const intensity = 3;
		const light = new THREE.DirectionalLight( color, intensity );
		light.position.set( - 1, 2, 4 );
		scene.add( light );

	}

	const boxWidth = 1;
	const boxHeight = 1;
	const boxDepth = 1;
	const geometry = new THREE.BoxGeometry( boxWidth, boxHeight, boxDepth );


	function makeInstance( geometry, color, x, texture = null ) {
        let material;
        if (texture) {
            // If a texture is provided, create a textured material.
            material = new THREE.MeshPhongMaterial({ map: texture });
        } else {
            // If no texture is provided, create a material with a solid color.
            material = new THREE.MeshPhongMaterial({ color });
        }
        const shape = new THREE.Mesh(geometry, material);
        scene.add(shape);
        shape.position.x = x;
        return shape;
	}

    // Geometry for cube, sphere, and cylinder
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32); // radius, widthSegments, heightSegments
    const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32); // topRadius, bottomRadius, height, radialSegments

    const textureLoader = new THREE.TextureLoader();
    const cubeTexture = textureLoader.load('./kobe.jpeg', function ( texture ) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set( 0, 0 );
        texture.repeat.set( 1, 1 );
    });

	// Create instances of the shapes
    const cube = makeInstance(cubeGeometry, null, 0, cubeTexture);
    const sphere = makeInstance(sphereGeometry, 0x8844aa, -2);
    const cylinder = makeInstance(cylinderGeometry, 0xaa8844, 2);

	// Adjust your cubes array to include the new shapes

    const shapes = [cube, sphere, cylinder];
        
    function render( time ) {

		time *= 0.001; // convert time to seconds

		shapes.forEach( ( cube, ndx ) => {

			const speed = 1 + ndx * .1;
			const rot = time * speed;
			cube.rotation.x = rot;
			cube.rotation.y = rot;

		} );

		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );

}

main();
