import * as THREE from 'three';

export default class Labels {
    constructor(_option) {
        this.role = _option.role;
        this.time = _option.time;
        this.sizes = _option.sizes;
        this.camera = _option.camera;
        this.debug = _option.debug;

        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;

        if (this.debug) {
            this.debugFolder = this.debug.addFolder('label');
            // this.debugFolder.open();
        }

        this.setDOM();
        this.setLabels();
    }

    setDOM() {
        this.labels = [];
        this.label1 = {};
        this.label2 = {};
        this.labels.push(this.label1);
        this.labels.push(this.label2);

        this.label1.element = document.createElement('DIV');
        this.label2.element = document.createElement('DIV');
        this.label1.element.className = 'point point-1';
        this.label2.element.className = 'point point-2';
        this.label1.element.innerText = 'Point 1';
        this.label2.element.innerText = 'Point 2';
        this.label1.shift = { x: 10, y: 0 };
        this.label2.shift = { x: -150, y: 60 };

        this.points = document.querySelector('.points');
        this.points.appendChild(this.label1.element);
        this.points.appendChild(this.label2.element);

        if (this.debug) {
            this.role.label1.add(new THREE.AxesHelper(0.5));
            this.role.label2.add(new THREE.AxesHelper(0.5));

            this.debugFolder.add(this.label1.shift, 'x').min(-200).max(200).step(1).name('label1 shiftX');
            this.debugFolder.add(this.label1.shift, 'y').min(-200).max(200).step(1).name('label1 shiftY');
            this.debugFolder.add(this.label2.shift, 'x').min(-200).max(200).step(1).name('label2 shiftX');
            this.debugFolder.add(this.label2.shift, 'y').min(-200).max(200).step(1).name('label2 shiftY');
        }
    }

    async setLabels() {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        this.label1.mesh = this.role.label1;
        this.label2.mesh = this.role.label2;
        this.label1.position = this.label1.mesh.position.clone();
        this.label2.position = this.label2.mesh.position.clone();
        this.label1.element.classList.add('visible');
        this.label2.element.classList.add('visible');

        this.labels.forEach((value) => {
            const label = value;
            while (label.mesh.parent !== null) {
                const matrix = label.mesh.parent.matrix.clone();
                label.position = label.position.applyMatrix4(matrix);
                label.mesh = label.mesh.parent;
            }
        });

        this.time.on('tick', () => {
            this.labels.forEach((value) => {
                const label = value;
                const screenPosition = label.position.clone();
                screenPosition.project(this.camera.instance);
                const x = screenPosition.x * this.sizes.width * 0.5 + label.shift.x;
                const y = -screenPosition.y * this.sizes.height * 0.5 - label.shift.y;
                label.element.style.transform = `translateX(${x}px) translateY(${y}px)`;
            });
        });
    }
}
