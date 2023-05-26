Hooks.on("createActiveEffect", async (effect) => {
  if (effect.label != "Sleeping") return true;
  let token = canvas.tokens.controlled[0];
  const cores = [
    "dark_green",
    "dark_orangepurple",
    "dark_pink",
    "dark_purple",
    "blue",
    "green",
    "pink",
    "purple",
    "orangepurple",
    "yellow",
  ];
  const cor = cores[Math.floor(Math.random() * cores.length)];
  new Sequence()
    .effect()
    .file(`jb2a.sleep.symbol.${cor}`)
    .attachTo(token)
    .persist()
    .name("Sleeping")
    .elevation(0)
    .play();
});

Hooks.on("deleteActiveEffect", async (effect) => {
  if (effect.label !== "Sleeping") return true;
  let token = canvas.tokens.controlled[0];
  Sequencer.EffectManager.endEffects({ name: "*Sleeping*", object: token });
});
