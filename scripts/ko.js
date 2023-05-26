

Hooks.on("updateCombatant", function(combatant, change){
    if(game.user.isGM && (change.defeated === true)) {
      const {x,y} = combatant.token;
      canvas.animatePan({x,y, scale:1});
  
   new Sequence()
    .effect()
      .file(`worlds/parachronics/img/ko.webm`)
      .atLocation(combatant.token)
      .scale(1)
    .play()
  }
  });