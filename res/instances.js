const constant              = require('./const.js');
const keybinds              = require('./keybindings.js');
const {BrowserWindow, Menu, webContents} = require('electron');

let usedAltPagesNumbers = [];

// SS asks for them.... Also WikiView JUST because i wanted it in a separeted file organized.
const fs       = require('fs');
const path     = require('path');
let   isAltKPageUp = false;

// For notify Window's original names.
let winTimeRef = {};
let winNames   = {}; // Fake dictionary


// New page function
function newBrowserWindow(new_path, isMainWin=false){
    var config;
    if (isMainWin) config = constant.mainConfig;
    else if (_isGameWindow(new_path)) config = constant.gameConfig;
    else config = constant.winConfig;
    
    const newWin = new BrowserWindow(config);
    newWin.setMenuBarVisibility(false); //Remove default electron menu
    newWin.loadURL(new_path);
    
    if (new_path == constant.mainPath || 
        new_path == constant.testingAQW) {

        // Its alt window, Put the aqlite/Aqw title...
        var windowNumber = 1;
        
        for (;usedAltPagesNumbers.includes(windowNumber);windowNumber++){
             if (windowNumber === 2000) {
                console.log("just how long is this opened!?!?");
                break;
            };
        }
        
        // Deciding the new title name...
        var winTitle = "";
        if (new_path == constant.mainPath){
            winTitle = "AquaStar - " + (constant.isOldAqlite ? "Older/Custom AQLite":" Adventure Quest Worlds");
        }
        else {
            winTitle = "AquaStar - AQW Testing Version!";
        }
        if (windowNumber > 1) winTitle += " (Window " + windowNumber + ")";
            
        newWin.setTitle(winTitle);

        // Storing and Removing the window number from a list.
        usedAltPagesNumbers.push(windowNumber);
        newWin.on('closed', () => {
            usedAltPagesNumbers.splice(
                usedAltPagesNumbers.indexOf(windowNumber), 1);
        });
    }
    else if (new_path == constant.df_url) {
        newWin.setTitle("AquaStar - DragonFable");
    }
    else {
        /// Its a usual HTML page window then! features incomming
        /// ... but only if its win or lunix. Mac doesnt have the feature -_-
        /// Mac still get keybinds tho, just not the menu.
        newWin.setMenuBarVisibility(true);
    }
    
    _windowAddContext(newWin);
    
    return newWin;
}

// Now, every window created with actions like CTRL + click, can have the right click menu too.
function _windowAddContext(newWin){
    // First, a security check. No more than 70 windows opened at once...
    if (BrowserWindow.getAllWindows().length > 70){
        Console.log("This is very problematic... If you are seeing this in terminal, do a CTRL + C on it and cancel the program!");
        return;
    }
    
    if (constant.isDebugBuild) newWin.setTitle(newWin.getTitle() + " < Debug >");
    
    // Context Menu part
    var contextMenu = Menu.buildFromTemplate( 
        constant.getMenu(keybinds.keybinds,takeSS,true));
    newWin.webContents.on("context-menu",(e,param)=>{
        contextMenu.popup({
            window: newWin,
            x: param.x,
            y: param.y
        });
    })
    
    // "Child Windows follow the same rule" part
    newWin.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
        event.preventDefault()
        childWin = new BrowserWindow(constant.winConfig);
        childWin.loadURL(url);
        _windowAddContext(childWin);
        event.newGuest = childWin;
    })
    
    // Bonus: Hug popup (yeah, Hug them hard.)
    newWin.webContents.on("did-finish-load", () => {
        var url = newWin.getURL();
        function testAndDelete (testURL,objName,isClass = false) {
            if(url.includes(testURL)){
                var codeTest;
                codeTest = (isClass)? 
                    "(document.getElementsByClassName('" + objName + "')[0] == undefined)? false : true":
                    "(document.getElementById('" + objName + "') == undefined)? false : true;";

                newWin.webContents.executeJavaScript(codeTest).then((popUpExists) =>{
                    if (popUpExists) {
                        var codeNuke;
                        codeNuke = (isClass)? 
                            "document.getElementsByClassName('" + objName + "')[0].innerHTML = ''":
                            "document.getElementById('" + objName + "').innerHTML = ''";
                        newWin.webContents.executeJavaScript(codeNuke);
                    }
                });
            }
        }
        testAndDelete("wikidot","ncmp__tool",false);
        testAndDelete("aq.com","fb-page",true);

        // Ads. Bc wiki is being too trashy to get ad revenue from me.
        testAndDelete("wikidot","wad-aqwwiki-above-content",false);
        testAndDelete("wikidot","wad-aqwwiki-below-content",false);
        newWin.webContents.executeJavaScript("var rem = document.getElementsByTagName('iframe');" +
        "for (var i=0;i<rem.lenght;i++) rem[i].remove()");
        // ----------------------------------------------------------------------------------------------
        // Another bonus: Wiki link preview (WikiView), made by biglavis over at https://github.com/biglavis
        //  Available on the file wikiviewsource.js. same folder as this one.
        
        const checkWiki     = /aqwwiki\.wikidot\.com\/.+/gi
        const checkCharPage = /account\.aq\.com\/CharPage\?id=.+/gi
        const checkAccountAq= /account\.aq\.com\/AQW\/(Inventory|BuyBack|WheelProgress|House)/gi

        const bWiki = checkWiki.test(url)
        const bCp   = checkCharPage.test(url)
        const bAcc  = checkAccountAq.test(url)

        //newWin.webContents.executeJavaScript("console.log('Wiki "+ bWiki +"')")
        //newWin.webContents.executeJavaScript("console.log('charpage "+ bCp +"')")
        //newWin.webContents.executeJavaScript("console.log('account "+ bAcc +"')")

        // This code of mine is weird, yes, but the correct way is BLACK MAGIC UNSTABLE. I am going insane.
        var isViewUrl = false
        if (bWiki) isViewUrl = true
        if (bCp)   isViewUrl = true
        if (bAcc)  isViewUrl = true

        //newWin.webContents.executeJavaScript("console.log('IsViewUrl: "+ isViewUrl +"')")
        //newWin.webContents.executeJavaScript("console.log('IsViewUrlBruto: "+ bWiki + bCp + bAcc +" = "+ (bWiki || bCp || bAcc) + "')")

        if (isViewUrl){
            // Prepare the javascript for it
            //  It uses the already available JQuery.
            //newWin.webContents.executeJavaScript("console.log('ValidURL. loading WikiView...')")

            var wikiview = fs.readFileSync(path.join(__dirname,'wikiviewsource.js'), 'utf8');
            if (bWiki){
                //newWin.webContents.executeJavaScript("console.log('Wiki2 "+bWiki +"')")
                // THAT SAID. wiki doesnt have jquery. load it just for it. I hate dependencies but ooooh well
                //  This file is the exact same as the one the original script asked. same version, everything.
                const jquery = fs.readFileSync(path.join(__dirname,'jquery.min.js'), 'utf8');
                wikiview = jquery + wikiview
                
            }
            newWin.webContents.executeJavaScript(wikiview);
        }
    });
}

/// GAME WINDOW ONLY
function executeOnFocused(funcForWindow, onlyHtml = false, considerDF = false){
    // Friendly reminder for BrowserWindow.getAllWindows() existing
    var focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow === null) {
        // No AquaStar Windows are focused. Do nothing.
        return;
    }
    // Is it a game or is it a HTML..?
    var isGame = _isGameWindow(focusedWindow.webContents.getURL(), considerDF);

    // Compacting of the XOR gave me this... LOOL
    if (onlyHtml == !isGame) funcForWindow(focusedWindow);
}

/// ANY APP WINDOW WILL DO
function executeOnAnyFocused(funcForWindow){
    // NO FUNCTION USES IT, HERE FOR THE FUTURE!
    var focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow === null) {
        // No AquaStar Windows are focused. Do nothing.
        return;
    }
    funcForWindow(focusedWindow);
}

function _isGameWindow(url, considerDF = true){
    
    var aqliteValue = constant.mainPath;
    var vanilla     = constant.testingAQW;
    if(process.platform == "win32") {
        // I so want to swear RN... just WHY???
        // Now when comparing to the file:///, its the same rules as URL.
        aqliteValue = constant.mainPath.replace(/\\/g,"/");
        vanilla     = constant.testingAQW.replace(/\\/g,"/");
    }
    
    if (url == aqliteValue || url == vanilla) return true;
    if (considerDF && url === constant.df_url) {
        return true;
    }
    return false;
}

// Weird char page config - For Alt + K
function charPagePrint(){
    // Check if its valid keybind.
    var focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow == null) return;
    var url = focusedWindow.webContents.getURL();
    if( !url.includes(constant.charLookup + "?id=")) { return };

    let code = `(document.getElementsByTagName("object")[0] == undefined)? false : true;`;
    focusedWindow.webContents.executeJavaScript(code).then((flashExists) =>{
        if(!flashExists){
            _notifyWindow(focusedWindow,constant.titleMessages.invalidCharpage);
        }
        else {
            //VALID! Lets start...
            const newWin = new BrowserWindow(constant.charConfig);
            newWin.setMenuBarVisibility(false);
            _notifyWindow(focusedWindow,constant.titleMessages.loadingCharpage, false);
            newWin.loadURL(url);
            
            // Fix for closing the window too soon...
            isAltKPageUp = true;
            focusedWindow.on('closed', () => {
                isAltKPageUp = false;
            });
            
            newWin.webContents.on("did-finish-load", () => {

                if(isAltKPageUp) _notifyWindow(focusedWindow,constant.titleMessages.buildingCharpage, false);

                // Lets figure it out how to take the sizes
                const wOri = 715;
                const hOri = 455;
                var rect = null;
                setTimeout(()=>{ 
                    const siz = newWin.getSize();
                    if ( (siz[0]/siz[1]) > (wOri/hOri) ){
                        // Window has bigger Width ratio than the original
                        // Scale using Height! reduction is to account for window bar.
                        var h = siz[1]
                        var nw = wOri*(h/hOri)
                        rect = {
                            x: Math.round((siz[0]-nw)/2),
                            y: 0,
                            width:  Math.round(nw),
                            height: h
                        }
                    }
                    else {
                        var w = siz[0]
                        var nh = hOri*(w/wOri)
                        rect = {
                            x: 0,
                            y: 0,
                            width:  w,
                            height: Math.round(nh)
                        }
                    }
                    takeSS(newWin,rect,true);
                    if(isAltKPageUp) _notifyWindow(focusedWindow,constant.titleMessages.cpDone);
                },5000);
            });
        }
    });
//TODO - find a way to detect when flash is done loading!
}

// Take a screenshot of the screen. 
// Customizable options in parameter are there for the charPagePrint function
function takeSS(focusedWin, ret = null, destroyWindow = false){
    // If ret is passed, we figure how to take the SS.
    // Format is the rectangle one;
    var rect = null;
    if (ret == null || ret == undefined){
        rect = {
            x: 0,
            y: 0,
            width:  focusedWin.getContentSize()[0],
            height: focusedWin.getContentSize()[1]
        }
    }
    else { rect = ret;}
    focusedWin.webContents.capturePage(
        rect,
        (sshot) => {
            console.log("Screenshotting it...");
            // Create SS directory if doesnt exist
            var ssfolder = constant.sshotPath;
            _mkdir(ssfolder);

            // Figure out the filename ----------
            var today = new Date();
            var pre_name = "Screenshot-" +
                today.getFullYear() + "-" +
                (today.getMonth() + 1) + "-" +
                today.getDate() + "_";
    
            // Find the number for it
            var extraNumberName = 1;
            for (;;extraNumberName++){
                if (fs.existsSync( path.join( ssfolder, pre_name + extraNumberName + ".png"))){
                    if (extraNumberName === 10000) {
                        console.log("10000 prints per day...? wow! Thats a lot!");
                    }
                    continue;
                }
                else break;
            }
            var sshotFileName = pre_name + extraNumberName + ".png";
            var savePath = path.join(ssfolder, sshotFileName);
            // Save it. ----------------
            fs.writeFileSync(path.join(ssfolder, sshotFileName), sshot.toPNG());
            console.log(constant.titleMessages.doneSavedAs + savePath);
            if (!destroyWindow){
                // Usefull for char page builds
                _notifyWindow(focusedWin,constant.titleMessages.doneSavedAs + savePath);
            }
            else {
                focusedWin.close();
            }
        }
    );
}

function _notifyWindow(targetWin, notif, resetAfter = true){
    // Setup for it
    if (winNames[targetWin.id] == null || 
        winNames[targetWin.id] == undefined ){
            // Save if needed
            winNames[targetWin.id] = targetWin.getTitle();
    }

    targetWin.setTitle(notif);

    if (resetAfter) {
        targetWin.on('close',() => {
            // Cancel the reset. avoid the error when there is no window anymore (closed)!
            clearTimeout(winTimeRef[targetWin.id]);
            targetWin = null; // default kinda deal
        });
        // Reset timer, as each SS needs to have a time to show
        clearTimeout(winTimeRef[targetWin.id]);
        winTimeRef[targetWin.id] = setTimeout(() => {
            targetWin.setTitle(winNames[targetWin.id]);
        },3200);
    }
}

function _mkdir (filepath){ 
    try { fs.lstatSync(filepath).isDirectory() }
    catch (ex) {
        if (ex.code == 'ENOENT') {
            fs.mkdir(filepath, (err) =>{
                console.log(err);
            })
        }
        else console.log(ex);
    }
}

exports.newBrowserWindow    = newBrowserWindow;
exports.charPagePrint       = charPagePrint;

exports.executeOnFocused    = executeOnFocused;
exports.takeSS              = takeSS;
exports.notifyWin           = _notifyWindow;
exports.mkdir               = _mkdir;
