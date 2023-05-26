Hooks.on('createActiveEffect', async (effect) => {
    if (effect.label != 'Nauseated') return true;
    let token = canvas.tokens.controlled[0]
    
    

    new Sequence()

        .effect()
        .file("https://i.imgur.com/TEcpsDG.png")
        .name("Nauseated")
        .delay(0, 500)
        .atLocation(token, { offset: { x: -0.2 * token.document.data.width, y: -0.6 * token.document.data.width }, gridUnits: true })
        .duration(7000)
        .scaleToObject(0.05)
        .zeroSpriteRotation()
        .loopProperty("sprite", "position.x", { from: 0, to: -0.02, duration: 2000, pingPong: true, gridUnits: true, ease: "linear" })
        .loopProperty("sprite", "position.y", { from: 0.15, to: -0.15, duration: 6000, pingPong: false, gridUnits: true, ease: "easeOutSine" })
        .loopProperty("sprite", "width", { from: 0, to: 0.1, duration: 6000, pingPong: false, gridUnits: true, ease: "easeOutCubic" })
        .loopProperty("sprite", "height", { from: 0, to: 0.1, duration: 6000, pingPong: false, gridUnits: true, ease: "easeOutCubic" })
        .loopProperty("alphaFilter", "alpha", { values: [-1, 1, 1, 1, 1, -1], duration: 1000, pingPong: true, ease: "easeOutCubic" })
        .persist()
        .attachTo(token, { bindAlpha: false, followRotation: false })
        .private()

        .effect()
        .file("https://i.imgur.com/9htwrSu.png")
        .name("Nauseated")
        .atLocation(token, { offset: { x: -0.35 * token.document.data.width, y: -0.5 * token.document.data.width }, gridUnits: true })
        .duration(7000)
        .delay(0, 600)
        .scaleToObject(0.05)
        .zeroSpriteRotation()
        .loopProperty("sprite", "position.x", { from: 0, to: 0.05, duration: 2000, pingPong: true, gridUnits: true, ease: "easeOutSine" })
        .loopProperty("sprite", "position.y", { from: 0.15, to: -0.15, duration: 6000, pingPong: false, gridUnits: true, ease: "easeOutSine" })
        .loopProperty("sprite", "width", { from: 0, to: 0.1, duration: 6000, pingPong: false, gridUnits: true, ease: "easeOutCubic" })
        .loopProperty("sprite", "height", { from: 0, to: 0.1, duration: 6000, pingPong: false, gridUnits: true, ease: "easeOutCubic" })
        .loopProperty("alphaFilter", "alpha", { values: [-1, 1, 1, 1, 1, -1], duration: 1000, pingPong: true, ease: "easeOutCubic" })
        .persist()
        .attachTo(token, { bindAlpha: false, followRotation: false })
        .private()

        .effect()
        .file("https://i.imgur.com/sbFfp0N.png")
        .name("Nauseated")
        .atLocation(token, { offset: { x: -0.2 * token.document.data.width, y: -0.5 * token.document.data.width }, gridUnits: true })
        .duration(7000)
        .delay(750, 1000)
        .scaleToObject(0.05)
        .zeroSpriteRotation()
        .loopProperty("sprite", "position.x", { from: 0, to: 0.05, duration: 2000, pingPong: true, gridUnits: true, ease: "easeOutSine" })
        .loopProperty("sprite", "position.y", { from: 0.15, to: -0.15, duration: 6000, pingPong: false, gridUnits: true, ease: "easeOutSine" })
        .loopProperty("sprite", "width", { from: 0, to: 0.1, duration: 6000, pingPong: false, gridUnits: true, ease: "easeOutCubic" })
        .loopProperty("sprite", "height", { from: 0, to: 0.1, duration: 6000, pingPong: false, gridUnits: true, ease: "easeOutCubic" })
        .loopProperty("alphaFilter", "alpha", { values: [-1, 1, 1, 1, 1, -1], duration: 1000, pingPong: true, ease: "easeOutCubic" })
        .persist()
        .attachTo(token, { bindAlpha: false, followRotation: false })
        .private()

        .effect()
        .file("https://i.imgur.com/rqJmMPK.png")
        .name("Nauseated")
        .atLocation(token, { offset: { x: -0.1 * token.document.data.width, y: -0.3 * token.document.data.width }, gridUnits: true })
        .duration(7000)
        .delay(500, 1200)
        .scaleToObject(0.05)
        .zeroSpriteRotation()
        .loopProperty("sprite", "position.x", { from: 0, to: -0.05, duration: 2000, pingPong: true, gridUnits: true, ease: "easeOutSine" })
        .loopProperty("sprite", "position.y", { from: 0.15, to: -0.15, duration: 6000, pingPong: false, gridUnits: true, ease: "easeOutSine" })
        .loopProperty("sprite", "width", { from: 0, to: 0.1, duration: 6000, pingPong: false, gridUnits: true, ease: "easeOutCubic" })
        .loopProperty("sprite", "height", { from: 0, to: 0.1, duration: 6000, pingPong: false, gridUnits: true, ease: "easeOutCubic" })
        .loopProperty("alphaFilter", "alpha", { values: [-1, 1, 1, 1, 1, -1], duration: 1000, pingPong: true, ease: "easeOutCubic" })
        .persist()
        .attachTo(token, { bindAlpha: false, followRotation: false })
        .private()

        .animation()
        .on(token)
        .opacity(0)

        .effect()
        .file("https://i.imgur.com/HJ3pGDb.png")
        .name("Nauseated")
        .opacity(0.85)
        .scaleToObject(0.4)
        .loopProperty("spriteContainer", "position.x", { from: -20, to: 20, duration: 2500, pingPong: true, ease: "easeInOutSine" })
        .loopProperty("sprite", "position.y", { values: [0, 20, 0, 20], duration: 2500, pingPong: true })
        .loopProperty("sprite", "rotation", { from: -10, to: 10, duration: 2500, pingPong: true, ease: "easeInOutSine" })
        .persist()
        .attachTo(token)
        .zIndex(0)
        .private()

        .effect()
        .from(token)
        .name("Nauseated")
        .atLocation(token)
        .loopProperty("spriteContainer", "position.x", { from: -20, to: 20, duration: 2500, pingPong: true, ease: "easeInOutSine" })
        .loopProperty("sprite", "position.y", { values: [0, 20, 0, 20], duration: 2500, pingPong: true })
        .loopProperty("sprite", "rotation", { from: -10, to: 10, duration: 2500, pingPong: true, ease: "easeInOutSine" })
        .persist()
        .attachTo(token, { bindAlpha: false })
        .waitUntilFinished()
.play()


})



Hooks.on('deleteActiveEffect', async (effect) => {
    if (effect.label !== 'Nauseated') return true;
    let token = canvas.tokens.controlled[0];
    Sequencer.EffectManager.endEffects({ name: "*Nauseated*", object: token });


});