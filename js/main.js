/**
 * Café Serenity - メインJavaScriptファイル
 * モジュール化されたコードで保守性を向上
 */

// ヒーローボタンアニメーション管理
class HeroButtonAnimations {
    constructor() {
        this.heroButtons = document.querySelectorAll('.hero-btn');
        this.init();
    }

    init() {
        if (!this.heroButtons.length) return;
        
        this.heroButtons.forEach(button => {
            this.addClickAnimation(button);
            this.addHoverEffects(button);
        });
    }

    addClickAnimation(button) {
        button.addEventListener('click', (e) => {
            // クリック時のリップル効果
            this.createRippleEffect(e, button);
            
            // ボタンの一時的な無効化（ダブルクリック防止）
            button.style.pointerEvents = 'none';
            setTimeout(() => {
                button.style.pointerEvents = 'auto';
            }, 300);
        });
    }

    createRippleEffect(event, button) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        button.appendChild(ripple);
        
        // アニメーション完了後に要素を削除
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    addHoverEffects(button) {
        // ホバー時の音響効果（オプション）
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0) scale(1)';
        });
    }
}

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
        
        // パフォーマンス最適化のための変数
        this.isScrolling = false;
        this.lastScrollY = 0;
        this.currentActiveSection = '';
        this.scrollTopBtnVisible = false;
        
        this.init();
    }

    init() {
        // スクロールイベント（requestAnimationFrameで最適化）
        window.addEventListener('scroll', () => {
            if (!this.isScrolling) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    this.isScrolling = false;
                });
                this.isScrolling = true;
            }
        });
        
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
        
        // スクロールトップボタンの表示制御（変更時のみ実行）
        if (this.scrollTopBtn) {
            const shouldShow = scrollY > CONFIG.SCROLL_THRESHOLD;
            if (shouldShow !== this.scrollTopBtnVisible) {
                Utils.toggleVisibility(this.scrollTopBtn, shouldShow);
                this.scrollTopBtnVisible = shouldShow;
            }
        }
        
        // パララックス効果（変更時のみ実行）
        if (Math.abs(scrollY - this.lastScrollY) > 5) {
            this.updateParallax(scrollY);
            this.lastScrollY = scrollY;
        }
        
        // ナビゲーションのアクティブ状態（変更時のみ実行）
        this.updateActiveNavigation(scrollY);
    }

    updateParallax(scrollY) {
        // CSS変数を使用してパフォーマンスを向上
        this.parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.speed) || 0.5;
            const yPos = -(scrollY * speed);
            element.style.setProperty('--parallax-y', `${yPos}px`);
        });
    }

    updateActiveNavigation(scrollY) {
        let current = '';
        
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        
        // アクティブセクションが変更された場合のみ更新
        if (current !== this.currentActiveSection) {
            this.navLinks.forEach(link => {
                const href = link.getAttribute('href');
                const isActive = href === `#${current}`;
                
                if (isActive) {
                    link.classList.remove('text-stone-800');
                    link.classList.add('text-amber-600', 'font-semibold');
                } else {
                    link.classList.remove('text-amber-600', 'font-semibold');
                    link.classList.add('text-stone-800');
                }
            });
            
            this.currentActiveSection = current;
        }
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

// レスポンシブ制御クラス
class ResponsiveController {
    constructor() {
        this.mobileMenuBtn = document.getElementById('mobile-menu-btn');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.desktopMenu = document.getElementById('desktop-menu');
        this.currentBreakpoint = this.getCurrentBreakpoint();
        
        this.init();
    }

    init() {
        // 初期実行
        this.updateNavigation();
        
        // リサイズ時の実行（デバウンス付き）
        window.addEventListener('resize', Utils.debounce(() => {
            const newBreakpoint = this.getCurrentBreakpoint();
            if (newBreakpoint !== this.currentBreakpoint) {
                this.currentBreakpoint = newBreakpoint;
                this.updateNavigation();
            }
        }, 150));
        
        // PC表示での強制制御
        if (this.currentBreakpoint === 'desktop') {
            this.forceDesktopLayout();
        }
    }

    getCurrentBreakpoint() {
        return window.innerWidth < CONFIG.MOBILE_BREAKPOINT ? 'mobile' : 'desktop';
    }

    updateNavigation() {
        const isMobile = this.currentBreakpoint === 'mobile';
        
        if (isMobile) {
            // モバイル表示
            this.showMobileMenu();
            this.hideDesktopMenu();
        } else {
            // PC表示
            this.hideMobileMenu();
            this.showDesktopMenu();
            this.closeMobileMenu();
        }
        
        // PC表示での確実な表示制御
        if (!isMobile) {
            // デスクトップメニューを強制的に表示
            if (this.desktopMenu) {
                this.desktopMenu.style.display = 'flex';
                this.desktopMenu.style.visibility = 'visible';
                this.desktopMenu.style.opacity = '1';
                this.desktopMenu.classList.remove('hidden');
            }
            
            // モバイルメニューボタンを非表示
            if (this.mobileMenuBtn) {
                this.mobileMenuBtn.style.display = 'none';
                this.mobileMenuBtn.style.visibility = 'hidden';
                this.mobileMenuBtn.style.opacity = '0';
                this.mobileMenuBtn.classList.add('md:hidden');
            }
        }
    }

    showMobileMenu() {
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.classList.remove('hidden');
            this.mobileMenuBtn.style.display = 'block';
        }
    }

    hideMobileMenu() {
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.classList.add('hidden');
            this.mobileMenuBtn.style.display = 'none';
        }
    }

    showDesktopMenu() {
        if (this.desktopMenu) {
            this.desktopMenu.classList.remove('hidden');
            this.desktopMenu.style.display = 'flex';
        }
    }

    hideDesktopMenu() {
        if (this.desktopMenu) {
            this.desktopMenu.classList.add('hidden');
            this.desktopMenu.style.display = 'none';
        }
    }

    closeMobileMenu() {
        if (this.mobileMenu) {
            this.mobileMenu.classList.add('hidden');
            this.mobileMenu.setAttribute('aria-hidden', 'true');
        }
    }
    
    forceDesktopLayout() {
        // PC表示での強制レイアウト制御
        if (this.desktopMenu) {
            this.desktopMenu.style.display = 'flex';
            this.desktopMenu.style.visibility = 'visible';
            this.desktopMenu.style.opacity = '1';
            this.desktopMenu.classList.remove('hidden');
            this.desktopMenu.classList.add('md:flex');
        }
        
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.style.display = 'none';
            this.mobileMenuBtn.style.visibility = 'hidden';
            this.mobileMenuBtn.style.opacity = '0';
            this.mobileMenuBtn.classList.add('md:hidden');
        }
        
        if (this.mobileMenu) {
            this.mobileMenu.classList.add('hidden');
            this.mobileMenu.setAttribute('aria-hidden', 'true');
        }
        
        // グリッドレイアウトの強制適用
        const grids = document.querySelectorAll('.grid');
        grids.forEach(grid => {
            if (grid.classList.contains('md:grid-cols-2')) {
                grid.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
            }
            if (grid.classList.contains('md:grid-cols-3')) {
                grid.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
            }
            if (grid.classList.contains('lg:grid-cols-3')) {
                grid.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
            }
        });
        
        // フレックスレイアウトの強制適用
        const flexContainers = document.querySelectorAll('.flex');
        flexContainers.forEach(container => {
            if (container.classList.contains('md:flex-row')) {
                container.style.flexDirection = 'row';
            }
        });
        
        // PC表示でのアニメーション最適化
        this.optimizeAnimationsForDesktop();
    }
    
    optimizeAnimationsForDesktop() {
        // Menuセクションのアニメーション最適化
        const menuCards = document.querySelectorAll('#menu .menu-card');
        menuCards.forEach((card, index) => {
            // PC表示では即座にアニメーションを実行
            card.style.transitionDelay = `${index * 50}ms`;
            card.style.transitionDuration = '0.6s';
            
            // AOSの遅延を調整
            if (card.hasAttribute('data-aos-delay')) {
                const delay = parseInt(card.getAttribute('data-aos-delay'));
                card.setAttribute('data-aos-delay', Math.min(delay, 100));
            }
        });
        
        // AOSライブラリの再初期化（PC表示用）
        if (typeof AOS !== 'undefined') {
            setTimeout(() => {
                AOS.refresh();
            }, 200);
        }
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // 各モジュールの初期化
    new HeroButtonAnimations();
    new ResponsiveController();
    new MobileMenu();
    new ScrollEffects();
    new ContactForm();
    new Accessibility();
    
    // AOS初期化（レスポンシブ対応）
    if (typeof AOS !== 'undefined') {
        const isMobile = window.innerWidth < CONFIG.MOBILE_BREAKPOINT;
        
        AOS.init({
            duration: isMobile ? CONFIG.ANIMATION_DURATION : 600, // PC表示では短縮
            easing: 'ease-in-out',
            once: true,
            offset: isMobile ? 100 : 50, // PC表示では早めに発動
            delay: isMobile ? 0 : 0, // PC表示では遅延なし
            disable: false,
            startEvent: 'DOMContentLoaded',
            initClassName: 'aos-init',
            animatedClassName: 'aos-animate',
            useClassNames: false,
            disableMutationObserver: false,
            debounceDelay: 50,
            throttleDelay: 99
        });
        
        // PC表示での追加設定
        if (!isMobile) {
            // PC表示では即座にアニメーションを実行
            setTimeout(() => {
                AOS.refresh();
            }, 100);
        }
    }
    
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
