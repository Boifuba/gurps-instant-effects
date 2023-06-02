Hooks.on("deleteToken", async function explosionOnDelete(token){
    const {size} = canvas.scene.dimensions;
    const tex = await loadTexture("modules/jb2a_patreon/Library/Generic/Explosion/Explosion_01_Orange_400x400.webm");
    tex.orig = {height: 3 * token.height * size, width: 3 * token.width * size,  x: 0, y:0};
    const spr = new PIXI.Sprite(tex);
    spr.anchor.set(0.333);
    spr.x = token.x
    spr.y = token.y
    spr.texture.baseTexture.resource.source.loop = false;
    spr.texture.baseTexture.resource.source.play();
    const c = canvas.tokens.addChild(spr);
    await FreezeFunctions.wait(1000);
    canvas.tokens.removeChild(c)
});