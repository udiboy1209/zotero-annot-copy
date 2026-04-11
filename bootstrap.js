"use strict";

let ZoteroAnnotCopy;

function log(msg) {
    Zotero.debug(`[ZoteroAnnotCopy] ${msg}`);
}

function startup({ id, version, rootURI }) {
    log("Starting");
    Services.scriptloader.loadSubScript(rootURI + "zotero-annot-copy.js");
    ZoteroAnnotCopy.startup(id, version, rootURI);
}

function onMainWindowLoad({ window }) {}

function onMainWindowUnload({ window }) {}

function shutdown() {
    log("Shutting down");
    ZoteroAnnotCopy.shutdown();
    ZoteroAnnotCopy = undefined;
}

function install() {
    log("Installed");
}

function uninstall() {
    log("Uninstalled");
}
