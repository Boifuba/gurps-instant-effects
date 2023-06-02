Hooks.on('createActiveEffect', async (effect)=>{
  if (effect.label!='Stunned') return true;
  
let token = canvas.tokens.controlled[0]

 new Sequence()
            .effect()
            .file('jb2a.dizzy_stars.200px.yellow')
            .attachTo(token)
            .persist()
            .name("Stunned")
            .elevation(0)
            .play();

         })

Hooks.on('deleteActiveEffect', async (effect) => {
  if (effect.label !== 'Stunned') return true;
  let token = canvas.tokens.controlled[0];
  Sequencer.EffectManager.endEffects({ name: "*Stunned*", object: token });


});