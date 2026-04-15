# Zotero Annotation Copy

A Zotero 7 plugin that adds context menu options to copy annotations as [Obsidian callout blocks](https://help.obsidian.md/Editing+and+formatting/Callouts).

## Features

- **Copy Obsidian Callout** — copies the annotation as a formatted callout block with a deep link back to the exact page in Zotero
- **Copy Zotero Link** — copies just the `zotero://` URI for the annotation

The callout type is determined by annotation type and highlight colour, so different colours map to different callout styles. Image and ink annotations include the image as an inline base64 embed.

### Example output

```markdown
> [!zotero-highlight-yellow] [Page 42](zotero://open-pdf/library/items/XXXXXXXX?page=42&annotation=YYYYYYYY)
> This is the highlighted text.
>
> **Note:** A comment left on the annotation.
```

## Installation

1. Download `zotero-annot-copy.xpi` from the [latest release](https://github.com/udiboy1209/zotero-annot-copy/releases/latest)
2. In Zotero, go to **Tools → Add-ons**
3. Click the gear icon and choose **Install Add-on From File...**
4. Select the downloaded `.xpi` file
5. Copy the `zotero_callouts.css` to Obsidian CSS snippets (generally `<your-vault>/.obsidian/snippets/`) and enable it to correctly format the copied callouts

Requires Zotero 7.

## TODOs

- [ ] Allow customization of the callout format to not be specific to Obsidian
- [ ] Support image copy to clipboard directly (not as base64 URI)
