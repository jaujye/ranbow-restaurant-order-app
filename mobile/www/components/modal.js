// Modal component system

class ModalManager {
    constructor() {
        this.activeModal = null;
        this.overlay = null;
        this.init();
    }

    init() {
        // Create overlay if it doesn't exist
        this.overlay = document.getElementById('overlay');
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.id = 'overlay';
            this.overlay.className = 'overlay hidden';
            document.body.appendChild(this.overlay);
        }

        // Add click handler to close modal when clicking overlay
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.close();
            }
        });
    }

    show(content, options = {}) {
        const {
            title = '',
            className = '',
            closable = true,
            size = 'medium',
            onClose = null
        } = options;

        // Close existing modal
        if (this.activeModal) {
            this.close();
        }

        // Create modal
        const modal = this.createModal(content, {
            title,
            className,
            closable,
            size,
            onClose
        });

        // Add to DOM
        document.body.appendChild(modal);
        this.activeModal = modal;

        // Show overlay and modal
        this.overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Trigger animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        return modal;
    }

    createModal(content, options) {
        const modal = document.createElement('div');
        modal.className = `modal modal-${options.size} ${options.className}`;

        let html = `
            <div class="modal-dialog">
                <div class="modal-content">
        `;

        // Add header if title provided
        if (options.title) {
            html += `
                <div class="modal-header">
                    <h3 class="modal-title">${options.title}</h3>
                    ${options.closable ? '<button class="modal-close" type="button">×</button>' : ''}
                </div>
            `;
        } else if (options.closable) {
            html += `
                <button class="modal-close modal-close-only" type="button">×</button>
            `;
        }

        // Add content
        html += `
                <div class="modal-body">
                    ${typeof content === 'string' ? content : ''}
                </div>
            </div>
        </div>
        `;

        modal.innerHTML = html;

        // If content is a DOM element, append it
        if (typeof content !== 'string') {
            const body = modal.querySelector('.modal-body');
            body.innerHTML = '';
            body.appendChild(content);
        }

        // Add close handlers
        if (options.closable) {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.close();
                });
            }
        }

        // Store close callback
        if (options.onClose) {
            modal._onClose = options.onClose;
        }

        return modal;
    }

    close() {
        if (!this.activeModal) return;

        const modal = this.activeModal;
        
        // Call close callback if exists
        if (modal._onClose) {
            modal._onClose();
        }

        // Hide modal with animation
        modal.classList.remove('show');
        this.overlay.classList.add('hidden');
        document.body.style.overflow = '';

        // Remove from DOM after animation
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);

        this.activeModal = null;
    }

    // Convenience methods
    alert(message, title = '提示') {
        const content = `
            <div class="alert-content">
                <p>${message}</p>
                <div class="alert-actions">
                    <button class="btn btn-primary" onclick="modal.close()">確定</button>
                </div>
            </div>
        `;

        return this.show(content, { 
            title, 
            size: 'small',
            className: 'modal-alert' 
        });
    }

    confirm(message, title = '確認') {
        return new Promise((resolve) => {
            const content = `
                <div class="confirm-content">
                    <p>${message}</p>
                    <div class="confirm-actions">
                        <button class="btn btn-secondary" id="confirm-cancel">取消</button>
                        <button class="btn btn-primary" id="confirm-ok">確定</button>
                    </div>
                </div>
            `;

            const modalElement = this.show(content, { 
                title, 
                size: 'small',
                className: 'modal-confirm',
                closable: false
            });

            // Add button handlers
            const cancelBtn = modalElement.querySelector('#confirm-cancel');
            const okBtn = modalElement.querySelector('#confirm-ok');

            cancelBtn.addEventListener('click', () => {
                this.close();
                resolve(false);
            });

            okBtn.addEventListener('click', () => {
                this.close();
                resolve(true);
            });
        });
    }

    prompt(message, defaultValue = '', title = '輸入') {
        return new Promise((resolve) => {
            const content = `
                <div class="prompt-content">
                    <p>${message}</p>
                    <input type="text" class="form-input" id="prompt-input" value="${defaultValue}" placeholder="請輸入...">
                    <div class="prompt-actions">
                        <button class="btn btn-secondary" id="prompt-cancel">取消</button>
                        <button class="btn btn-primary" id="prompt-ok">確定</button>
                    </div>
                </div>
            `;

            const modalElement = this.show(content, { 
                title, 
                size: 'small',
                className: 'modal-prompt',
                closable: false
            });

            const input = modalElement.querySelector('#prompt-input');
            const cancelBtn = modalElement.querySelector('#prompt-cancel');
            const okBtn = modalElement.querySelector('#prompt-ok');

            // Focus input
            setTimeout(() => input.focus(), 100);

            // Handle enter key
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    okBtn.click();
                }
            });

            cancelBtn.addEventListener('click', () => {
                this.close();
                resolve(null);
            });

            okBtn.addEventListener('click', () => {
                const value = input.value.trim();
                this.close();
                resolve(value);
            });
        });
    }

    loading(message = '載入中...') {
        const content = `
            <div class="loading-content">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <p>${message}</p>
            </div>
        `;

        return this.show(content, { 
            size: 'small',
            className: 'modal-loading',
            closable: false
        });
    }
}

// Create global modal manager
window.modal = new ModalManager();

// CSS for modal component (inject if not already present)
if (!document.querySelector('#modal-styles')) {
    const styles = document.createElement('style');
    styles.id = 'modal-styles';
    styles.textContent = `
        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9000;
            opacity: 1;
            transition: opacity 0.3s ease;
        }

        .overlay.hidden {
            opacity: 0;
            pointer-events: none;
        }

        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9001;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            opacity: 0;
            transform: scale(0.8);
            transition: all 0.3s ease;
            pointer-events: none;
        }

        .modal.show {
            opacity: 1;
            transform: scale(1);
            pointer-events: auto;
        }

        .modal-dialog {
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
        }

        .modal-small .modal-dialog {
            max-width: 400px;
        }

        .modal-medium .modal-dialog {
            max-width: 600px;
        }

        .modal-large .modal-dialog {
            max-width: 800px;
        }

        .modal-content {
            background: white;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            position: relative;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #eee;
        }

        .modal-title {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #333;
        }

        .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            color: #999;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
        }

        .modal-close:hover {
            background: #f5f5f5;
            color: #333;
        }

        .modal-close-only {
            position: absolute;
            top: 15px;
            right: 15px;
            z-index: 10;
        }

        .modal-body {
            padding: 20px;
        }

        .alert-content,
        .confirm-content,
        .prompt-content {
            text-align: center;
        }

        .alert-content p,
        .confirm-content p,
        .prompt-content p {
            margin-bottom: 20px;
            color: #333;
            line-height: 1.5;
        }

        .alert-actions,
        .confirm-actions,
        .prompt-actions {
            display: flex;
            gap: 10px;
            justify-content: center;
        }

        .confirm-actions {
            justify-content: space-between;
        }

        .prompt-content .form-input {
            width: 100%;
            margin-bottom: 20px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }

        .loading-content {
            text-align: center;
            padding: 20px;
        }

        .loading-spinner {
            font-size: 24px;
            color: #FF6B35;
            margin-bottom: 15px;
        }

        .loading-content p {
            margin: 0;
            color: #666;
        }

        @media (max-width: 480px) {
            .modal {
                padding: 10px;
            }

            .modal-small .modal-dialog,
            .modal-medium .modal-dialog,
            .modal-large .modal-dialog {
                max-width: none;
            }

            .modal-header,
            .modal-body {
                padding: 15px;
            }

            .confirm-actions {
                flex-direction: column-reverse;
            }

            .confirm-actions .btn {
                width: 100%;
            }
        }
    `;
    document.head.appendChild(styles);
}