// Theme management
class ThemeManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupTheme();
    this.setupThemeToggle();
  }

  setupTheme() {
    // Check for saved theme or default to system preference
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme(systemPrefersDark ? "dark" : "light");
    }

    // Listen for system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem("theme")) {
          this.setTheme(e.matches ? "dark" : "light");
        }
      });
  }

  setupThemeToggle() {
    const themeToggle = document.querySelector(".theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        this.toggleTheme();
      });
    }
  }

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    this.setTheme(newTheme);
  }

  getCurrentTheme() {
    return document.documentElement.getAttribute("data-theme");
  }
}

// Copy to clipboard functionality
class ClipboardManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupCopyButtons();
  }

  setupCopyButtons() {
    // Install command copy button
    const installCopyBtn = document.querySelector(".install-command__copy");
    if (installCopyBtn) {
      installCopyBtn.addEventListener("click", () => {
        const text = document.querySelector(
          ".install-command__text"
        ).textContent;
        this.copyToClipboard(text, installCopyBtn);
      });
    }

    // Method copy buttons
    const copyButtons = document.querySelectorAll(".copy-btn");
    copyButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const text = e.target.getAttribute("data-copy");
        if (text) {
          this.copyToClipboard(text, e.target);
        }
      });
    });
  }

  async copyToClipboard(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      this.showCopyFeedback(button);
    } catch (err) {
      // Fallback for older browsers
      this.fallbackCopyToClipboard(text, button);
    }
  }

  fallbackCopyToClipboard(text, button) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      this.showCopyFeedback(button);
    } catch (err) {
      console.error("Failed to copy: ", err);
    } finally {
      document.body.removeChild(textArea);
    }
  }

  showCopyFeedback(button) {
    const originalText = button.textContent;
    button.textContent = "Copied!";
    button.classList.add("copied");

    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove("copied");
    }, 2000);
  }
}

// Scroll management
class ScrollManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupScrollToTop();
    this.setupSmoothScrolling();
    this.handleScrollVisibility();
  }

  setupScrollToTop() {
    const scrollBtn = document.querySelector(".scroll-to-top");
    if (scrollBtn) {
      scrollBtn.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    }
  }

  setupSmoothScrolling() {
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          const headerOffset = 80; // Account for sticky nav
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      });
    });
  }

  handleScrollVisibility() {
    const scrollBtn = document.querySelector(".scroll-to-top");
    if (!scrollBtn) return;

    const toggleScrollButton = () => {
      if (window.pageYOffset > 300) {
        scrollBtn.classList.add("visible");
      } else {
        scrollBtn.classList.remove("visible");
      }
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          toggleScrollButton();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Initial check
    toggleScrollButton();
  }
}

// Animation and intersection observer
class AnimationManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    // Check if Intersection Observer is supported
    if (!("IntersectionObserver" in window)) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in-up");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements that should animate on scroll
    const animateElements = document.querySelectorAll(
      ".feature, .template, .usage-example, .usage__step"
    );
    animateElements.forEach((el) => observer.observe(el));
  }
}

// Terminal animation
class TerminalAnimation {
  constructor() {
    this.init();
  }

  init() {
    this.setupTerminalAnimation();
  }

  setupTerminalAnimation() {
    const terminal = document.querySelector(".terminal");
    if (!terminal) return;

    // Check if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lines = terminal.querySelectorAll(".terminal__line");

    // Hide all lines initially
    lines.forEach((line) => {
      line.style.opacity = "0";
      line.style.transform = "translateY(10px)";
    });

    // Animate lines on intersection
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animateTerminalLines(lines);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(terminal);
  }

  animateTerminalLines(lines) {
    lines.forEach((line, index) => {
      setTimeout(() => {
        line.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        line.style.opacity = "1";
        line.style.transform = "translateY(0)";
      }, index * 500);
    });
  }
}

// Performance and utilities
class PerformanceManager {
  constructor() {
    this.init();
  }

  init() {
    this.preloadCriticalResources();
    this.setupLazyLoading();
    this.setupErrorHandling();
  }

  preloadCriticalResources() {
    // Preload critical fonts
    const fontLinks = [
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
    ];

    fontLinks.forEach((href) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "style";
      link.href = href;
      document.head.appendChild(link);
    });
  }

  setupLazyLoading() {
    // Lazy load images using Intersection Observer
    if (!("IntersectionObserver" in window)) return;

    const images = document.querySelectorAll("img[data-src]");
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  }

  setupErrorHandling() {
    // Global error handling
    window.addEventListener("error", (e) => {
      console.error("Global error:", e.error);
    });

    // Unhandled promise rejection handling
    window.addEventListener("unhandledrejection", (e) => {
      console.error("Unhandled promise rejection:", e.reason);
    });
  }
}

// Accessibility enhancements
class AccessibilityManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupScreenReaderSupport();
  }

  setupKeyboardNavigation() {
    // Enhanced keyboard navigation for theme toggle
    const themeToggle = document.querySelector(".theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          themeToggle.click();
        }
      });
    }

    // Escape key to close any open elements
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        // Close any open dropdowns, modals, etc.
        document.querySelectorAll(".open").forEach((el) => {
          el.classList.remove("open");
        });
      }
    });
  }

  setupFocusManagement() {
    // Ensure focus is visible for keyboard users
    let mouseUser = false;
    let keyboardUser = false;

    document.addEventListener("mousedown", () => {
      mouseUser = true;
      keyboardUser = false;
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        mouseUser = false;
        keyboardUser = true;
      }
    });

    // Add classes to body for styling purposes
    document.addEventListener("focusin", () => {
      if (keyboardUser) {
        document.body.classList.add("keyboard-user");
      }
    });

    document.addEventListener("focusout", () => {
      if (mouseUser) {
        document.body.classList.remove("keyboard-user");
      }
    });
  }

  setupScreenReaderSupport() {
    // Add screen reader announcements for dynamic content
    const announcer = document.createElement("div");
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");
    announcer.className = "sr-only";
    announcer.style.cssText =
      "position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;";
    document.body.appendChild(announcer);

    // Store reference for other components to use
    window.announcer = announcer;
  }

  announce(message) {
    if (window.announcer) {
      window.announcer.textContent = message;
    }
  }
}

// Main application
class TohumWebsite {
  constructor() {
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.initializeComponents()
      );
    } else {
      this.initializeComponents();
    }
  }

  initializeComponents() {
    try {
      // Initialize all components
      this.themeManager = new ThemeManager();
      this.clipboardManager = new ClipboardManager();
      this.scrollManager = new ScrollManager();
      this.animationManager = new AnimationManager();
      this.terminalAnimation = new TerminalAnimation();
      this.performanceManager = new PerformanceManager();
      this.accessibilityManager = new AccessibilityManager();

      // Setup analytics if available
      this.setupAnalytics();

      // Mark as loaded
      document.body.classList.add("loaded");

      console.log("Tohum website initialized successfully");
    } catch (error) {
      console.error("Error initializing website components:", error);
    }
  }

  setupAnalytics() {
    // Placeholder for analytics initialization
    // This would typically include Google Analytics, Plausible, etc.
    console.log("Analytics setup placeholder");
  }
}

// Initialize the website
const website = new TohumWebsite();

// Export for potential use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = { TohumWebsite };
}
