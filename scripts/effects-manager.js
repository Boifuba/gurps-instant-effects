/**
 * GURPS Effects Manager Class
 * Manages preconfigured effects for GURPS system
 */

export class GURPSEffectsManager {
  constructor() {
    this.effects = [];
    this.defaultEffects = [
      {
        id: 'distraction',
        name: 'Distraction',
        label: 'Distraction',
        icon: 'systems/gurps/icons/statuses/number-3.webp',
        effectType: 'target',
        effectValue: '-3 for Distraction',
        description: 'Target has -3 to all rolls due to distraction',
        category: 'mental'
      },
      {
        id: 'aim',
        name: 'Aim',
        label: 'Aim',
        icon: 'icons/svg/combat.svg',
        effectType: 'self',
        effectValue: '+1 to +3 for Aim',
        description: 'Aiming bonus for ranged attacks',
        category: 'combat'
      },
      {
        id: 'shock',
        name: 'Shock',
        label: 'Shock',
        icon: 'icons/svg/debuff.svg',
        effectType: 'target',
        effectValue: '-4 for Shock',
        description: 'Shock penalty from major wound',
        category: 'injury'
      },
      {
        id: 'defense-bonus',
        name: 'Defense Bonus',
        label: 'Defense Bonus',
        icon: 'icons/svg/shield.svg',
        effectType: 'self',
        effectValue: '+2 to Defense',
        description: 'Temporary defense bonus',
        category: 'combat'
      }
    ];
    
    this.loadEffects();
  }
  
  // Load saved effects
  async loadEffects() {
    const savedEffects = await game.user.getFlag('gurps-instant-effects', 'effects');
    if (savedEffects && savedEffects.length > 0) {
      this.effects = savedEffects;
    } else {
      this.effects = [...this.defaultEffects];
      await this.saveEffects();
    }
  }
  
  // Save effects
  async saveEffects() {
    await game.user.setFlag('gurps-instant-effects', 'effects', this.effects);
  }
  
  // Quick dialog for applying effects
  showQuickDialog(selectedTokens = null) {
    const tokens = selectedTokens || canvas.tokens.controlled;
    
    if (tokens.length === 0) {
      ui.notifications.warn(game.i18n.localize('gurps-instant-effects.notifications.noTokens'));
      return;
    }
    
    // Group effects by category
    const effectsByCategory = this.effects.reduce((acc, effect) => {
      if (!acc[effect.category]) {
        acc[effect.category] = [];
      }
      acc[effect.category].push(effect);
      return acc;
    }, {});
    
    // Create visual effect grid organized by category
    const effectItems = Object.entries(effectsByCategory).map(([category, effects]) => {
      const categoryEffects = effects.map(effect => `
        <div class="effect-item-quick-dialog" data-id="${effect.id}" title="${effect.description || effect.name}">
          <img src="${effect.icon}" alt="${effect.name}" class="effect-icon">
          <div class="effect-info">
            <div class="effect-name">${effect.name}</div>
            <div class="effect-type">${effect.effectType}</div>
          </div>
        </div>
      `).join('');
      
      return `
        <div class="effect-category-section">
          <h4 class="category-header">${category.charAt(0).toUpperCase() + category.slice(1)}</h4>
          <div class="category-effects">
            ${categoryEffects}
          </div>
        </div>
      `;
    }).join('');
    
    const content = `
      <form>
        <input type="hidden" id="selected-effect" name="effectId" value="">
        <input type="hidden" id="selected-effect-type" name="effectType" value="">
        <div class="effect-selection-grid">
          ${effectItems}
        </div>
        <div class="form-group target-selection">
          <label>${game.i18n.localize('gurps-instant-effects.dialog.applyTo')}:</label>
          <select id="effect-apply-to" name="applyTo">
            <option value="target">${game.i18n.localize('gurps-instant-effects.dialog.target')}</option>
            <option value="self">${game.i18n.localize('gurps-instant-effects.dialog.self')}</option>
          </select>
        </div>
        <div class="form-group duration-controls">
          <div class="duration-input-group">
            <label for="quick-duration">${game.i18n.localize('gurps-instant-effects.dialog.duration')}:</label>
            <input type="number" id="quick-duration" name="duration" value="1" min="1" placeholder="${game.i18n.localize('gurps-instant-effects.dialog.permanentPlaceholder')}">
          </div>
          <div class="permanent-checkbox">
            <label>
              <input type="checkbox" id="effect-permanent-quick" name="isPermanent">
              ${game.i18n.localize('gurps-instant-effects.dialog.permanent')}
            </label>
          </div>
        </div>
        <div class="dialog-buttons">
          <button type="button" class="apply-button">
            <i class="fas fa-play"></i> ${game.i18n.localize('gurps-instant-effects.dialog.apply')}
          </button>
          <button type="button" class="apply-counter-button">
            <i class="fas fa-sort-numeric-up"></i> ${game.i18n.localize('gurps-instant-effects.dialog.applyCounter')}
          </button>
          <button type="button" class="cancel-button">
            <i class="fas fa-times"></i> ${game.i18n.localize('gurps-instant-effects.dialog.cancel')}
          </button>
        </div>
        <div class="form-group">
          <button type="button" id="manage-effects" class="manage-effects-button">
            <i class="fas fa-cog"></i> ${game.i18n.localize('gurps-instant-effects.dialog.manage')}
          </button>
        </div>
      </form>
    `;
    
    new Dialog({
      title: game.i18n.localize('gurps-instant-effects.dialog.title'),
      content: content,
      buttons: {},
      render: (html) => {
        // Adicionar classe CSS ao dialog
        html.closest('.dialog').addClass('gurps-instant-effects-dialog');
        
        // Handle effect selection
        html.find('.effect-item-quick-dialog').click(function() {
          const $this = $(this);
          const effectId = $this.data('id');
          
          // Remove selection from other items
          html.find('.effect-item-quick-dialog').removeClass('selected');
          
          // Select this item
          $this.addClass('selected');
          html.find('#selected-effect').val(effectId);
          
          // Reset duration to 1 when selecting an effect
          const durationInput = html.find('#quick-duration');
          const permanentCheckbox = html.find('#effect-permanent-quick');
          
          permanentCheckbox.prop('checked', false);
          durationInput.prop('disabled', false).attr('placeholder', '').val(1);
        });
        
        // Handle permanent checkbox
        html.find('#effect-permanent-quick').change(function() {
          const durationInput = html.find('#quick-duration');
          if (this.checked) {
            durationInput.prop('disabled', true).val('').attr('placeholder', game.i18n.localize('gurps-instant-effects.dialog.permanentPlaceholder'));
          } else {
            durationInput.prop('disabled', false).attr('placeholder', '').val(1);
          }
        });
        
        html.find('#manage-effects').click(() => {
          this.showManagerDialog();
        });
        
        // Handle button clicks
        html.find('.apply-button').click(async () => {
          await this.handleApplyEffect(html, tokens, false);
        });
        
        html.find('.apply-counter-button').click(async () => {
          await this.handleApplyEffect(html, tokens, true);
        });
        
        html.find('.cancel-button').click(() => {
          html.closest('.dialog').find('.close').click();
        });
      }
    }).render(true);
  }
  
  // Handle apply effect (regular or counter)
  async handleApplyEffect(html, tokens, useCounter = false) {
    const effectId = html.find('#selected-effect').val();
    const applyTo = html.find('#effect-apply-to').val();
    
    if (!effectId && !useCounter) {
      ui.notifications.warn(game.i18n.localize('gurps-instant-effects.notifications.noEffectSelected'));
      return;
    }
    
    const duration = parseInt(html.find('#quick-duration').val());
    const isPermanent = html.find('#effect-permanent-quick').is(':checked');
    
    if (useCounter) {
      await this.applyCounterToTokens(duration || 1, tokens);
    } else {
      await this.applyEffectToTokens(effectId, tokens, isPermanent ? null : duration, false, applyTo);
    }
  }
  
  // Apply GURPS Counter to tokens
  async applyCounterToTokens(number, tokens) {
    if (!number || number < 1) {
      ui.notifications.warn(game.i18n.localize('gurps-instant-effects.notifications.invalidCounterNumber'));
      return;
    }
    
    if (number > 10) {
      ui.notifications.warn(game.i18n.localize('gurps-instant-effects.notifications.counterTooHigh'));
      return;
    }
    
    const statusId = `num${number}`;
    const iconPath = `systems/gurps/icons/statuses/number-${number}.webp`;
    
    // Create duration object for counter
    const durationData = {
      rounds: number,
      startRound: game.combat?.round || 0,
      startTurn: game.combat?.turn || 0
    };
    
    const effectData = {
      name: `Counter (${number})`,
      label: `Counter (${number})`,
      icon: iconPath,
      statuses: [statusId],
      duration: durationData,
      flags: {
        'gurps-instant-effects': {
          category: 'counter',
          effectType: 'counter',
          isCounter: true,
          isPermanent: false
        }
      }
    };
    
    for (let token of tokens) {
      // Remove existing counter effects
      const existingCounters = token.actor.effects.contents.filter(e => 
        e.statuses && [...(e.statuses ?? [])].some(status => /^num\d+$/.test(status))
      );
      
      if (existingCounters.length > 0) {
        await token.actor.deleteEmbeddedDocuments('ActiveEffect', existingCounters.map(e => e.id));
      }
      
      // Apply new counter effect
      await token.actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
      ui.notifications.info(game.i18n.format('gurps-instant-effects.notifications.counterApplied', {
        number: number,
        token: token.name
      }));
    }
  }
  
  // Apply effect to tokens
  async applyEffectToTokens(effectId, tokens, duration = null, forcePermanent = false, overrideEffectType = null) {
    const effect = this.effects.find(e => e.id === effectId);
    if (!effect) return;
    
    // Use override effect type if provided, otherwise use the effect's default
    const effectType = overrideEffectType || effect.effectType;
    
    // Determine effect key based on type
    let effectKey;
    if (effectType === 'target') {
      effectKey = 'system.conditions.target.modifiers';
    } else {
      effectKey = 'system.conditions.self.modifiers';
    }
    
    // Determine duration based on effect type and user input
    let effectDuration;
    if (forcePermanent || duration === null) {
      effectDuration = null;
    } else {
      effectDuration = duration || 1;
    }
    
    // Create duration object - empty object for permanent effects, proper object for timed effects
    let durationData = {};
    if (effectDuration !== null && effectDuration > 0) {
      durationData = {
        rounds: effectDuration,
        startRound: game.combat?.round || 0,
        startTurn: game.combat?.turn || 0
      };
    }
    
    const effectData = {
      name: effect.name,
      label: effect.label,
      icon: effect.icon,
      changes: [
        {
          key: effectKey,
          value: effect.effectValue,
          mode: CONST.ACTIVE_EFFECT_MODES.ADD
        }
      ],
      duration: durationData,
      flags: {
        'gurps-instant-effects': {
          category: effect.category,
          effectType: effectType,
          isPermanent: forcePermanent || duration === null
        }
      }
    };
    
    for (let token of tokens) {
      const existing = token.actor.effects.contents.filter(e => e.name === effect.name);
      
      if (existing.length > 0) {
        // Remove existing effect
        await token.actor.deleteEmbeddedDocuments('ActiveEffect', existing.map(e => e.id));
        ui.notifications.info(game.i18n.format('gurps-instant-effects.notifications.removed', {
          effect: effect.name,
          token: token.name
        }));
      } else {
        // Apply new effect
        await token.actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
        ui.notifications.info(game.i18n.format('gurps-instant-effects.notifications.applied', {
          effect: effect.name,
          token: token.name
        }));
      }
    }
  }
  
  // Show effects manager dialog
  showManagerDialog() {
    const categories = [...new Set(this.effects.map(e => e.category))];
    const categoryOptions = categories.map(cat => 
      `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`
    ).join('');
    
    const effectsList = this.effects.map(effect => `
      <div class="effect-item" data-id="${effect.id}" style="display: flex; align-items: center; padding: 5px; border: 1px solid #ccc; margin: 2px;">
        <img src="${effect.icon}" style="width: 32px; height: 32px; margin-right: 10px;">
        <div style="flex: 1;">
          <strong>${effect.name}</strong>
          <br>
          <small>${effect.effectType} | ${effect.effectValue} | ${effect.category}</small>
        </div>
        <div>
          <button class="edit-effect" data-id="${effect.id}" title="${game.i18n.localize('gurps-instant-effects.dialog.edit')}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-effect" data-id="${effect.id}" title="${game.i18n.localize('gurps-instant-effects.dialog.delete')}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
    
    const content = `
      <div class="effects-manager">
        <div class="manager-header" style="margin-bottom: 10px;">
          <button id="add-effect" style="width: 100%;">
            <i class="fas fa-plus"></i> ${game.i18n.localize('gurps-instant-effects.dialog.addNew')}
          </button>
        </div>
        <div class="effects-filter" style="margin-bottom: 10px;">
          <label for="category-filter">Filter by Category:</label>
          <select id="category-filter" style="width: 100%;">
            <option value="">All Categories</option>
            ${categoryOptions}
          </select>
        </div>
        <div class="effects-list" style="max-height: 400px; overflow-y: auto;">
          ${effectsList}
        </div>
      </div>
    `;
    
    new Dialog({
      title: game.i18n.localize('gurps-instant-effects.dialog.manager'),
      content: content,
      buttons: {
        close: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('gurps-instant-effects.dialog.cancel')
        }
      },
      render: (html) => {
        // Add new effect
        html.find('#add-effect').click(() => {
          this.showEffectDialog();
        });
        
        // Edit effect
        html.find('.edit-effect').click((e) => {
          const effectId = e.currentTarget.dataset.id;
          const effect = this.effects.find(eff => eff.id === effectId);
          this.showEffectDialog(effect);
        });
        
        // Delete effect
        html.find('.delete-effect').click(async (e) => {
          const effectId = e.currentTarget.dataset.id;
          const confirmed = await Dialog.confirm({
            title: game.i18n.localize('gurps-instant-effects.dialog.delete'),
            content: 'Are you sure you want to delete this effect?'
          });
          if (confirmed) {
            await this.deleteEffect(effectId);
            this.showManagerDialog();
          }
        });
        
        // Category filter
        html.find('#category-filter').change((e) => {
          const category = e.target.value;
          html.find('.effect-item').each((i, item) => {
            const effectId = item.dataset.id;
            const effect = this.effects.find(eff => eff.id === effectId);
            if (!category || effect.category === category) {
              item.style.display = 'flex';
            } else {
              item.style.display = 'none';
            }
          });
        });
      }
    }).render(true);
  }
  
  // Show effect creation/edit dialog
  showEffectDialog(existingEffect = null) {
    const isEdit = !!existingEffect;
    
    const content = `
      <form>
        <div class="form-group">
          <label for="effect-name">Effect Name:</label>
          <input type="text" id="effect-name" name="name" value="${existingEffect?.name || ''}" required>
        </div>
        <div class="form-group">
          <label for="effect-label">Display Label:</label>
          <input type="text" id="effect-label" name="label" value="${existingEffect?.label || ''}" required>
        </div>
        <div class="form-group">
          <label for="effect-value">Effect Value:</label>
          <input type="text" id="effect-value" name="effectValue" value="${existingEffect?.effectValue || ''}" required>
        </div>
        <div class="form-group">
          <label for="effect-icon">Icon:</label>
          <div class="icon-input-group">
            <input type="text" id="effect-icon" name="icon" value="${existingEffect?.icon || ''}" required readonly>
            <button type="button" id="browse-icon" class="icon-browse-button" title="${game.i18n.localize('gurps-instant-effects.dialog.browse')}">
              <i class="fas fa-folder"></i>
            </button>
          </div>
        </div>
        <div class="form-group">
          <label for="effect-category">Category:</label>
          <input type="text" id="effect-category" name="category" value="${existingEffect?.category || 'general'}">
        </div>
      </form>
    `;
    
    new Dialog({
      title: isEdit ? game.i18n.localize('gurps-instant-effects.dialog.edit') : game.i18n.localize('gurps-instant-effects.dialog.create'),
      content: content,
      buttons: {
        save: {
          icon: '<i class="fas fa-save"></i>',
          label: isEdit ? game.i18n.localize('gurps-instant-effects.dialog.update') : game.i18n.localize('gurps-instant-effects.dialog.create'),
          callback: async (html) => {
            const formData = new FormData(html.find('form')[0]);
            const effectData = Object.fromEntries(formData.entries());
            
            if (isEdit) {
              await this.updateEffect(existingEffect.id, effectData);
            } else {
              // Set default effectType for new effects
              effectData.effectType = 'target';
              await this.addEffect(effectData);
            }
            
            this.showManagerDialog();
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('gurps-instant-effects.dialog.cancel')
        }
      },
      render: (html) => {
        // Adicionar classe CSS ao dialog
        html.closest('.dialog').addClass('effect-create-dialog');
        
        html.find('#browse-icon').click(() => {
          new FilePicker({
            type: "image",
            current: html.find('#effect-icon').val() || "systems/gurps/icons/",
            callback: (imagePath) => {
              html.find('#effect-icon').val(imagePath);
            },
            top: this.position?.top || 100,
            left: this.position?.left || 100
          }).browse();
        });
      }
    }).render(true);
  }
  
  // Add new effect
  async addEffect(effectData) {
    const newEffect = {
      id: foundry.utils.randomID(),
      createdAt: new Date(),
      ...effectData
    };
    
    this.effects.push(newEffect);
    await this.saveEffects();
    ui.notifications.info(game.i18n.localize('gurps-instant-effects.notifications.effectAdded'));
  }
  
  // Update existing effect
  async updateEffect(effectId, effectData) {
    const index = this.effects.findIndex(e => e.id === effectId);
    if (index >= 0) {
      const updatedEffect = { 
        ...this.effects[index], 
        ...effectData
      };
      
      this.effects[index] = updatedEffect;
      await this.saveEffects();
      ui.notifications.info(game.i18n.localize('gurps-instant-effects.notifications.effectUpdated'));
    }
  }
  
  // Delete effect
  async deleteEffect(effectId) {
    this.effects = this.effects.filter(e => e.id !== effectId);
    await this.saveEffects();
    ui.notifications.info(game.i18n.localize('gurps-instant-effects.notifications.effectDeleted'));
  }
  
  // Remove all module effects from tokens
  async removeAllModuleEffectsFromTokens(tokens) {
    if (!tokens || tokens.length === 0) {
      ui.notifications.warn(game.i18n.localize('gurps-instant-effects.notifications.noTokens'));
      return;
    }
    
    let totalRemoved = 0;
    
    for (let token of tokens) {
      // Find all effects created by this module
      const moduleEffects = token.actor.effects.contents.filter(effect => {
        return effect.flags && effect.flags['gurps-instant-effects'];
      });
      
      if (moduleEffects.length > 0) {
        await token.actor.deleteEmbeddedDocuments('ActiveEffect', moduleEffects.map(e => e.id));
        totalRemoved += moduleEffects.length;
        
        ui.notifications.info(game.i18n.format('gurps-instant-effects.notifications.allEffectsRemoved', {
          count: moduleEffects.length,
          token: token.name
        }));
      }
    }
    
    if (totalRemoved === 0) {
      ui.notifications.info(game.i18n.localize('gurps-instant-effects.notifications.noEffectsToRemove'));
    }
  }
  
  // Manual effect removal method
  async removeEffectFromTokens(effectName, tokens) {
    for (let token of tokens) {
      const existing = token.actor.effects.contents.filter(e => e.name === effectName);
      
      if (existing.length > 0) {
        await token.actor.deleteEmbeddedDocuments('ActiveEffect', existing.map(e => e.id));
        ui.notifications.info(`Removed ${effectName} from ${token.name}`);
      }
    }
  }
}