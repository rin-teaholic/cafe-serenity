/**
 * Café Serenity - メインJavaScriptファイル
 * モジュール化されたコードで保守性を向上
 */

// 定数定義
const CONFIG = {
    SCROLL_THRESHOLD: 300,
    ANIMATION_DURATION: 800,
    DEBOUNCE_DELAY: 150,
    MOBILE_BREAKPOINT: 768
};

// ユーティリティ関数
const Utils = {
    /**
     * デバウンス関数
     * @param {Function} func - 実行する関数
     * @param {number} wait - 待機時間（ミリ秒）
     * @returns {Function} デバウンスされた関数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * スムーズスクロール
     * @param {string|HTMLElement} target - スクロール先
     */
    smoothScroll(target) {
        const element = typeof target === 'string' 
            ? document.querySelector(target) 
            : target;
            
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    },

    /**
     * 要素の表示/非表示を切り替え
     * @param {HTMLElement} element - 対象要素
     * @param {boolean} show - 表示フラグ
     */
    toggleVisibility(element, show) {
        if (!element) return;
        
        if (show) {
            element.classList.remove('opacity-0', 'invisible');
            element.classList.add('opacity-100', 'visible');
        } else {
            element.classList.add('opacity-0', 'invisible');
            element.classList.remove('opacity-100', 'visible');
        }
    }
};

// モバイルメニュー管理
class MobileMenu {
    constructor() {
        this.menuBtn = document.getElementById('mobile-menu-btn');
        this.menu = document.getElementById('mobile-menu');
        this.isOpen = false;
        
        this.init();
    }

    init() {
        if (!this.menuBtn || !this.menu) return;
        
        // メニューボタンのクリックイベント
        this.menuBtn.addEventListener('click', () => this.toggle());
        
        // メニュー内のリンククリックで閉じる
        this.menu.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', () => this.close());
        });
        
        // ESCキーで閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        // 外側クリックで閉じる
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.menu.contains(e.target) && !this.menuBtn.contains(e.target)) {
                this.close();
            }
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.menu.classList.remove('hidden');
        this.menuBtn.setAttribute('aria-expanded', 'true');
        this.menu.setAttribute('aria-hidden', 'false');
        this.isOpen = true;
        
        // アイコンを変更
        const icon = this.menuBtn.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        }
    }

    close() {
        this.menu.classList.add('hidden');
        this.menuBtn.setAttribute('aria-expanded', 'false');
        this.menu.setAttribute('aria-hidden', 'true');
        this.isOpen = false;
        
        // アイコンを戻す
        const icon = this.menuBtn.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }
}

// スクロール関連の機能
class ScrollEffects {
    constructor() {
        this.scrollTopBtn = document.getElementById('scroll-top');
        this.parallaxElements = document.querySelectorAll('.parallax');
        this.sections = document.querySelectorAll('section[id]');
        this.navLinks = document.querySelectorAll('nav a[href^="#"]');
        
        this.init();
    }

    init() {
        // スクロールイベント（デバウンス付き）
        window.addEventListener('scroll', Utils.debounce(() => {
            this.handleScroll();
        }, CONFIG.DEBOUNCE_DELAY));
        
        // スクロールトップボタン
        if (this.scrollTopBtn) {
            this.scrollTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        
        // スムーズスクロール
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = anchor.getAttribute('href');
                Utils.smoothScroll(target);
            });
        });
    }

    handleScroll() {
        const scrollY = window.pageYOffset;
        
        // スクロールトップボタンの表示制御
        if (this.scrollTopBtn) {
            Utils.toggleVisibility(this.scrollTopBtn, scrollY > CONFIG.SCROLL_THRESHOLD);
        }
        
        // パララックス効果
        this.updateParallax(scrollY);
        
        // ナビゲーションのアクティブ状態
        this.updateActiveNavigation();
    }

    updateParallax(scrollY) {
        this.parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.speed) || 0.5;
            const yPos = -(scrollY * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    updateActiveNavigation() {
        let current = '';
        
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        
        this.navLinks.forEach(link => {
            link.classList.remove('text-amber-600', 'font-semibold');
            link.classList.add('text-stone-800');
            
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.remove('text-stone-800');
                link.classList.add('text-amber-600', 'font-semibold');
            }
        });
    }
}

// フォーム管理
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.init();
    }

    init() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // リアルタイムバリデーション
        this.form.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        
        if (isRequired && !value) {
            this.showError(field, 'このフィールドは必須です');
            return false;
        }
        
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showError(field, '有効なメールアドレスを入力してください');
                return false;
            }
        }
        
        this.clearError(field);
        return true;
    }

    showError(field, message) {
        const errorElement = field.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
        } else {
            const error = document.createElement('p');
            error.className = 'error-message text-red-600 text-sm mt-1';
            error.textContent = message;
            field.parentElement.appendChild(error);
        }
        field.classList.add('border-red-500');
    }

    clearError(field) {
        const errorElement = field.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
        field.classList.remove('border-red-500');
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // 全フィールドのバリデーション
        const fields = this.form.querySelectorAll('input, textarea');
        let isValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        if (!isValid) return;
        
        // 送信処理
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            // 送信中の表示
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>送信中...';
            submitBtn.disabled = true;
            
            // フォームデータを収集
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData);
            
            // 実際の送信処理をシミュレート（本番環境では実際のAPIを呼び出す）
            await this.simulateSubmit(data);
            
            // 成功表示
            submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>送信完了！';
            submitBtn.classList.add('bg-green-600');
            
            // フォームをリセット
            setTimeout(() => {
                this.form.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('bg-green-600');
            }, 2000);
            
        } catch (error) {
            // エラー表示
            submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i>送信エラー';
            submitBtn.classList.add('bg-red-600');
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('bg-red-600');
            }, 2000);
        }
    }

    simulateSubmit(data) {
        return new Promise((resolve) => {
            console.log('Form data:', data);
            setTimeout(resolve, 2000);
        });
    }
}

// アクセシビリティ機能
class Accessibility {
    constructor() {
        this.init();
    }

    init() {
        // フォーカストラップの設定
        this.setupFocusTrap();
        
        // スキップリンクの追加
        this.addSkipLink();
        
        // キーボードナビゲーションの改善
        this.improveKeyboardNavigation();
    }

    setupFocusTrap() {
        const mobileMenu = document.getElementById('mobile-menu');
        if (!mobileMenu) return;
        
        // モバイルメニューが開いているときのフォーカストラップ
        const focusableElements = mobileMenu.querySelectorAll(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        mobileMenu.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        });
    }

    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-stone-800 text-white px-4 py-2 rounded';
        skipLink.textContent = 'メインコンテンツへスキップ';
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    improveKeyboardNavigation() {
        // メニューカードにtabindexを追加
        document.querySelectorAll('.menu-card').forEach(card => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'article');
        });
        
        // ギャラリー画像にキーボードアクセシビリティを追加
        document.querySelectorAll('#gallery .group').forEach(item => {
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'img');
            
            const img = item.querySelector('img');
            if (img && img.alt) {
                item.setAttribute('aria-label', img.alt);
            }
        });
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // AOS初期化
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: CONFIG.ANIMATION_DURATION,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }
    
    // 各モジュールの初期化
    new MobileMenu();
    new ScrollEffects();
    new ContactForm();
    new Accessibility();
    
    // パフォーマンス最適化：画像の遅延読み込み
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    } else {
        // Intersection Observer を使用した遅延読み込み
        const lazyImages = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
});

// Service Worker の登録（PWA対応）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('ServiceWorker registration successful'))
            .catch(err => console.log('ServiceWorker registration failed:', err));
    });
}
