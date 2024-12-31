/**
 * @file app.class.js
 * @version 1.0.0
 */

import AudioSystem from 'https://cdn.jsdelivr.net/gh/bobydob/Airtest@eea0023038683062c1d51176c6e28daa8b742c8d/8/audiosystem.class.js';
import ImageManager from 'https://cdn.jsdelivr.net/gh/bobydob/Airtest@master/8/imagemanager.class.js';
import Input from 'https://cdn.jsdelivr.net/gh/nbjrkzddz/zxcvbnm@42109a8e1cd488444f66869807cfb27b8e14f43f/games/burgerandfrights/js/framework/input.class.js';
import ModelManager from 'https://cdn.jsdelivr.net/gh/nbjrkzddz/zxcvbnm@42109a8e1cd488444f66869807cfb27b8e14f43f/games/burgerandfrights/js/framework/modelmanager.class.js';
import Time from 'https://cdn.jsdelivr.net/gh/nbjrkzddz/zxcvbnm@42109a8e1cd488444f66869807cfb27b8e14f43f/games/burgerandfrights/js/framework/time.class.js';

import Context from 'https://cdn.jsdelivr.net/gh/nbjrkzddz/zxcvbnm@42109a8e1cd488444f66869807cfb27b8e14f43f/games/burgerandfrights/js/game/context.class.js';

import * as THREE from 'https://cdn.jsdelivr.net/gh/nbjrkzddz/zxcvbnm@42109a8e1cd488444f66869807cfb27b8e14f43f/games/burgerandfrights/js/lib/three.js/three.module.js';

import Ingame from 'https://cdn.jsdelivr.net/gh/nbjrkzddz/zxcvbnm@42109a8e1cd488444f66869807cfb27b8e14f43f/games/burgerandfrights/js/scenes/ingame.class.js';

import config from 'https://cdn.jsdelivr.net/gh/nbjrkzddz/zxcvbnm@42109a8e1cd488444f66869807cfb27b8e14f43f/games/burgerandfrights/js/resources/config.js';

export default class App {
    static _init() {
        App.version = '1.0.0';

        THREE.Object3D.DefaultMatrixAutoUpdate = false;

        window.addEventListener('load', () => {
            App._elementLoading = document.querySelector('.loading');
            App._elementCredits = document.querySelector('.credits');
            App._elementShowCredits = document.querySelector('.show-credits');

            App._creditsVisible = false;
            App._showCreditsVisible = false;

            App._elementShowCredits.addEventListener('click', () => {
                App.setCreditsVisibility(!App._creditsVisible);
            });

            AudioSystem.createAudioContext(THREE.AudioContext.getContext());

            AudioSystem.asyncLoadSounds()
                .then(() => ImageManager.asyncLoadImages())
                .then(() => ModelManager.asyncLoadModels())
                .then(() => {
                    App._elementLoading.style.visibility = 'hidden';

                    App.setCreditsVisibility(false);

                    new App();
                });
        });
    }

    static setCreditsVisibility(creditsVisible = true, showCreditsVisible = true) {
        App._creditsVisible = creditsVisible;
        App._showCreditsVisible = showCreditsVisible;

        App._elementCredits.style.visibility = creditsVisible ? 'visible' : 'hidden';
        App._elementShowCredits.style.visibility = showCreditsVisible ? 'visible' : 'hidden';
    }

    constructor() {
        this._time = new Time();

        this._clock = new THREE.Clock(false);

        this._canvas = document.querySelector('canvas');

        this._renderer = new THREE.WebGLRenderer({
            antialias: config.renderer.antialias,
            canvas: this._canvas,
            precision: THREE.mediump,
            stencil: false,
        });

        this._renderer.autoClearColor = false;

        Input.setContextMenuEnabled(false);
        Input.setKeyScrollEnabled(false);

        this._context = new Context(this, this._time, this._renderer);

        this._scene = new Ingame(this._context);

        window.addEventListener('resize', this._handleResize.bind(this));

        this._clock.start();
        this._renderer.setAnimationLoop(this._update.bind(this));

        this._handleResize();
    }

    _handleResize() {
        const height = Math.min(window.innerHeight, config.renderer.height);
        const width = Math.round(window.innerWidth / window.innerHeight * height);

        this._renderer.setSize(width, height);

        this._canvas.style.width = `${window.innerWidth}px`;
        this._canvas.style.height = `${window.innerHeight}px`;

        this._scene.handleResize(this._context);
    }

    _update(time) {
        this._context.time.addElapsedSeconds(
            Math.min(this._clock.getDelta(), config.simulation.maxTimestep));

        this._scene.update(this._context);

        Input.resetState();
    }
}

App._init();
