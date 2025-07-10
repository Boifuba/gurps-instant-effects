/**
 * GURPS Counter Module for Foundry VTT
 * Automatically decreases numbered status effects on tokens each combat round
 * 
 * @author Module Author
 * @version 1.0.0
 * @license MIT
 */

/**
 * Main module class for GURPS Counter functionality
 * Encapsulates all module logic to avoid global namespace pollution
 */
class GURPSCounter {
  /**
   * Module identifier for logging and reference
   */
  static MODULE_ID = 'gurps-instant-effects';

  /**
   * Base path for GURPS system status effect icons
   */
  static BASE_ICON_PATH = 'systems/gurps/icons/statuses/number-';

  /**
   * Hook ID for combat update events
   */
  static combatHookId = null;

  /**
   * Hook ID for token deletion events
   */
  static tokenDeleteHookId = null;

  /**
   * Set to track tokens that are being deleted to avoid processing their effects
   */
  static deletingTokens = new Set();

  /**
   * Initialize the GURPS Counter module
   * Sets up combat hooks and prepares the counter system
   */
  static initialize() {
    console.log(`${this.MODULE_ID} | Initializing GURPS Counter module`);
    
    // Clean up any existing hooks to prevent duplicates
    this.cleanup();
    
    // Register the combat update hook
    this.combatHookId = Hooks.on('updateCombat', this.handleCombatUpdate.bind(this));
    
    // Register token deletion hook to clean up effects BEFORE deletion
    this.tokenDeleteHookId = Hooks.on('preDeleteToken', this.handleTokenPreDeletion.bind(this));
    
    console.log(`${this.MODULE_ID} | Combat counter system activated`);
  }

  /**
   * Handle token pre-deletion events
   * Cleans up numbered effects BEFORE the token is deleted to prevent reference errors
   * 
   * @param {TokenDocument} tokenDoc - The token document being deleted
   */
  static async handleTokenPreDeletion(tokenDoc) {
    if (!tokenDoc || !tokenDoc.id) {
      return;
    }

    console.log(`${this.MODULE_ID} | Token ${tokenDoc.id} is being deleted, cleaning up numbered effects`);
    
    // Mark token as being deleted
    this.deletingTokens.add(tokenDoc.id);
    
    // Get the actor associated with this token
    const actor = tokenDoc.actor;
    if (!actor) {
      console.log(`${this.MODULE_ID} | No actor found for token ${tokenDoc.id}`);
      return;
    }

    try {
      // Find and remove all numbered effects from this actor
      const numberedEffects = actor.effects.filter(effect =>
        effect && effect.statuses && [...(effect.statuses ?? [])].some(status => /^num\d+$/.test(status))
      );

      if (numberedEffects.length > 0) {
        console.log(`${this.MODULE_ID} | Removing ${numberedEffects.length} numbered effect(s) from ${actor.name} before token deletion`);
        
        // Delete all numbered effects in parallel for better performance
        const deletePromises = numberedEffects.map(effect => {
          return effect.delete().catch(error => {
            // Log but don't throw - we want to continue cleaning up other effects
            console.warn(`${this.MODULE_ID} | Failed to delete effect ${effect.id}:`, error);
          });
        });

        await Promise.allSettled(deletePromises);
        console.log(`${this.MODULE_ID} | Finished cleaning up numbered effects for token ${tokenDoc.id}`);
      }
    } catch (error) {
      console.error(`${this.MODULE_ID} | Error during token pre-deletion cleanup:`, error);
    }

    // Clean up the tracking after a delay to ensure all related operations are complete
    setTimeout(() => {
      this.deletingTokens.delete(tokenDoc.id);
    }, 5000);
  }

  /**
   * Handle combat update events
   * Decreases numbered status effects when combat round or turn changes
   * 
   * @param {Combat} combat - The combat document being updated
   * @param {Object} data - The update data containing changes
   */
  static async handleCombatUpdate(combat, data) {
    // Only process updates that involve round or turn changes
    if (!('round' in data || 'turn' in data)) {
      return;
    }

    console.log(`${this.MODULE_ID} | Processing combat update for round/turn change - Round: ${combat.round}, Turn: ${combat.turn}`);

    // Process all tokens in the scene that have numbered effects
    for (const token of canvas.tokens.placeables) {
      if (!token.actor) continue;
      
      // Check if token is being deleted
      if (this.deletingTokens.has(token.id)) {
        console.log(`${this.MODULE_ID} | Token ${token.id} is being deleted, skipping effect processing`);
        continue;
      }
      
      // Process numbered status effects on this token
      await this.processNumberedEffects(token.actor, token.id);
    }
  }

  /**
   * Process and decrement numbered status effects on an actor
   * 
   * @param {Actor} actor - The actor whose effects should be processed
   * @param {string} tokenId - The token ID for additional validation
   */
  static async processNumberedEffects(actor, tokenId) {
    // Additional safety check before processing effects
    if (!actor || !actor.effects) {
      console.warn(`${this.MODULE_ID} | Invalid actor or actor effects collection`);
      return;
    }

    // Check if token is being deleted
    if (this.deletingTokens.has(tokenId)) {
      console.log(`${this.MODULE_ID} | Token ${tokenId} is being deleted, aborting effect processing`);
      return;
    }

    // Find effects with numbered status IDs (format: num1, num2, etc.)
    const numberedEffects = actor.effects.filter(effect =>
      effect && effect.statuses && [...(effect.statuses ?? [])].some(status => /^num\d+$/.test(status))
    );

    if (numberedEffects.length === 0) {
      console.log(`${this.MODULE_ID} | No numbered effects found on ${actor.name}`);
      return;
    }

    console.log(`${this.MODULE_ID} | Processing ${numberedEffects.length} numbered effect(s) on ${actor.name}`);

    // Process each numbered effect with error handling
    for (const effect of numberedEffects) {
      try {
        // Double-check token deletion status before processing each effect
        if (this.deletingTokens.has(tokenId)) {
          console.log(`${this.MODULE_ID} | Token ${tokenId} deletion detected during processing, stopping`);
          break;
        }
        
        await this.decrementEffect(effect, actor, tokenId);
      } catch (error) {
        console.error(`${this.MODULE_ID} | Error processing effect ${effect.id} on ${actor.name}:`, error);
        // Continue processing other effects even if one fails
      }
    }
  }

  /**
   * Decrement a single numbered effect
   * 
   * @param {ActiveEffect} effect - The effect to decrement
   * @param {Actor} actor - The actor who owns the effect
   * @param {string} tokenId - The token ID for additional validation
   */
  static async decrementEffect(effect, actor, tokenId) {
    // Validate effect and actor before processing
    if (!effect || !actor) {
      console.warn(`${this.MODULE_ID} | Invalid effect or actor provided`);
      return;
    }

    // Check if token is being deleted
    if (this.deletingTokens.has(tokenId)) {
      console.log(`${this.MODULE_ID} | Token ${tokenId} is being deleted, skipping effect decrement`);
      return;
    }

    // Check if effect still exists
    if (!actor.effects.get(effect.id)) {
      console.warn(`${this.MODULE_ID} | Effect ${effect.id} no longer exists on ${actor.name}`);
      return;
    }

    // Extract the status ID (e.g., "num10")
    const statuses = [...(effect.statuses ?? [])];
    const statusId = statuses.find(status => /^num\d+$/.test(status));
    
    if (!statusId) {
      console.warn(`${this.MODULE_ID} | No valid numbered status found in effect ${effect.id}`);
      await this.safeDeleteEffect(effect, actor, tokenId);
      return;
    }

    const match = statusId.match(/num(\d+)/);
    if (!match) {
      console.warn(`${this.MODULE_ID} | Invalid numbered status format: ${statusId}`);
      await this.safeDeleteEffect(effect, actor, tokenId);
      return;
    }

    const currentNumber = parseInt(match[1], 10);
    const newNumber = currentNumber - 1;

    console.log(`${this.MODULE_ID} | Decrementing effect from ${currentNumber} to ${newNumber} on ${actor.name}`);

    // Always remove the current effect safely
    await this.safeDeleteEffect(effect, actor, tokenId);

    // Create new effect if the number is still positive and token isn't being deleted
    if (newNumber > 0 && !this.deletingTokens.has(tokenId)) {
      await this.createNumberedEffect(actor, newNumber, tokenId);
    } else {
      console.log(`${this.MODULE_ID} | Effect expired and removed from ${actor.name}`);
    }
  }

  /**
   * Safely delete an effect with error handling
   * 
   * @param {ActiveEffect} effect - The effect to delete
   * @param {Actor} actor - The actor who owns the effect
   * @param {string} tokenId - The token ID for additional validation
   */
  static async safeDeleteEffect(effect, actor, tokenId) {
    try {
      // Check if token is being deleted before attempting deletion
      if (this.deletingTokens.has(tokenId)) {
        console.log(`${this.MODULE_ID} | Token ${tokenId} is being deleted, skipping effect deletion to avoid errors`);
        return;
      }

      // Double-check that the effect still exists before deletion
      if (actor.effects.get(effect.id)) {
        // Use a try-catch specifically for the delete operation
        try {
          await effect.delete();
          console.log(`${this.MODULE_ID} | Successfully deleted effect ${effect.id} from ${actor.name}`);
        } catch (deleteError) {
          // If deletion fails due to missing references, log but don't throw
          if (deleteError.message.includes('does not exist in the EmbeddedCollection')) {
            console.log(`${this.MODULE_ID} | Effect ${effect.id} was already cleaned up by system`);
          } else {
            throw deleteError;
          }
        }
      } else {
        console.log(`${this.MODULE_ID} | Effect ${effect.id} was already deleted from ${actor.name}`);
      }
    } catch (error) {
      console.error(`${this.MODULE_ID} | Failed to delete effect ${effect.id} from ${actor.name}:`, error);
      // Don't re-throw the error to prevent cascade failures
    }
  }

  /**
   * Create a new numbered status effect
   * 
   * @param {Actor} actor - The actor to apply the effect to
   * @param {number} number - The number for the status effect
   * @param {string} tokenId - The token ID for additional validation
   */
  static async createNumberedEffect(actor, number, tokenId) {
    // Validate actor before creating effect
    if (!actor || !game.actors.get(actor.id)) {
      console.warn(`${this.MODULE_ID} | Cannot create effect on invalid or deleted actor`);
      return;
    }

    // Check if token is being deleted
    if (this.deletingTokens.has(tokenId)) {
      console.log(`${this.MODULE_ID} | Token ${tokenId} is being deleted, skipping effect creation`);
      return;
    }

    const statusId = `num${number}`;
    const iconPath = `${this.BASE_ICON_PATH}${number}.webp`;

    try {
      await ActiveEffect.create({
        icon: iconPath,
        label: `Counter (${number})`,
        name: `Counter (${number})`,
        statuses: [statusId]
      }, { parent: actor });

      console.log(`${this.MODULE_ID} | Created new numbered effect (${number}) on ${actor.name}`);
    } catch (error) {
      console.error(`${this.MODULE_ID} | Failed to create numbered effect on ${actor.name}:`, error);
    }
  }

  /**
   * Clean up module hooks and resources
   * Called during initialization to prevent duplicate hooks
   */
  static cleanup() {
    if (this.combatHookId) {
      Hooks.off('updateCombat', this.combatHookId);
      this.combatHookId = null;
      console.log(`${this.MODULE_ID} | Cleaned up existing combat hooks`);
    }

    if (this.tokenDeleteHookId) {
      Hooks.off('preDeleteToken', this.tokenDeleteHookId);
      this.tokenDeleteHookId = null;
      console.log(`${this.MODULE_ID} | Cleaned up existing token deletion hooks`);
    }

    // Clear the deletion tracking set
    this.deletingTokens.clear();
  }

  /**
   * Module ready handler
   * Called when Foundry VTT is fully loaded and ready
   */
  static onReady() {
    console.log(`${this.MODULE_ID} | Module ready and active`);
    
    // Verify GURPS system compatibility
    if (game.system.id !== 'gurps') {
      console.warn(`${this.MODULE_ID} | This module is designed for the GURPS system. Current system: ${game.system.id}`);
    }
  }
}

// Register module hooks
Hooks.once('init', () => {
  console.log('GURPS Counter | Setting up module initialization');
  GURPSCounter.initialize();
});

Hooks.once('ready', () => {
  GURPSCounter.onReady();
});

// Store reference in game modules for potential external access
Hooks.once('ready', () => {
  if (game.modules.get(GURPSCounter.MODULE_ID)) {
    game.modules.get(GURPSCounter.MODULE_ID).api = GURPSCounter;
  }
});