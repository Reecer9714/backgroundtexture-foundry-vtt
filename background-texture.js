Hooks.on("renderSceneConfig", (app, html, data) => {
  // Add a new input for the background texture URL
  // Create a form group with a label and a file picker input for the background texture
  const textureUrl = app.object.getFlag("background-texture", "url") || "";

  const templatePath = "modules/background-texture/background-texture-form.hbs";
  renderTemplate(templatePath, { textureUrl }).then((bgFieldHtml) => {
    const bgField = $(bgFieldHtml);

    // Activate the file picker for the new input
    new FilePicker({
      type: "imagevideo",
      target: bgField.find("input")[0],
    });

    // Find label <label>Background Color</label> get its parent and insert the new field after it
    const bgColorLabel = html.find('label:contains("Background Color")');
    if (bgColorLabel.length === 0) return;
    bgColorLabel.closest(".form-group").after(bgField);
  });
});

Hooks.on("updateScene", (scene, changes, options, userId) => {
  if (changes.flags?.["background-texture"]?.url !== undefined) {
    // Force a canvas redraw if the background texture changes
    if (canvas.scene?.id === scene.id) canvas.draw();
  }
});

Hooks.on("canvasReady", () => {
  const url = canvas.scene?.getFlag("background-texture", "url");
  if (!url) return;

  // Create a new tiling sprite for the background
  const texture = PIXI.Texture.from(url);
  texture.baseTexture.wrapMode = PIXI.WRAP_MODES.MIRRORED_REPEAT;
  const tilingSprite = new PIXI.TilingSprite(
    texture,
    canvas.dimensions.width,
    canvas.dimensions.height
  );
  tilingSprite.zIndex = -1; // Ensure it is behind other elements

  // Insert the custom background at the bottom of the background container (before the background image)
  canvas.primary.addChildAt(tilingSprite, 0);
});
