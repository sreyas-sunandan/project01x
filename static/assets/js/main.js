document.addEventListener('DOMContentLoaded', function() {
  // Preloader
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', function() {
      setTimeout(function() {
        preloader.style.opacity = '0';
        setTimeout(function() {
          preloader.style.display = 'none';
        }, 500);
      }, 1000);
    });
  }

  // Header scroll effect
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // Scroll to top button
  const scrollTop = document.getElementById('scroll-top');
  if (scrollTop) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
        scrollTop.classList.add('active');
      } else {
        scrollTop.classList.remove('active');
      }
    });

    scrollTop.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Initialize Typed.js if available
  if (typeof Typed !== 'undefined') {
    const typedElements = document.querySelectorAll('.typed');
    typedElements.forEach(function(element) {
      const items = element.getAttribute('data-typed-items');
      if (items) {
        new Typed(element, {
          strings: items.split(','),
          typeSpeed: 100,
          backSpeed: 50,
          backDelay: 2000,
          loop: true
        });
      }
    });
  }

  // Form animations
  const inputs = document.querySelectorAll('input');
  inputs.forEach(function(input) {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
      if (this.value === '') {
        this.parentElement.classList.remove('focused');
      }
    });
    
    // Check if input has value on load
    if (input.value !== '') {
      input.parentElement.classList.add('focused');
    }
  });

  // Button ripple effect
  const buttons = document.querySelectorAll('button');
  buttons.forEach(function(button) {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');
      
      this.appendChild(ripple);
      
      setTimeout(function() {
        ripple.remove();
      }, 600);
    });
  });

  // Parallax effect for hero section
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    window.addEventListener('scroll', function() {
      const scrolled = window.pageYOffset;
      const parallax = heroSection.querySelector('img');
      if (parallax) {
        const speed = 0.5;
        parallax.style.transform = `translateY(${scrolled * speed}px)`;
      }
    });
  }

  // Animate elements on scroll
  const animateOnScroll = function() {
    const elements = document.querySelectorAll('[data-aos]');
    
    elements.forEach(function(element) {
      const elementPosition = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (elementPosition < windowHeight - 100) {
        element.classList.add('aos-animate');
      }
    });
  };

  // Run once on page load
  animateOnScroll();
  
  // Run on scroll
  window.addEventListener('scroll', animateOnScroll);

  // Form validation
  const loginForm = document.querySelector('form');
  if (loginForm) {
		loginForm.addEventListener('submit', function(e) {
		  const username = this.querySelector('input[name="username"]').value;
		  const password = this.querySelector('input[name="password"]').value;

		  if (!username || !password) {
			e.preventDefault();
			showNotification('Please fill in all fields', 'error');
		  }
		});
  }

  // Notification system
  function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(function() {
      notification.classList.remove('show');
      setTimeout(function() {
        notification.remove();
      }, 300);
    }, 3000);
  }

  // Add notification styles if not already added
  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        transform: translateX(120%);
        transition: transform 0.3s ease;
        z-index: 9999;
      }
      
      .notification.show {
        transform: translateX(0);
      }
      
      .notification.success {
        background-color: var(--success);
      }
      
      .notification.error {
        background-color: var(--error);
      }
    `;
    document.head.appendChild(style);
  }

  // Mobile menu toggle
const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
const navmenu = document.querySelector('#navmenu');
const wrapper = document.querySelector('.navmenu-wrapper');

let closeTimer = null;

if (mobileNavToggle && navmenu && wrapper) {

  // Click toggle
  mobileNavToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    navmenu.classList.toggle('navmenu-mobile-active');
    this.classList.toggle('bi-list');
    this.classList.toggle('bi-x');
  });

  // Hover open
  wrapper.addEventListener('mouseenter', () => {
    clearTimeout(closeTimer);
    navmenu.classList.add('navmenu-mobile-active');
    mobileNavToggle.classList.remove('bi-list');
    mobileNavToggle.classList.add('bi-x');
  });

  // Delayed close (KEY FIX)
  wrapper.addEventListener('pointerleave', () => {
    closeTimer = setTimeout(() => {
      navmenu.classList.remove('navmenu-mobile-active');
      mobileNavToggle.classList.remove('bi-x');
      mobileNavToggle.classList.add('bi-list');
    }, 300); // delay allows clicking
  });

  // Cancel close if interacting
  wrapper.addEventListener('pointerenter', () => {
    clearTimeout(closeTimer);
  });

  // Close on outside click
  document.addEventListener('click', () => {
    navmenu.classList.remove('navmenu-mobile-active');
    mobileNavToggle.classList.remove('bi-x');
    mobileNavToggle.classList.add('bi-list');
  });
}


  // Add particle effect to hero section
  const hero = document.querySelector('.hero');
  if (hero) {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    hero.appendChild(particlesContainer);
    
    // Create particles
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.width = Math.random() * 5 + 1 + 'px';
      particle.style.height = particle.style.width;
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.opacity = Math.random() * 0.5 + 0.2;
      particle.style.animationDuration = Math.random() * 20 + 10 + 's';
      particle.style.animationDelay = Math.random() * 5 + 's';
      particlesContainer.appendChild(particle);
    }
    
    // Add particle styles if not already added
    if (!document.querySelector('#particle-styles')) {
      const style = document.createElement('style');
      style.id = 'particle-styles';
      style.textContent = `
        .particles-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: -1;
        }
        
        .particle {
          position: absolute;
          background-color: var(--accent-gold);
          border-radius: 50%;
          animation: float linear infinite;
        }
        
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(100px);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
});
const sidebarToggle = document.querySelector('.sidebar-toggle');
const sidebar = document.getElementById('sidebar');

if (sidebarToggle && sidebar) {

  // Create overlay dynamically
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  function openSidebar() {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    sidebarToggle.classList.replace('bi-list', 'bi-x');
  }

  function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    sidebarToggle.classList.replace('bi-x', 'bi-list');
  }

  sidebarToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    sidebar.classList.contains('active') ? closeSidebar() : openSidebar();
  });

  overlay.addEventListener('click', closeSidebar);
}

