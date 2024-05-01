let dependencyUrls = []
const maxLoadTimesTrys = 4;

//Main Libraries
dependencyUrls.push("https://www.googletagmanager.com/gtag/js?id=UA-118283036-6", "https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js");
//Ads Libraries
dependencyUrls.push("https://cdn.jsdelivr.net/gh/bobydob/Airtest@ccdaf7d394f209f3b4c19f90a720486200c87b95/5633/adsController.js", "https://cdn.jsdelivr.net/gh/bobydob/Airtest@ccdaf7d394f209f3b4c19f90a720486200c87b95/5633/cpmstar.js", "https://cdn.jsdelivr.net/gh/bobydob/Airtest@ccdaf7d394f209f3b4c19f90a720486200c87b95/5633/moneyController.js");
//Firebase/Google Libraries
dependencyUrls.push("https://cdn.jsdelivr.net/gh/bobydob/Airtest@ccdaf7d394f209f3b4c19f90a720486200c87b95/5633/googleAnalytics.js", "https://cdn.jsdelivr.net/gh/bobydob/Airtest@ccdaf7d394f209f3b4c19f90a720486200c87b95/5633/firebase-init.js?v=2", "https://cdn.jsdelivr.net/gh/bobydob/Airtest@ccdaf7d394f209f3b4c19f90a720486200c87b95/5633/firebase-login.js?v=2", "https://cdn.jsdelivr.net/gh/bobydob/Airtest@ccdaf7d394f209f3b4c19f90a720486200c87b95/5633/firebase-config.js?v=2", "https://cdn.jsdelivr.net/gh/bobydob/Airtest@ccdaf7d394f209f3b4c19f90a720486200c87b95/5633/firebase-firestore.js?v=2")
//Game Libraries
dependencyUrls.push("https://cdn.jsdelivr.net/gh/bobydob/Airtest@eae8d352f2115195d761ad4810ac23519552761d/5633/unityGame.js?v=2", "https://cdn.jsdelivr.net/gh/bobydob/Airtest@be842e5a804ce95061a064c8473b2d0b335d1608/5633/unityUrls.js?v=2", "https://cdn.jsdelivr.net/gh/bobydob/Airtest@ccdaf7d394f209f3b4c19f90a720486200c87b95/5633/mobileRedirect.js", "https://cdn.jsdelivr.net/gh/bobydob/Airtest@ccdaf7d394f209f3b4c19f90a720486200c87b95/5633/fullscreen.js")
//etc. Libraries
dependencyUrls.push("https://cdn.jsdelivr.net/gh/bobydob/Airtest@ccdaf7d394f209f3b4c19f90a720486200c87b95/5633/windowResize.js", "https://cdn.jsdelivr.net/gh/bobydob/Airtest@ccdaf7d394f209f3b4c19f90a720486200c87b95/5633/blockManager.js", "https://cdn.jsdelivr.net/gh/bobydob/Airtest@ccdaf7d394f209f3b4c19f90a720486200c87b95/5633/macUserAgent.js", "https://cdn.jsdelivr.net/gh/bobydob/Airtest@ccdaf7d394f209f3b4c19f90a720486200c87b95/5633/visibilityChangeListener.js", "https://cdn.jsdelivr.net/gh/bobydob/Airtest@ccdaf7d394f209f3b4c19f90a720486200c87b95/5633/xsolla.js")

dynamicallyLoadScripts();

async function dynamicallyLoadScripts() {
    for (let i = 0; i < dependencyUrls.length; i++) {
        let url = dependencyUrls[i];
        let script = document.createElement("script");
        script.src = url;

        document.head.appendChild(script);
    }

    let trys = 0;
    while (window.loadedUrls === undefined || window.firebaseLoaded === undefined || window.adsLoaded === undefined
    || window.gameScriptLoaded === undefined || window.configInit === undefined || window.adsControllerLoaded === undefined) {
        await sleep(500)
        trys++;
        if(trys >= maxLoadTimesTrys) {
            break;
        }
    }

    isGameLoaded();
    initAds();
    loadGame();
    initFirebaseLibraries();
    fixMacUserAgent();
}

function loadGame() {
    let gameLoader = document.createElement("script")
    gameLoader.src = getGameLoaderUrl();
    gameLoader.id = "unity-loader"
    gameLoader.onload = function () {
        showGame();
    };

    let gameLoadDiv = document.getElementById("unity-loader-div");
    gameLoadDiv.innerHTML = "";
    gameLoadDiv.appendChild(gameLoader);
}

async function isGameLoaded() {
    await sleep(5000);
    if(window.gameStartLoading === undefined) {
        location.reload();
    }
}

function initFirebaseLibraries() {
    initializeFireBase();
    initRemoteConfig();
}

function onUnityReady() {
    checkAdBlock();
    sendConfig();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}