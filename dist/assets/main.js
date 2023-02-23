const path$2=window.require("path"),SIYUAN_DATA_PATH=window.siyuan.config.system.dataDir,PLUGIN_FOLDER="plugins",VERSION="v0.2.0",VERSION_URL="https://gitee.com/zuoez02/siyuan-plugin-system/raw/main/VERSION",SCRIPT_URL="https://gitee.com/zuoez02/siyuan-plugin-system/raw/main/main.js",PLUGIN_SYS_ABS_PATH=path$2.join(getCrossPlatformAppDataFolder(),".siyuan","plugin.js");window.require("path");const log=(...n)=>{console.log("[Plugin System] ",...n)},error=(...n)=>console.error("[Plugin System] ",...n),reloadWindow=()=>window.location.reload(),fs$1=window.require("fs"),path$1=window.require("path"),pluginScriptPosition=PLUGIN_SYS_ABS_PATH;class PluginSystemLocalManager{saveToLocal(t,e){return new Promise((o,i)=>{const{writeFile:s}=fs$1,{Buffer:a}=require("buffer"),l=new Uint8Array(a.from(e));s(t,l,r=>{if(r)return i(r);o("The file has been saved!")})})}createFile(t){return new Promise((e,o)=>{fs$1.mkdir(path$1.dirname(t),{recursive:!0},i=>{if(i)return o(i);e("Directory created successfully!")})})}async localCacheInit(){try{fs$1.statSync(pluginScriptPosition),setTimeout(()=>{this.tryUpgrade()},1e3);return}catch{log("Plugin system not found")}const t=window.siyuanPluginScript;t&&(await this.createFile(pluginScriptPosition),await this.saveToLocal(pluginScriptPosition,t),setTimeout(()=>{this.tryUpgrade()},1e3))}async tryUpgrade(){log("Try getting online version");const t=await this.getOnlineVersion();t!==VERSION?(log("Online Version: "+t+", local version: "+VERSION),log("Downloading new version of Plugin System"),this.upgrade()):log("Version is "+VERSION+", OK")}async getOnlineVersion(){return fetch(VERSION_URL,{cache:"no-cache"}).then(t=>t.text())}async upgrade(){const t=await fetch(SCRIPT_URL,{cache:"no-cache"}).then(e=>e.text());t&&(await this.createFile(pluginScriptPosition),await this.saveToLocal(pluginScriptPosition,t),log("Plugin system upgraded, reloading..."),setTimeout(()=>reloadWindow(),3e3))}}class Plugin{onload(){}onunload(){}}const apiGenerate=()=>({addToolbarLeft:()=>{console.log("add toolbar left")},addToolbarRight:()=>{console.log("add toolbar right")}});class BaseComponent{}const modules={Plugin,BaseComponent},fs=window.require("fs"),path=window.require("path"),MANIFEST="manifest.json",SCRIPT="main.js",scanPlugins=async n=>new Promise((t,e)=>{fs.readdir(n,(o,i)=>{if(o){e(o);return}t(i.map(s=>path.resolve(n,s)))})}),getFileContent=async n=>new Promise((t,e)=>{fs.readFile(n,(o,i)=>{if(o){e(o);return}return t(i.toString("utf8"))})}),getManifest=async n=>{const t=await getFileContent(n);try{return JSON.parse(t)}catch(e){error("loading manifest: "+n,e)}},getScript=async n=>await getFileContent(n),getAllPlugins=async()=>{const n=await scanPlugins(path.join(SIYUAN_DATA_PATH,PLUGIN_FOLDER));if(!n||!n.length){log("No plugin found in "+path.join(SIYUAN_DATA_PATH,PLUGIN_FOLDER));return}const t=[];for(const e of n){log("Loading plugin: "+e);const[o,i]=await Promise.all([getManifest(path.join(e,MANIFEST)),getScript(path.join(e,SCRIPT))]);t.push({...o,script:i})}return t};let components;class PluginLoader{constructor(){this.plugins=new Map}async loadAllLocalPlugins(){const n=await getAllPlugins();if(n)for(const t of n)await this.loadPlugin(t)}async loadPlugin(plugin){components||this.generateRequiredModules();const exports={},module={exports};function run(script,name){return eval("(function anonymous(require,module,exports){".concat(script,`
})
//# sourceURL=`).concat(name,`
`))}const __require=n=>{if(components[n])return components[n];throw new Error(`module ${n} not found`)},pluginName=plugin.name;run(plugin.script,plugin.name)(__require,module,exports);let pluginConstructor;if(!(pluginConstructor=(module.exports||exports).default||module.exports))throw new Error(`Failed to load plugin ${pluginName}. No exports detected.`);const plug=new pluginConstructor;if(!(plug instanceof Plugin))throw new Error(`Failed to load plugin ${pluginName}`);plug.onload(),this.plugins.set(pluginName,plug)}async unloadPlugin(n){const t=this.plugins.get(n);t&&(await t.onunload(),this.plugins.delete(n))}generateRequiredModules(){components={siyuan:{...modules,...apiGenerate()}}}}class PluginSystem{constructor(){this.pluginLoader=new PluginLoader,this.pslm=new PluginSystemLocalManager}init(){return this.pluginLoader.loadAllLocalPlugins(),this.pslm.localCacheInit(),this}}window.pluginSystem||(log("Siyuan Plugin System loading..."),window.pluginSystemVersion=VERSION,window.pluginSystem=new PluginSystem().init());
