// ── Configuration ────────────────────────────────────────────────────────────
// Edit these values to customise generated callouts without touching the rest
// of the plugin.
const CONFIG = {
    // Labels shown in the annotation right-click menu.
    menuLabel: "Copy Obsidian Callout",
    menuLabelLink: "Copy Zotero Link",

    // Callout type used when an annotation type is not in the maps below.
    defaultCalloutType: "PDF|note",

    // Maps Zotero annotation types → Obsidian callout type.
    // For "highlight" annotations, colorCalloutMap is checked first.
    annotationCalloutMap: {
        highlight: "PDF|highlight",
        note:      "PDF|note",
        underline: "PDF|underline",
        image:     "PDF|image",
        ink:       "PDF|ink",
    },

    // Maps Zotero highlight colours (hex) → Obsidian callout type.
    // Only used for "highlight" annotations; falls back to annotationCalloutMap.
    colorCalloutMap: {
        "#ffd400": "PDF|yellow",
        "#ff6666": "PDF|red",
        "#5fb236": "PDF|green",
        "#2ea8e5": "PDF|blue",
        "#a28ae5": "PDF|purple",
        "#e56eee": "PDF|magenta",
        "#f19837": "PDF|orange",
        "#aaaaaa": "PDF|gray",
    },

    // Prefix inserted before the annotation comment in the callout body.
    commentPrefix: "**Note:**",
};
// ─────────────────────────────────────────────────────────────────────────────

// Reads a file and returns a base64-encoded string, or null on failure.
async function readImageAsBase64(path) {
    try {
        const bytes = await IOUtils.read(path);
        let binary = "";
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
        }
        return btoa(binary);
    } catch (e) {
        log(`Could not read image at ${path}: ${e}`);
        return null;
    }
}

ZoteroAnnotCopy = {
    id: null,
    version: null,
    rootURI: null,

    startup(id, version, rootURI) {
        this.id = id;
        this.version = version;
        this.rootURI = rootURI;

        log("startup called");

        // Resolves annotation + parent PDF item, or returns null on failure.
        async function resolveAnnotation(reader, annotationKey) {
            const libraryID = reader.itemID
                ? Zotero.Items.get(reader.itemID)?.libraryID
                : Zotero.Libraries.userLibraryID;

            const annotationItem = await Zotero.Items.getByLibraryAndKeyAsync(libraryID, annotationKey);
            if (!annotationItem) {
                log(`Annotation not found (key: ${annotationKey})`);
                return null;
            }

            const pdfItem = Zotero.Items.get(annotationItem.parentItemID);
            if (!pdfItem) {
                log(`Could not find parent PDF item ${annotationItem.parentItemID}`);
                return null;
            }

            return { annotationItem, pdfItem };
        }

        Zotero.Reader.registerEventListener("createAnnotationContextMenu", (event) => {
            const { reader, params, append } = event;

            append({
                label: CONFIG.menuLabel,
                async onCommand() {
                    log(`Copying callout for annotation ${params.ids[0]}`);
                    const resolved = await resolveAnnotation(reader, params.ids[0]);
                    if (!resolved) return;
                    const { annotationItem, pdfItem } = resolved;

                    const text    = annotationItem.annotationText?.trim() ?? "";
                    const comment = annotationItem.annotationComment?.trim() ?? "";
                    const color   = annotationItem.annotationColor ?? "";
                    const aType   = annotationItem.annotationType ?? "highlight";
                    const aPos    = JSON.parse(annotationItem.annotationPosition);
                    const page    = annotationItem.annotationPageLabel ?? "?";
                    const pageIdx = aPos.pageIndex + 1;

                    const calloutType = (aType === "highlight" && CONFIG.colorCalloutMap[color])
                        ? CONFIG.colorCalloutMap[color]
                        : (CONFIG.annotationCalloutMap[aType] ?? CONFIG.defaultCalloutType);

                    const uri = `zotero://open-pdf/library/items/${pdfItem.key}?page=${pageIdx}&annotation=${annotationItem.key}`;

                    let callout = `> [!${calloutType}] [Page ${page}](${uri})`;
                    if (text) {
                        callout += `\n> ${text}`;
                    }
                    if (aType === "image" || aType === "ink") {
                        const imgPath = Zotero.Annotations.getCacheImagePath(annotationItem);
                        log(`Cache image path for ${aType}: ${imgPath}`);
                        const b64 = imgPath ? await readImageAsBase64(imgPath) : null;
                        if (b64) {
                            callout += `\n> ![](data:image/png;base64,${b64})`;
                        } else {
                            log(`No cached image available for annotation ${annotationItem.key}`);
                        }
                    }
                    if (comment) {
                        callout += `\n> \n> ${CONFIG.commentPrefix} ${comment}`;
                    }

                    Zotero.Utilities.Internal.copyTextToClipboard(callout);
                    log(`Copied callout:\n${callout}`);
                },
            });

            append({
                label: CONFIG.menuLabelLink,
                async onCommand() {
                    log(`Copying link for annotation ${params.ids[0]}`);
                    const resolved = await resolveAnnotation(reader, params.ids[0]);
                    if (!resolved) return;
                    const { annotationItem, pdfItem } = resolved;

                    const aPos    = JSON.parse(annotationItem.annotationPosition);
                    const pageIdx = aPos.pageIndex + 1;
                    const uri = `zotero://open-pdf/library/items/${pdfItem.key}?page=${pageIdx}&annotation=${annotationItem.key}`;

                    Zotero.Utilities.Internal.copyTextToClipboard(uri);
                    log(`Copied link: ${uri}`);
                },
            });
        }, this.id);
    },

    // Called when Zotero shuts down or the plugin is disabled.
    shutdown() {
        log("shutdown called");
        Zotero.Reader.unregisterEventListener(this.id);
    },
};
