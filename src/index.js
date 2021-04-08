import Application from './javascript/Application.js';
import './style/main.scss';
import './style/loading.scss';
import './style/label.scss';

window.application = new Application({
    $canvas: document.querySelector('.webgl'),
});
