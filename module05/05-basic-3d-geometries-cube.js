
    // once everything is loaded, we run our Three.js stuff.
    function init() {

        var stats = initStats();

        // create a scene, that will hold all our elements such as objects, cameras and lights.
        var scene = new THREE.Scene();

        // create a camera, which defines where we're looking at.
        var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

        // create a render and set the size
        var webGLRenderer = new THREE.WebGLRenderer();
        webGLRenderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
        webGLRenderer.setSize(window.innerWidth, window.innerHeight);
        webGLRenderer.shadowMapEnabled = true;

        var cube = createMesh(new THREE.BoxGeometry(10, 10, 10, 1, 1, 1));
        // add the sphere to the scene
        scene.add(cube);

        // position and point the camera to the center of the scene
        camera.position.x = -20;
        camera.position.y = 30;
        camera.position.z = 40;
        camera.lookAt(new THREE.Vector3(10, 0, 0));


        // add spotlight for the shadows
        var spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(-40, 60, -10);
        scene.add(spotLight);

        // add the output of the renderer to the html element
        document.getElementById("WebGL-output").appendChild(webGLRenderer.domElement);

        // call the render function
        var step = 0;


        // setup the control gui
        var controls = new function () {

            this.width = cube.children[0].geometry.parameters.width;
            this.height = cube.children[0].geometry.parameters.height;
            this.depth = cube.children[0].geometry.parameters.depth;

            this.widthSegments = cube.children[0].geometry.parameters.widthSegments;
            this.heightSegments = cube.children[0].geometry.parameters.heightSegments;
            this.depthSegments = cube.children[0].geometry.parameters.depthSegments;


            this.redraw = function () {
                // remove the old plane
                scene.remove(cube);
                // create a new one
                cube = createMesh(new THREE.BoxGeometry(controls.width, controls.height, controls.depth, Math.round(controls.widthSegments), Math.round(controls.heightSegments), Math.round(controls.depthSegments)));
                // add it to the scene.
                scene.add(cube);
            };
        };

        var gui = new dat.GUI();
        gui.add(controls, 'width', 0, 40).onChange(controls.redraw);
        gui.add(controls, 'height', 0, 40).onChange(controls.redraw);
        gui.add(controls, 'depth', 0, 40).onChange(controls.redraw);
        gui.add(controls, 'widthSegments', 0, 10).onChange(controls.redraw);
        gui.add(controls, 'heightSegments', 0, 10).onChange(controls.redraw);
        gui.add(controls, 'depthSegments', 0, 10).onChange(controls.redraw);
        render();

        function createMesh(geom) {

            // assign two materials
            var meshMaterial = new THREE.MeshNormalMaterial();
            meshMaterial.side = THREE.DoubleSide;
            var wireFrameMat = new THREE.MeshBasicMaterial();
            wireFrameMat.wireframe = true;

            // create a multimaterial
            var mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [meshMaterial, wireFrameMat]);

            return mesh;
        }

        function render() {
            stats.update();

            cube.rotation.y = step += 0.01;

            // render using requestAnimationFrame
            requestAnimationFrame(render);
            webGLRenderer.render(scene, camera);
        }

        function initStats() {

            var stats = new Stats();
            stats.setMode(0); // 0: fps, 1: ms

            // Align top-left
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.left = '0px';
            stats.domElement.style.top = '0px';

            document.getElementById("Stats-output").appendChild(stats.domElement);

            return stats;
        }
    }
    window.onload = init;
