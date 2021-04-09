import * as THREE from 'three';

export default class Role {
    constructor(_option) {
        this.resources = _option.resources;
        this.time = _option.time;
        this.debug = _option.debug;
        this.controls = _option.controls;
        this.light = _option.light;

        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;

        if (this.debug) {
            this.debugFolder = this.debug.addFolder('role');
            // this.debugFolder.open();
        }

        this.setRole();
        this.setTraverse();
        this.setRaycasterBox();
        this.setPenGroup();
        this.setColor();
        this.setAnimation();
    }

    setRole() {
        this.parameters = {};
        this.parameters.rotate = 1.2;
        this.parameters.tilt = 0;
        this.parameters.speed = 0.0005;
        this.parameters.metalness = 0;
        this.parameters.lightIntensity = 0;
        this.parameters.color = '#000000';

        this.instance = this.resources.items.pen.scene;
        this.instance.scale.set(3, 3, 3);
        this.instance.position.set(0, 0, 0);
        this.instance.rotation.y = Math.PI * this.parameters.rotate;
        this.container.add(this.instance);
    }

    setTraverse() {
        this.instance.traverse((child) => {
            switch (child.name) {
                case 'pen': this.pen = child; break;
                case 'penBody': this.penBody = child; break;
                case 'penHead': this.penHead = child; break;
                case 'penPeak': this.penPeak = child; break;
                case 'penRing': this.penRing = child; break;

                case 'ring': this.ring = child; break;
                case 'base1': this.base1 = child; break;
                case 'base2': this.base2 = child; break;

                case 'label1': this.label1 = child; break;
                case 'label2': this.label2 = child; break;

                case 'penBox': this.penBox = child; break;
                case 'ringBox': this.ringBox = child; break;
                case 'base1Box': this.base1Box = child; break;
                case 'base2Box': this.base2Box = child; break;

                default: break;
            }
            if (this.debug) this.debugFolder.add(child, 'visible').name(child.name);
        });
    }

    setRaycasterBox() {
        const boxes = [this.penBox, this.ringBox, this.base1Box, this.base2Box];
        boxes.forEach((value) => {
            const mesh = value;
            mesh.material.transparent = true;
            mesh.material.opacity = 0;
        });
    }

    setPenGroup() {
        this.instancePen = new THREE.Object3D();
        this.instancePen.name = 'pen instance';
        this.instancePen.rotation.x = Math.PI * this.parameters.tilt;

        while (this.pen.children.length) this.instancePen.add(this.pen.children[0]);
        this.pen.add(this.instancePen);

        if (this.debug) {
            this.penAxes = new THREE.AxesHelper();
            this.instancePenAxes = new THREE.AxesHelper();
            this.pen.add(this.penAxes);
            this.instancePen.add(this.instancePenAxes);

            this.debugFolder.add(this.penAxes, 'visible').name('penAxes');
            this.debugFolder.add(this.instancePenAxes, 'visible').name('instancePenAxes');
            this.debugFolder.add(this.parameters, 'speed').min(0).max(0.01).step(0.00001).name('speed');

            this.debugFolder.add(this.parameters, 'rotate').min(0).max(2).step(0.01).name('rotate')
                            .onChange(() => { this.instance.rotation.y = Math.PI * this.parameters.rotate; });

            this.debugFolder.add(this.parameters, 'tilt').min(0).max(0.2).step(0.001).name('tilt')
                            .onChange(() => { this.instancePen.rotation.x = Math.PI * this.parameters.tilt; });

            this.debugFolder.add(this.parameters, 'metalness').min(0).max(1).step(0.01).name('metalness')
                            .onChange(() => { this.penBody.material.metalness = this.parameters.metalness; });

            this.debugFolder.add(this.parameters, 'lightIntensity').min(0).max(10).step(0.1).name('lightIntensity')
                            .onChange(() => { this.light.ambientLight.intensity = this.parameters.lightIntensity; });

            this.debugFolder.addColor(this.parameters, 'color').name('color')
                            .onChange(() => { this.penBody.material.color.set(this.parameters.color); });
        }
    }

    setColor() {
        this.rayColorMeshes = [];
        this.rayColorMeshes.push(this.base1Box);
        this.rayColorMeshes.push(this.base2Box);
        this.rayColorMeshes.push(this.ringBox);

        this.colors = [];
        this.colors.push({ color: '#292934', metalness: 0.90, lightIntensity: 2.0 });
        this.colors.push({ color: '#000000', metalness: 0.00, lightIntensity: 0.0 });

        this.colorIndex = 0;

        this.time.on('shortClick', () => {
            this.intersects = this.controls.raycaster.intersectObjects(this.rayColorMeshes);

            if (this.intersects.length) {
                const { color, metalness, lightIntensity } = this.colors[this.colorIndex];
                this.penBody.material.color.set(color);
                this.penBody.material.metalness = metalness;
                this.light.ambientLight.intensity = lightIntensity;

                this.colorIndex += 1;
                this.colorIndex %= this.colors.length;
            }
        });
    }

    setAnimation() {
        this.time.on('tick', () => {
            const theta = this.time.delta * this.parameters.speed;
            this.pen.rotateOnAxis(new THREE.Vector3(0, 1, 0), theta);
        });
    }
}