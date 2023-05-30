Hooks.on('createActiveEffect', async (effect)=>{
    if (effect.label!='Bleeding') return true;
    console.log("hooked")
  let token = canvas.tokens.controlled[0]
   new Sequence()
              .effect()
              .file('jb2a.icon.drop.red')
              .attachTo(token)
              .persist()
              .name("Bleeding")
              .elevation(0)
              .scale(0.5)
              .play();
  
  })
  
  Hooks.on('deleteActiveEffect', async (effect) => {
    if (effect.label !== 'Bleeding') return true;
    let token = canvas.tokens.controlled[0];
    Sequencer.EffectManager.endEffects({ name: "*Bleeding*", object: token });
  
  
  });