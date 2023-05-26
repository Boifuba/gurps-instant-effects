Hooks.on('createActiveEffect', async (effect)=>{
    if (effect.label!='Reeling') return true;
  let token = canvas.tokens.controlled[0]
   new Sequence()
              .effect()
              .file('jb2a.icon.drop.red')
              .attachTo(token)
              .persist()
              .name("Reeling")
              .elevation(0)
              .play();
  
  })
  
  Hooks.on('deleteActiveEffect', async (effect) => {
    if (effect.label !== 'Reeling') return true;
    let token = canvas.tokens.controlled[0];
    Sequencer.EffectManager.endEffects({ name: "*Reeling*", object: token });
  
  
  });