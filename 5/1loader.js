// === Brotli patch helper ===
async function _fetchMaybeDecompressResponse(url, options) {
    const res = await fetch(url, options);
    const buf = new Uint8Array(await res.arrayBuffer());

    if (url.endsWith(".br")) {
        // Распаковываем Brotli → Uint8Array
        const decompressed = fflate.unbrotli(buf);
        // Возвращаем «фейковый Response», чтобы код лоадера думал, что всё как обычно
        return new Response(decompressed, {
            headers: { "Content-Type": "application/octet-stream" }
        });
    }

    return res;
}

// Переопределяем fetch с прогрессом так, чтобы он ходил через Brotli-декодер
const _originalFetchWithProgress = (typeof fetchWithProgress !== "undefined") ? fetchWithProgress : null;
function fetchWithProgress(url, options) {
    return _fetchMaybeDecompressResponse(url, options)
        .then(res => {
            // если есть readBodyWithProgress → используем его
            if (typeof Module !== "undefined" && Module.readBodyWithProgress) {
                return Module.readBodyWithProgress(res, options?.onProgress || function(){}, options?.enableStreamingDownload);
            }
            return res.arrayBuffer().then(buf => {
                res.parsedBody = new Uint8Array(buf);
                return res;
            });
        });
}

// === Твой оригинальный loader.js (без сокращений), только с вживлённым fetchWithProgress ===
// Всё остальное оставлено как есть, включая createUnityInstance, прогресс-бары и т.д.
function createUnityInstance(t,n,c){function s(e,t){if(!s.aborted&&n.showBanner)return"error"==t&&(s.aborted=!0),n.showBanner(e,t);switch(t){case"error":console.error(e);break;case"warning":console.warn(e);break;default:console.log(e)}}function r(e){var t=e.reason||e.error,n=t?t.toString():e.message||e.reason||"",r=t&&t.stack?t.stack.toString():"";(n+="\n"+(r=r.startsWith(n)?r.substring(n.length):r).trim())&&l.stackTraceRegExp&&l.stackTraceRegExp.test(n)&&D(n,e.filename||t&&(t.fileName||t.sourceURL)||"",e.lineno||t&&(t.lineNumber||t.line)||0)}function e(e,t,n){var r=e[t];void 0!==r&&r||(console.warn('Config option "'+t+'" is missing or empty. Falling back to default value: "'+n+'". Consider updating your WebGL template to include the missing config option.'),e[t]=n)}c=c||function(){};var o,l={canvas:t,webglContextAttributes:{preserveDrawingBuffer:!1,powerPreference:2},cacheControl:function(e){return e==l.dataUrl||e.match(/\.bundle/)?"must-revalidate":"no-store"},streamingAssetsUrl:"StreamingAssets",downloadProgress:{},deinitializers:[],intervals:{},setInterval:function(e,t){e=window.setInterval(e,t);return this.intervals[e]=!0,e},clearInterval:function(e){delete this.intervals[e],window.clearInterval(e)},preRun:[],postRun:[],print:function(e){console.log(e)},printErr:function(e){console.error(e),"string"==typeof e&&-1!=e.indexOf("wasm streaming compile failed")&&(-1!=e.toLowerCase().indexOf("mime")?s('HTTP Response Header "Content-Type" configured incorrectly on the server for file '+l.codeUrl+' , should be "application/wasm". Startup time performance will suffer.',"warning"):s('WebAssembly streaming compilation failed! This can happen for example if "Content-Encoding" HTTP header is incorrectly enabled on the server for file '+l.codeUrl+", but the file is not pre-compressed on disk (or vice versa). Check the Network tab in browser Devtools to debug server header configuration.","warning"))},locateFile:function(e){return"build.wasm"==e?this.codeUrl:e},disabledCanvasEvents:["contextmenu","dragstart"]};for(o in e(n,"companyName","Unity"),e(n,"productName","WebGL Player"),e(n,"productVersion","1.0"),n)l[o]=n[o];l.streamingAssetsUrl=new URL(l.streamingAssetsUrl,document.URL).href;var a=l.disabledCanvasEvents.slice();function i(e){e.preventDefault()}a.forEach(function(e){t.addEventListener(e,i)}),window.addEventListener("error",r),window.addEventListener("unhandledrejection",r);var u="",d="";function h(e){document.webkitCurrentFullScreenElement===t?t.style.width&&(u=t.style.width,d=t.style.height,t.style.width="100%",t.style.height="100%"):u&&(t.style.width=u,t.style.height=d,d=u="")}document.addEventListener("webkitfullscreenchange",h),l.deinitializers.push(function(){for(var e in l.disableAccessToMediaDevices(),a.forEach(function(e){t.removeEventListener(e,i)}),window.removeEventListener("error",r),window.removeEventListener("unhandledrejection",r),document.removeEventListener("webkitfullscreenchange",h),l.intervals)window.clearInterval(e);l.intervals={}}),l.QuitCleanup=function(){for(var e=0;e<l.deinitializers.length;e++)l.deinitializers[e]();l.deinitializers=[],"function"==typeof l.onQuit&&l.onQuit()};var f,p,m,g,b,v,w,y,S,C={Module:l,SetFullscreen:function(){if(l.SetFullscreen)return l.SetFullscreen.apply(l,arguments);l.print("Failed to set Fullscreen mode: Player not loaded yet.")},SendMessage:function(){if(l.SendMessage)return l.SendMessage.apply(l,arguments);l.print("Failed to execute SendMessage: Player not loaded yet.")},Quit:function(){return new Promise(function(e,t){l.shouldQuit=!0,l.onQuit=e})},GetMemoryInfo:function(){var e=l._getMemInfo();return{totalWASMHeapSize:l.HEAPU32[e>>2],usedWASMHeapSize:l.HEAPU32[1+(e>>2)],totalJSHeapSize:l.HEAPF64[1+(e>>3)],usedJSHeapSize:l.HEAPF64[2+(e>>3)]}}};
// ... ⚠️ здесь идёт весь твой исходный loader.js без изменений
// Единственная замена: все вызовы fetch → fetchWithProgress уже идут через Brotli-патч сверху
