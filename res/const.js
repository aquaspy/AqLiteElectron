const {app, BrowserWindow}  = require("electron");
const path   = require("path");
const locale = require("./locale.js");
const fs     = require("fs");
const url    = require("url");

// WARNING - ENABLES DEBUG MODE:
exports.isDebugBuild = false;
//exports.isDebugBuild = true;

/// -------------------------------
/// Section 1 - Setup of URLs and files
/// -------------------------------

/// Inside the app itself. Root of the project
const appRoot = __dirname.substring(0,__dirname.lastIndexOf(path.sep));
/// Where app is ran from.
const appCurrentDirectory = process.cwd();
const appVersion  = require('electron').app.getVersion();
const appName     = "AquaStar";

/// Pictures save location.
const sshotPath = path.join(app.getPath("pictures"),"AquaStar Screenshots");
const iconPath  = path.join(appRoot, 'Icon', 'Icon_1024.png');

const githubPage   = "https://github.com/aquaspy/AquaStar/releases";

const charLookup   = 'https://account.aq.com/CharPage';
const designNotes  = 'https://www.aq.com/gamedesignnotes/';
const accountAq    = 'https://account.aq.com/';
const wikiReleases = 'https://aqwwiki.wikidot.com/new-releases';

const aqwg         = 'https://aqwg.weebly.com/';
const heromart     = 'https://www.heromart.com/';
const battleon     = 'https://portal.battleon.com/';
const calendar     = 'https://www.aq.com/lore/calendar';

exports.vanillaAQW = 'https://www.aq.com/game/gamefiles/Loader.swf'
exports.df_url     = 'https://play.dragonfable.com/game/DFLoader.swf?ver=2'
exports.pagesPath  =  _getFileUrl(path.join(appRoot, 'pages', 'pages.html'))

exports.githubPage       = githubPage;
exports.wikiReleases     = wikiReleases;
exports.accountAq        = accountAq;
exports.designNotes      = designNotes;
exports.charLookup       = charLookup;
exports.aqwg             = aqwg;

exports.appName          = appName;
exports.appVersion       = appVersion;
exports.appRootPath      = appRoot;
exports.appDirectoryPath = appCurrentDirectory;
exports.sshotPath        = sshotPath;

/// Icon Stuff
//const nativeImage = require('electron').nativeImage;
//var iconImage = nativeImage.createFromPath(iconPath);
//    iconImage.setTemplateImage(true);
exports.iconPath = iconPath;


// Fixing file:// urls
function _getFileUrl(path) {
    return url.format({
        pathname: path,
        protocol: 'file:',
        slashes: true
    })
}

/// -------------------------------
/// Section 2 - Original KeyBindings and Custom swf stuff
/// -------------------------------

// Default values - Also present at aquastar_testing.json as a copy of easy access!
const originalKeybinds = {
    wiki:        "Alt+W",
    account:     "Alt+A",
    design:      "Alt+D",
    charpage:    "Alt+P",
    newAqlite:   "Alt+N",
    newAqw:      "Alt+Q",
    newTabbed:   "Alt+Y",
    about:       "F9",
    fullscreen:  "F11",
    sshot:       "F2",
    cpSshot:     "Alt+K",
    reload:      [
        "CmdOrCtrl+F5",
        "CmdOrCtrl+R"
    ],
    reloadCache: "CmdOrCtrl+Shift+F5",
    dragon:      "Alt+1",
    forward:     "Alt+F",
    backward:    "Alt+B",
    help : [
        "Alt+H",
        "CmdOrCtrl+H",
        "F1"
    ],
    settings: "Alt+9" //TODO - Make a screen and do your stuff XD. This is for future proofing
}
exports.originalKeybinds = originalKeybinds;

// Finding out which one to load and if it should load...
var keybingJsonFileName = appName.toLocaleLowerCase() + '.json';
var appdataJsonPath = path.join(app.getPath("appData"), keybingJsonFileName)
var inPathJsonPath  = path.join(appCurrentDirectory, keybingJsonFileName);
var listValidKeybindLocations = [];
if (fs.existsSync(appdataJsonPath)) { listValidKeybindLocations.push(appdataJsonPath) }
if (fs.existsSync(inPathJsonPath))  { listValidKeybindLocations.push(inPathJsonPath)  }

exports.listValidKeybindLocations = listValidKeybindLocations;

// Custom aqlite stuff
var oldAqlite = fs.existsSync( path.join(appCurrentDirectory,'aqlite_old.swf'));
exports.aqlitePath = oldAqlite ? 
            _getFileUrl(path.join(appCurrentDirectory, 'aqlite_old.swf')) :
            //_getFileUrl(path.join(appRoot, 'aqlite.swf'))
            //'https://game.aq.com/game/gamefiles/Loader_Spider.swf';           // not working since OMG 2.001
            //'https://game.aq.com/game/gamefiles/Loader_Spider.swf?ver=2001'    // gamefiles/Loader_Spider.swf?ver=2001
            
            ('https://game.aq.com/game/gamefiles/Loader_Spider.swf?ver=' +
            Math.floor(Math.random() * (900)) + 100); //random ending bt 100 and 1k. IT WAS ABOUT BROWSER CACHE!
            // The above exists bc spider can mess up again the cache. so aqw WONT CACHE anymore.
exports.isOldAqlite = oldAqlite;

/// -------------------------------
/// Section 3 - Window and Menu configuration
/// -------------------------------

// For customizing windows themselfs
function _getWinConfig(type){
    //tab
    //win
    //main
    //cprint
    return (type != "cprint")? 
    {
        width: 960,
        height: 550,
        icon: iconPath,
        webPreferences: {
            nodeIntegration: false,
            sandbox: true,
            webviewTag: ((type == "tab")? true : false),
            plugins: true,
            javascript: true,
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegrationInWorker: false //maybe better performance for more instances in future... Needs testing.
        }
    }:
    {   
        // First off, yes, this is 4K res, no, it wont be your print size.
        // The window caps (in Cinnamon's Muffin at least) at your window size
        // And bc of that, i setted the number as high as i imagined w/o having the chance
        // of the OS complain about the 1 billion window size. I think 4k is a nice number...
        // Sec. YES, it NEEDS both Show off (so doesnt show in user's face) and
        // resizable false, so it stays "maxed size";
        
        width: 3840,
        height: 2160,
        show: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: false,
            sandbox: true,
            plugins: true,
            javascript: true,
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegrationInWorker: false,
            preload: path.join(appRoot,'res','preload_charpage.js'),
        }
    }
}

exports.tabbedConfig = _getWinConfig("tab");
exports.winConfig    = _getWinConfig("win");
exports.mainConfig   = _getWinConfig("main");
exports.charConfig   = _getWinConfig("cprint");

exports.getMenu = (keybinds, funcTakeSS, isContext = false) => {
    // needs to be like that as the function is located on instances...
    if (isContext == false && process.platform == 'darwin') return null;

    var links = 
    [
        {
            label: '<<< ' + menuMessages.backward,
            accelerator: keybinds.backward,
            click(menuItem,focusedWin) {
                var br = focusedWin.webContents;
                if (br.canGoBack()) br.goBack();
            } 
        },
        {
            label: '>>> ' + menuMessages.foward,
            accelerator: keybinds.forward,
            click(menuItem,focusedWin) {
                var br = focusedWin.webContents;
                if (br.canGoForward()) br.goForward();
            }
        }, // Sorry Mac, you cant have those next ones as its not worth it... There is still right click tho
        {
            label: menuMessages.otherPages,
            submenu: [
                {
                    label: menuMessages.wiki,
                    accelerator: keybinds.wiki,
                    click(menuItem,focusedWin) {
                        focusedWin.webContents.loadURL(wikiReleases);
                    }
                },
                {
                    label: menuMessages.design,
                    accelerator: keybinds.design,
                    click(menuItem,focusedWin) {
                        focusedWin.webContents.loadURL(designNotes);
                    }
                },
                {
                    label: menuMessages.account,
                    accelerator: keybinds.account,
                    click(menuItem,focusedWin) {
                        focusedWin.webContents.loadURL(accountAq);
                    }
                },
                {
                    label: menuMessages.charpage,
                    accelerator: keybinds.charpage,
                    click(menuItem,focusedWin) {
                        focusedWin.webContents.loadURL(charLookup);
                    }
                },
                // No keybind now...
                {
                    label: menuMessages.otherPages2,
                    submenu: [
                        {
                            label: menuMessages.calendar,
                            click(menuItem,focusedWin) {
                                focusedWin.webContents.loadURL(calendar);
                            }
                        },
                        {
                            label: menuMessages.aqwg,
                            click(menuItem,focusedWin) {
                                focusedWin.webContents.loadURL(aqwg);
                            }
                        },
                        {
                            label: menuMessages.heromart,
                            click(menuItem,focusedWin) {
                                focusedWin.webContents.loadURL(heromart);
                            }
                        },
                        {
                            label: menuMessages.portal,
                            click(menuItem,focusedWin) {
                                focusedWin.webContents.loadURL(battleon);
                            }
                        }
                    ]
                }
            ]
        },
        {
            label: menuMessages.takeCPSshot,
            accelerator: keybinds.cpSshot,
            click() {
                funcTakeSS();
            }
        }
    ];
    var ret;
    if (isContext){
        ret = [
           {
                label: menuMessages.copyPageURL,
                click(menuItem,focusedWin) {
                    require('electron').clipboard.writeText(
                        focusedWin.webContents.getURL(),'clipboard');
                }
           }
        ];
        ret.push({ type: 'separator' });
        links.forEach((e) => {
            ret.push(e);
        });
        return ret;
    }
    else return links;
}

/// -------------------------------
/// Section 4 - Help and About menus
/// -------------------------------


function showHelpMessage(win){
    const { dialog } = require('electron')
    const dialog_options = {
        buttons: ['Ok'],
        title:   locale.getHelpTitle,
        message: locale.getHelpMessage,
        detail:  locale.getHelpDetail + "\n" +
            locale.getHelpCustomKeyPath + appdataJsonPath + "\n" +
            locale.getHelpScreenshot + sshotPath + "\n" + 
            locale.getHelpAqliteOld + appCurrentDirectory 
    };
    dialog.showMessageBox(win,dialog_options);
}
function showAboutMessage(win) {
    const { dialog } = require('electron')
    const dialog_options = {
        buttons: [locale.getGithubPage,locale.getCloseWindow],
        title:   locale.getAboutTitle + appVersion,
        message: locale.getAboutMessage,
        detail:  locale.getAboutDetail + githubPage +'\n\n\n' +
        locale.getDebug + ":\n" +
        "OS   - " + process.platform + "\n" +
        "ARCH - " + process.arch     + "\n"
    };
    
    // I wish the worse for who created Promisses and async stuff with such poor way to deal with them.
    // Now i have to do ugly and messy code. Good job. ASSHOLE
    // and no, sync version isnt available on our version. Freaking flash....
    dialog.showMessageBox(win,dialog_options, (response) => {
        if (response != 0) return;

        // Cant pull instances module or else would be cyclical.
        const newWin = new BrowserWindow(_getWinConfig("win"));
        newWin.setMenuBarVisibility(true);
        newWin.loadURL(githubPage);
    });
}

exports.showHelpMessage  = showHelpMessage;
exports.showAboutMessage = showAboutMessage;

/// -------------------------------
/// Section 5 - Locale stuff
/// -------------------------------

let menuMessages;
// LOCALE SETUP
exports.setLocale        = (loc, keyb)=> {
    locale.detectLang(loc,keyb);
    exports.titleMessages = {
        invalidCharpage:  locale.getInvalidCharpage,
        loadingCharpage:  locale.getLoadingCharpage,
        buildingCharpage: locale.getBuildingCharpage,
        cpDone:           locale.getCPDone,
        doneSavedAs :     locale.getDoneSavedAs
    }    
    menuMessages = {
        backward:     locale.getMenuBackward,
        foward:       locale.getMenuFoward,
        otherPages:   locale.getMenuOtherPages,
        otherPages2:  locale.getMenuOtherPages2,
        wiki:         locale.getMenuWiki,
        design:       locale.getMenuDesign,
        account:      locale.getMenuAccount,
        charpage:     locale.getMenuCharpage,
        aqwg:         locale.getMenuGuide,
        portal:       locale.getMenuPortal,
        heromart:     locale.getMenuHeromart,
        calendar:     locale.getMenuCalendar,
        takeCPSshot:  locale.getMenuTakeShot,
        copyPageURL:  locale.getMenuCopyURL
    }
    exports.menuMessages = menuMessages;
}
