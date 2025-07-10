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
      <div class="image-item" data-path="${img.path}" style="display: inline-block; margin: 5px; cursor: pointer; border: 2px solid transparent;">
        <img src="${img.path}" style="width: 64px; height: 64px; object-fit: cover;">
        <div style="font-size: 10px; text-align: center; width: 64px; overflow: hidden;">${img.name}</div>
      </div>
    `).join('');
    
    const content = `
      <div class="image-browser">
        <div class="browser-header" style="margin-bottom: 10px;">
          <label for="folder-path">Folder Path:</label>
          <input type="text" id="folder-path" value="${this.currentPath}" style="width: 70%;">
          <button id="browse-folder" style="width: 25%;">Browse</button>
        </div>
        <div class="image-grid" style="max-height: 400px; overflow-y: auto; border: 1px solid #ccc; padding: 10px;">
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
          html.find('.image-item').removeClass('selected').css('border', '2px solid transparent');
          $(this).addClass('selected').css('border', '2px solid #007bff');
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