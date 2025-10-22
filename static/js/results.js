document.addEventListener('DOMContentLoaded', function() {
    // Éléments DOM
    const ndviSvg = document.getElementById('ndvi-svg');
    const ndwiSvg = document.getElementById('ndwi-svg');
    const ndviGif = document.getElementById('ndviGif');
    const ndwiGif = document.getElementById('ndwiGif');
    
    // Animation d'entrée pour les KPI cards
    function animateKPICards() {
        const kpiCards = document.querySelectorAll('.kpi-card');
        kpiCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }
    
    // Animation des valeurs KPI
    function animateKPIValues() {
        const kpiValues = document.querySelectorAll('.kpi-value');
        
        kpiValues.forEach(valueElement => {
            const finalValue = valueElement.textContent.replace(/[^\d.-]/g, '');
            
            if (!isNaN(finalValue) && finalValue !== '' && finalValue !== '--') {
                const numericValue = parseFloat(finalValue);
                let currentValue = 0;
                const increment = numericValue / 30;
                const isDecimal = finalValue.includes('.');
                
                const counter = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= numericValue) {
                        if (isDecimal) {
                            valueElement.textContent = numericValue.toFixed(3);
                        } else {
                            valueElement.textContent = Math.round(numericValue);
                        }
                        clearInterval(counter);
                    } else {
                        if (isDecimal) {
                            valueElement.textContent = currentValue.toFixed(3);
                        } else {
                            valueElement.textContent = Math.floor(currentValue);
                        }
                    }
                }, 50);
            }
        });
    }
    
    // Fonction pour obtenir la boîte englobante des coordonnées
    function getBoundingBox(coordinates) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        coordinates.forEach(coord => {
            const [x, y] = coord;
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        });
        
        return [minX, minY, maxX, maxY];
    }
    
    // Fonction pour afficher le contour de la localité
    function displayLocalityContour(locality, svgElement, gifElement) {
        if (!locality || !locality.geometry) return;
        
        const coordinates = locality.geometry.coordinates[0];
        const [minX, minY, maxX, maxY] = getBoundingBox(coordinates);
        
        const width = svgElement.clientWidth;
        const height = svgElement.clientHeight;
        const scale = Math.min(width / (maxX - minX), height / (maxY - minY)) * 0.8;
        const offsetX = (width - (maxX - minX) * scale) / 2;
        const offsetY = (height - (maxY - minY) * scale) / 2;
        
        const pathData = coordinates.map(coord => {
            const x = (coord[0] - minX) * scale + offsetX;
            const y = (maxY - coord[1]) * scale + offsetY;
            return `${x},${y}`;
        }).join(' ');
        
        // Nettoyer le SVG
        svgElement.innerHTML = '';
        
        // Créer le masque
        const defsElement = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const maskElement = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
        maskElement.setAttribute('id', `mask-${svgElement.id}`);
        
        // Rectangle noir pour masquer
        const rectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rectElement.setAttribute('width', '100%');
        rectElement.setAttribute('height', '100%');
        rectElement.setAttribute('fill', 'black');
        maskElement.appendChild(rectElement);
        
        // Polygone blanc pour révéler
        const maskPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        maskPolygon.setAttribute('points', pathData);
        maskPolygon.setAttribute('fill', 'white');
        maskElement.appendChild(maskPolygon);
        
        defsElement.appendChild(maskElement);
        svgElement.appendChild(defsElement);
        
        // Contour visible
        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        pathElement.setAttribute('points', pathData);
        pathElement.setAttribute('fill', 'none');
        pathElement.setAttribute('stroke', '#ffffff');
        pathElement.setAttribute('stroke-width', '3');
        pathElement.setAttribute('opacity', '0.8');
        pathElement.setAttribute('filter', 'drop-shadow(0 0 5px rgba(0,0,0,0.5))');
        svgElement.appendChild(pathElement);
        
        // Appliquer le masque au GIF
        if (gifElement) {
            gifElement.style.mask = `url(#mask-${svgElement.id})`;
            gifElement.style.webkitMask = `url(#mask-${svgElement.id})`;
        }
    }
    
    // Chargement des données de la localité
    function loadLocalityData() {
        const localityName = document.querySelector('.navbar-text').textContent.trim();
        
        if (localityName) {
            fetch(`/get_locality_geojson?name=${encodeURIComponent(localityName)}`)
                .then(response => response.json())
                .then(geojsonData => {
                    displayLocalityContour(geojsonData, ndviSvg, ndviGif);
                    displayLocalityContour(geojsonData, ndwiSvg, ndwiGif);
                })
                .catch(error => {
                    console.error('Erreur lors du chargement des données de localité:', error);
                });
        }
    }
    
    // Animation des cartes de visualisation
    function animateVisualizationCards() {
        const cards = document.querySelectorAll('.visualization-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.8s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 800 + index * 300);
        });
    }
    
    // Gestion des erreurs de chargement des GIFs
    function handleGifErrors() {
        [ndviGif, ndwiGif].forEach(gif => {
            gif.addEventListener('error', function() {
                const container = this.parentElement;
                const errorDiv = document.createElement('div');
                errorDiv.className = 'd-flex align-items-center justify-content-center h-100 text-muted';
                errorDiv.innerHTML = `
                    <div class="text-center">
                        <i class="bi bi-exclamation-triangle" style="font-size: 3rem; opacity: 0.3;"></i>
                        <p class="mt-2">Erreur de chargement</p>
                        <small>L'image n'a pas pu être chargée</small>
                    </div>
                `;
                container.appendChild(errorDiv);
                this.style.display = 'none';
            });
            
            gif.addEventListener('load', function() {
                this.style.opacity = '0';
                this.style.transition = 'opacity 0.8s ease';
                setTimeout(() => {
                    this.style.opacity = '1';
                }, 100);
            });
        });
    }
    
    // Démarrer les animations
    setTimeout(animateKPICards, 500);
    setTimeout(animateKPIValues, 1000);
    setTimeout(animateVisualizationCards, 1500);
    setTimeout(loadLocalityData, 2000);
    
    handleGifErrors();
    
    // Scroll animations
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
    
    // Observer les cartes d'interprétation
    document.querySelectorAll('.interpretation-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Fonctions globales pour les contrôles
function toggleGif(gifId) {
    const gif = document.getElementById(gifId);
    if (gif) {
        // Toggle pause/play (simulation - les GIFs ne peuvent pas être réellement contrôlés)
        if (gif.style.animationPlayState === 'paused') {
            gif.style.animationPlayState = 'running';
        } else {
            gif.style.animationPlayState = 'paused';
        }
    }
}

function exportData() {
    const locality = document.querySelector('.navbar-text').textContent.trim();
    
    // Simulation d'export de données
    const data = {
        locality: locality,
        timestamp: new Date().toISOString(),
        ndvi_mean: document.getElementById('ndviValue').textContent,
        ndwi_mean: document.getElementById('ndwiValue').textContent,
        analysis_period: 'Janvier - Mars 2025',
        source: 'Sentinel-2 via Google Earth Engine'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earth_monitor_${locality.replace(/\s+/g, '_')}_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Feedback utilisateur
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show position-fixed';
    alert.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    alert.innerHTML = `
        <i class="bi bi-download me-2"></i>
        <strong>Téléchargement réussi !</strong> Les données ont été exportées.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

function shareResults() {
    const locality = document.querySelector('.navbar-text').textContent.trim();
    const url = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: `Analyse Environnementale - ${locality}`,
            text: `Découvrez l'analyse NDVI/NDWI de ${locality} via Earth Monitor`,
            url: url
        }).catch(console.error);
    } else {
        // Fallback: copier l'URL dans le presse-papiers
        navigator.clipboard.writeText(url).then(() => {
            const alert = document.createElement('div');
            alert.className = 'alert alert-info alert-dismissible fade show position-fixed';
            alert.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
            alert.innerHTML = `
                <i class="bi bi-link me-2"></i>
                <strong>Lien copié !</strong> L'URL a été copiée dans le presse-papiers.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.body.appendChild(alert);
            
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 5000);
        }).catch(() => {
            // Fallback du fallback
            prompt('Copiez ce lien pour partager:', url);
        });
    }
}
