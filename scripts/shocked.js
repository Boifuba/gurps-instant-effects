Hooks.on('createActiveEffect', async (effect)=>{
    if (effect.label!='Shocked') return true;
    {
  let token = canvas.tokens.controlled[0]
  console.log("hookado")
   new Sequence()
  .effect()
  .name("Shocked")
  .file("https://i.imgur.com/8Yr9fMC.png")
  .atLocation(token)
  .anchor({x: 0.5, y: 1.55})
  .scaleIn(0, 500, {ease: "easeOutElastic"})
  .scaleOut(0, 500, {ease: "easeOutExpo"})
  .loopProperty("sprite", "position.y", { from: 0, to: -15, duration: 750, pingPong: true})
  .persist()
  .scaleToObject(0.6)
  .attachTo(token, {bindAlpha: false})
  .private()
  
  
  .effect()
  .name("Shocked")
  .file("https://i.imgur.com/myWyksT.png")
  .atLocation(token)
  .anchor({x: -0.3, y: 1.25})
  .scaleIn(0, 500, {ease: "easeOutElastic"})
  .scaleOut(0, 500, {ease: "easeOutExpo"})
  .loopProperty("sprite", "position.y", { from: 0, to: -15, duration: 750, pingPong: true})
  .persist()
  .scaleToObject(0.45)
  .attachTo(token, {bindAlpha: false})
  .waitUntilFinished()
  .play()
  }})
  Hooks.on('deleteActiveEffect', async (effect) => {
    if (effect.label !== 'Shocked') return true;
    let token = canvas.tokens.controlled[0];
    Sequencer.EffectManager.endEffects({ name: "*Shocked*", object: token });
  
  
  });