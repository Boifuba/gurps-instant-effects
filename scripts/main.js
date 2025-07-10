/**
 * GURPS Instant Effects - Main Module File
 * For Foundry VTT v12 and GURPS System
 */

import { GURPSEffectsManager } from './effects-manager.js';

/**
 * GURPS Instant Effects Turn Manager
 * Handles automatic removal of timed effects when combat advances
 */
class GURPSTurnManager {
  static MODULE_ID = 'gurps-instant-effects';
  static combatHookId = null;
  static deletingTokens = new Set();

  /**
   * Initialize turn-based effect management
   */
  static initialize() {
    console.log(`${this.MODULE_ID} | Initializing turn-based effect management`);
    
    // Clean up any existing hooks
    this.cleanup();
    
    // Register combat update hook for turn/round changes
    this.combatHookId = Hooks.on('updateCombat', this.handleCombatUpdate.bind(this));
    
    console.log(`${this.MODULE_ID} | Turn-based effect removal system activated`);
  }

  /**
   * Handle combat update events
   * Process effect durations when combat round or turn changes
   */
  static async handleCombatUpdate(combat, data) {
    // Only process updates that involve round or turn changes
    if (!('round' in data || 'turn' in data)) {
      return;
    }

    console.log(`${this.MODULE_ID} | Processing combat update for turn/round change`);

    // Process all combatants in the current combat
    for (const combatant of combat.combatants) {
      if (!combatant.token || !combatant.actor) {
        continue;
      }

      await this.processActorEffects(combatant.actor, combatant.token.id);
    }
  }

  /**
   * Process effects on an actor, removing expired ones
   */
  static async processActorEffects(actor, tokenId) {
    if (!actor || !actor.effects) {
      return;
    }

    // Find effects created by this module that are not permanent and not counters
    const moduleEffects = actor.effects.filter(effect => {
      const flags = effect.flags?.[this.MODULE_ID];
      return flags && !flags.isPermanent && !flags.isCounter;
    });

    if (moduleEffects.length === 0) {
      return;
    }

    console.log(`${this.MODULE_ID} | Processing ${moduleEffects.length} timed effect(s) on ${actor.name}`);

    const effectsToRemove = [];

    for (const effect of moduleEffects) {
      try {
        // Check if effect has expired based on duration
        if (this.isEffectExpired(effect)) {
          effectsToRemove.push(effect);
        }
      } catch (error) {
        console.error(`${this.MODULE_ID} | Error checking effect ${effect.id} on ${actor.name}:`, error);
      }
    }

    // Remove expired effects
    if (effectsToRemove.length > 0) {
      await this.removeExpiredEffects(actor, effectsToRemove);
    }
  }

  /**
   * Check if an effect has expired based on its duration
   */
  static isEffectExpired(effect) {
    // If no duration is set, it's permanent
    if (!effect.duration || !effect.duration.rounds) {
      return false;
    }

    // Check if the effect has remaining duration
    const remaining = effect.duration.remaining;
    
    // If remaining is 0 or negative, the effect has expired
    return remaining !== undefined && remaining <= 0;
  }

  /**
   * Remove expired effects from an actor
   */
  static async removeExpiredEffects(actor, effects) {
    try {
      const effectIds = effects.map(e => e.id);
      await actor.deleteEmbeddedDocuments('ActiveEffect', effectIds);
      
      // Notify about removed effects
      for (const effect of effects) {
        ui.notifications.info(`${effect.name} expirou e foi removido de ${actor.name}`);
        console.log(`${this.MODULE_ID} | Removed expired effect "${effect.name}" from ${actor.name}`);
      }
    } catch (error) {
      console.error(`${this.MODULE_ID} | Failed to remove expired effects from ${actor.name}:`, error);
    }
  }

  /**
   * Clean up hooks and resources
   */
  static cleanup() {
    if (this.combatHookId) {
      Hooks.off('updateCombat', this.combatHookId);
      this.combatHookId = null;
    }
    this.deletingTokens.clear();
  }
}

// Initialize the module
Hooks.once('ready', async function() {
  console.log('GURPS Instant Effects | Module loaded');
  
  // Initialize the effects manager and turn manager
  const effectsManager = new GURPSEffectsManager();
  GURPSTurnManager.initialize();
  
  // Store API in the module for external access
  const module = game.modules.get('gurps-instant-effects');
  if (module) {
    module.api = {
      effectsManager: effectsManager,
      turnManager: GURPSTurnManager,
      showQuickDialog: (tokens) => effectsManager.showQuickDialog(tokens),
      showManagerDialog: () => effectsManager.showManagerDialog(),
      removeAllEffects: (tokens) => effectsManager.removeAllModuleEffectsFromTokens(tokens)
    };
  }
  
  // Add macro bar button
  game.settings.register('gurps-instant-effects', 'showMacroButton', {
    name: game.i18n.localize('gurps-instant-effects.settings.showMacroButton.name'),
    hint: game.i18n.localize('gurps-instant-effects.settings.showMacroButton.hint'),
    scope: 'client',
    config: true,
    type: Boolean,
    default: true
  });
  
  // Add remove all effects macro button setting
  game.settings.register('gurps-instant-effects', 'showRemoveAllMacro', {
    name: game.i18n.localize('gurps-instant-effects.settings.showRemoveAllMacro.name'),
    hint: game.i18n.localize('gurps-instant-effects.settings.showRemoveAllMacro.hint'),
    scope: 'client',
    config: true,
    type: Boolean,
    default: true
  });
  
  // Create macro if setting is enabled
  if (game.settings.get('gurps-instant-effects', 'showMacroButton')) {
    await createInstantEffectsMacro();
  }
  
  // Create remove all effects macro if setting is enabled
  if (game.settings.get('gurps-instant-effects', 'showRemoveAllMacro')) {
    await createRemoveAllEffectsMacro();
  }
});

// Create the macro for quick access
async function createInstantEffectsMacro() {
  const macroName = 'GURPS Instant Effects';
  const existingMacro = game.macros.find(m => m.name === macroName);
  
  if (!existingMacro) {
    await Macro.create({
      name: macroName,
      type: 'script',
      img: 'icons/svg/magic.svg',
      command: `const module = game.modules.get('gurps-instant-effects');
if (module?.api?.showQuickDialog) {
  module.api.showQuickDialog();
} else {
  ui.notifications.error('GURPS Instant Effects module not loaded or API not available');
}`
    });
  }
}

// Create the macro for removing all effects
async function createRemoveAllEffectsMacro() {
  const macroName = 'GURPS Remover Todos os Efeitos';
  const existingMacro = game.macros.find(m => m.name === macroName);
  
  if (!existingMacro) {
    await Macro.create({
      name: macroName,
      type: 'script',
      img: 'icons/svg/cancel.svg',
      command: `const module = game.modules.get('gurps-instant-effects');
const tokens = canvas.tokens.controlled;

if (tokens.length === 0) {
  ui.notifications.warn('${game.i18n.localize('gurps-instant-effects.notifications.noTokensSelected')}');
  return;
}

if (module?.api?.removeAllEffects) {
  module.api.removeAllEffects(tokens);
} else {
  ui.notifications.error('GURPS Instant Effects module not loaded or API not available');
}`
    });
  }
}