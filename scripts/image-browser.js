/**
 * GURPS Image Browser
 * Browse and select images from Foundry's file system
 */

export class GURPSImageBrowser {
  constructor() {
    this.currentPath = 'systems/gurps/icons/';
    this.images = [];
  }
  
  async show(callback) {
    await this.loadImages();
    
    const imageGrid = this.images.map(img => `
      <div class="image-item" data-path="${img.path}">
        <img src="${img.path}" class="image-thumbnail">
        <div class="image-name">${img.name}</div>
      </div>
    `).join('');
    
    const content = `
      <div class="image-browser">
        <div class="browser-header">
          <label for="folder-path">Folder Path:</label>
          <input type="text" id="folder-path" value="${this.currentPath}">
          <button id="browse-folder">Browse</button>
        </div>
        <div class="image-grid">
          ${imageGrid}
        </div>
      </div>
    `;
    
    new Dialog({
      title: 'Select Image',
      content: content,
      buttons: {
        select: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Select',
          callback: (html) => {
            const selected = html.find('.image-item.selected');
            if (selected.length > 0) {
              callback(selected.data('path'));
            }
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Cancel'
        }
      },
      render: (html) => {
        // Handle image selection
        html.find('.image-item').click(function() {
          html.find('.image-item').removeClass('selected');
          $(this).addClass('selected');
        });
        
        // Handle folder browsing
        html.find('#browse-folder').click(async () => {
          const path = html.find('#folder-path').val();
          this.currentPath = path;
          await this.loadImages();
          // Refresh the dialog
          this.show(callback);
        });
      }
    }).render(true);
  }
  
  async loadImages() {
    try {
      const browse = await FilePicker.browse("data", this.currentPath);
      this.images = browse.files
        .filter(file => this.isImageFile(file))
        .map(file => ({
          path: file,
          name: file.split('/').pop().split('.')[0]
        }));
    } catch (error) {
      console.warn(`Could not browse folder: ${this.currentPath}`, error);
      this.images = [];
    }
  }
  
  isImageFile(filename) {
    const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
    return extensions.some(ext => filename.toLowerCase().endsWith(ext));
  }
}