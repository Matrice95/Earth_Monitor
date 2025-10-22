document.addEventListener('DOMContentLoaded', function() {
    // Éléments DOM
    const form = document.getElementById('localityForm');
    const processButton = document.getElementById('processButton');
    const statusContainer = document.querySelector('.status-container');
    const navbar = document.querySelector('.navbar');
    
    // Navigation smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Navbar background change on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(40, 80, 80, 0.98)';
        } else {
            navbar.style.background = 'rgba(40, 80, 80, 0.95)';
        }
    });
    
    // Animation des éléments au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observer les cartes d'indices
    document.querySelectorAll('.indice-card, .feature-item').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // Animation des statistiques du hero
    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const finalValue = stat.textContent;
            const isNumeric = !isNaN(finalValue);
            
            if (isNumeric) {
                const increment = finalValue / 50;
                let currentValue = 0;
                
                const counter = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= finalValue) {
                        stat.textContent = finalValue;
                        clearInterval(counter);
                    } else {
                        stat.textContent = Math.floor(currentValue);
                    }
                }, 30);
            }
        });
    }
    
    // Démarrer l'animation des stats après 1 seconde
    setTimeout(animateStats, 1000);
    
    // Fonction pour afficher les messages de statut
    function showStatus(message, type = 'info') {
        const statusElement = document.createElement('div');
        statusElement.className = `alert alert-${type} alert-dismissible fade show`;
        statusElement.style.animation = 'fadeInUp 0.5s ease';
        
        let icon = '';
        switch(type) {
            case 'info':
                icon = '<i class="bi bi-info-circle me-2"></i>';
                break;
            case 'success':
                icon = '<i class="bi bi-check-circle me-2"></i>';
                break;
            case 'danger':
                icon = '<i class="bi bi-exclamation-triangle me-2"></i>';
                break;
            case 'warning':
                icon = '<i class="bi bi-clock me-2"></i>';
                break;
        }
        
        statusElement.innerHTML = `
            ${icon}
            <strong>${new Date().toLocaleTimeString()}</strong> - ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        statusContainer.innerHTML = '';
        statusContainer.appendChild(statusElement);
        
        // Auto-hide après 5 secondes pour les messages d'info
        if (type === 'info' || type === 'warning') {
            setTimeout(() => {
                if (statusElement.parentNode) {
                    statusElement.remove();
                }
            }, 5000);
        }
    }
    
    // Gestion du formulaire de sélection de localité
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const locality = document.getElementById('localitySelect').value;
        if (!locality) {
            showStatus('Veuillez sélectionner une localité', 'warning');
            return;
        }
        
        // Désactiver le bouton et afficher le loading
        processButton.disabled = true;
        processButton.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i class="bi bi-satellite me-1"></i>
            Analyse en cours...
        `;
        
        showStatus(`🛰️ Démarrage de l'analyse pour <strong>${locality}</strong>`, 'info');
        
        // Étape 1: Récupérer les données GeoJSON
        showStatus(`📍 Récupération des données géographiques...`, 'info');
        
        fetch(`/get_locality_geojson?name=${encodeURIComponent(locality)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status}: Localité introuvable`);
            }
            return response.json();
        })
        .then(geojsonData => {
            // Étape 2: Lancer le traitement des images
            showStatus(`🔄 Traitement des images satellitaires en cours...`, 'info');
            
            const formData = new FormData();
            formData.append('locality', locality);
            
            return fetch('/process', {
                method: 'POST',
                body: formData
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur de traitement: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Succès - redirection vers la page de résultats
            showStatus(`✅ Analyse terminée avec succès !`, 'success');
            
            setTimeout(() => {
                window.location.href = `/results/${encodeURIComponent(locality)}`;
            }, 1500);
        })
        .catch(error => {
            console.error('Erreur:', error);
            showStatus(`❌ Erreur lors de l'analyse: ${error.message}`, 'danger');
            
            // Réactiver le bouton
            processButton.disabled = false;
            processButton.innerHTML = `
                <i class="bi bi-search me-2"></i>
                Analyser
            `;
        });
    });
    
    // Effet de parallax subtil pour le hero
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroBackground = document.querySelector('.hero-background');
        
        if (heroBackground && scrolled < window.innerHeight) {
            heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
    
    // Animation des cartes au hover
    document.querySelectorAll('.indice-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Préchargement des images de fond pour une meilleure performance
    function preloadImages() {
        const images = [
            'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06',
            'https://images.unsplash.com/photo-1574263867128-ee736d8b0b0b'
        ];
        
        images.forEach(src => {
            const img = new Image();
            img.src = src + '?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
        });
    }
    
    preloadImages();
    
    // Easter egg: Animation spéciale sur double-clic du logo
    let clickCount = 0;
    document.querySelector('.navbar-brand').addEventListener('click', function() {
        clickCount++;
        if (clickCount === 3) {
            // Animation de confettis ou effet spécial
            this.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                this.style.animation = '';
                clickCount = 0;
            }, 500);
        }
        
        setTimeout(() => {
            clickCount = 0;
        }, 2000);
    });
});