// Toast notification component

class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.maxToasts = 5;
        this.init();
    }

    init() {
        // Create toast container if it doesn't exist
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    show(message, type = 'info', duration = 3000) {
        const toast = this.createToast(message, type);
        
        // Add to container
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Remove old toasts if too many
        if (this.toasts.length > this.maxToasts) {
            const oldToast = this.toasts.shift();
            this.remove(oldToast);
        }

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toast);
            }, duration);
        }

        // Trigger show animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        return toast;
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = this.getIcon(type);
        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => this.remove(toast);

        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        toast.appendChild(closeBtn);
        
        return toast;
    }

    getIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    remove(toast) {
        if (!toast || !toast.parentNode) return;

        toast.classList.add('removing');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 300);
    }

    clear() {
        this.toasts.forEach(toast => this.remove(toast));
        this.toasts = [];
    }

    // Convenience methods
    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Create global toast manager
window.toast = new ToastManager();

// CSS for toast notifications (inject if not already present)
if (!document.querySelector('#toast-styles')) {
    const styles = document.createElement('style');
    styles.id = 'toast-styles';
    styles.textContent = `
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        }

        .toast {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            margin-bottom: 10px;
            min-width: 300px;
            max-width: 400px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            pointer-events: auto;
            position: relative;
            overflow: hidden;
        }

        .toast.show {
            opacity: 1;
            transform: translateX(0);
        }

        .toast.removing {
            opacity: 0;
            transform: translateX(100%);
        }

        .toast::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
        }

        .toast-success::before {
            background: #4CAF50;
        }

        .toast-error::before {
            background: #F44336;
        }

        .toast-warning::before {
            background: #FF9800;
        }

        .toast-info::before {
            background: #2196F3;
        }

        .toast-content {
            display: flex;
            align-items: center;
            padding: 16px 40px 16px 20px;
        }

        .toast-icon {
            margin-right: 12px;
            font-size: 20px;
        }

        .toast-success .toast-icon {
            color: #4CAF50;
        }

        .toast-error .toast-icon {
            color: #F44336;
        }

        .toast-warning .toast-icon {
            color: #FF9800;
        }

        .toast-info .toast-icon {
            color: #2196F3;
        }

        .toast-message {
            flex: 1;
            font-size: 14px;
            line-height: 1.4;
            color: #333;
        }

        .toast-close {
            position: absolute;
            top: 8px;
            right: 8px;
            background: none;
            border: none;
            font-size: 18px;
            color: #999;
            cursor: pointer;
            padding: 4px;
            line-height: 1;
        }

        .toast-close:hover {
            color: #333;
        }

        @media (max-width: 480px) {
            .toast-container {
                top: 10px;
                right: 10px;
                left: 10px;
            }

            .toast {
                min-width: auto;
                max-width: none;
            }
        }
    `;
    document.head.appendChild(styles);
}