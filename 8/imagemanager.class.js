/**
 * @file imagemanager.class.js
 * @version 1.1.0
 */

import config from 'https://cdn.jsdelivr.net/gh/nbjrkzddz/zxcvbnm@42109a8e1cd488444f66869807cfb27b8e14f43f/games/burgerandfrights/js/resources/config.js';
import resources from 'https://cdn.jsdelivr.net/gh/nbjrkzddz/zxcvbnm@42109a8e1cd488444f66869807cfb27b8e14f43f/games/burgerandfrights/js/resources/resources.js';

import * as THREE from 'https://cdn.jsdelivr.net/gh/nbjrkzddz/zxcvbnm@42109a8e1cd488444f66869807cfb27b8e14f43f/games/burgerandfrights/js/lib/three.js/three.module.js';

export default class ImageManager {
    static _init() {
        ImageManager._images = new Map();
        ImageManager._textures = new Map();
    }

    static asyncLoadImages() {
        return Promise.all(Object.keys(resources.images).map(name => {
            const info = resources.images[name];
            const url = `https://cdn.jsdelivr.net/gh/nbjrkzddz/zxcvbnm@42109a8e1cd488444f66869807cfb27b8e14f43f/games/burgerandfrights/images/${info.path}${config.debug.preventCaching ? '?time=' + new Date().getTime() : ''}`;

            return new Promise((resolve, reject) => {
                const image = new Image();
                image.addEventListener('load', () => {
                    ImageManager._images.set(name, image);

                    resolve();
                });
                image.addEventListener('error', () => {
                    reject(new Error(`Error loading image file "${url}"`));
                });
                image.src = url;
            });
        }));
    }

    static getImageNames() {
        return Array.from(ImageManager._images.keys());
    }

    static getImage(name) {
        const image = ImageManager._images.get(name);
        if (image === undefined) {
            throw new Error(`Image "${name}" does not exist`);
        }
        return image;
    }

    static getThreeTexture(name, encoding = THREE.LinearEncoding) {
        if (ImageManager._textures.has(name)) {
            return ImageManager._textures.get(name);
        }

        const image = ImageManager.getImage(name);
        const texture = new THREE.Texture(image);
        texture.encoding = encoding;
        texture.needsUpdate = true;
        ImageManager._textures.set(name, texture);
        return texture;
    }
}

ImageManager._init();
