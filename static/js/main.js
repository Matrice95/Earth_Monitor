document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('localityForm');
    const processButton = document.getElementById('processButton');
    const statusMessages = document.getElementById('statusMessages');
    const ndviGif = document.getElementById('ndviGif');
    const ndwiGif = document.getElementById('ndwiGif');
    const ndviPlaceholder = document.getElementById('ndviPlaceholder');
    const ndwiPlaceholder = document.getElementById('ndwiPlaceholder');
    const ndviSvg = document.getElementById('ndvi-svg');
    const ndwiSvg = document.getElementById('ndwi-svg');
    const kpiCards = document.getElementById('kpiCards');
    const legendSection = document.getElementById('legendSection');
    const ndviValue = document.getElementById('ndviValue');
    const ndwiValue = document.getElementById('ndwiValue');
    
    // Animation d'entrée pour les éléments
    function animateIn(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Fonction pour calculer des valeurs NDVI/NDWI simulées (en attendant les vraies données)
    function calculateMockValues(localityName) {
        // Simulation basée sur le nom pour cohérence
        const hash = localityName.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        const ndvi = Math.abs(hash % 100) / 100 * 0.6 + 0.2; // Entre 0.2 et 0.8
        const ndwi = (Math.abs(hash % 80) - 40) / 100; // Entre -0.4 et 0.4
        
        return { ndvi: ndvi.toFixed(3), ndwi: ndwi.toFixed(3) };
    }
    
    // Fonction pour mettre à jour les KPI
    function updateKPI(locality) {
        const values = calculateMockValues(locality);
        
        // Animation des valeurs
        const animateValue = (element, finalValue, suffix = '') => {
            let startValue = 0;
            const duration = 1000;
            const increment = finalValue / (duration / 16);
            
            const counter = setInterval(() => {
                startValue += increment;
                if (startValue >= finalValue) {
                    clearInterval(counter);
                    startValue = finalValue;
                }
                element.textContent = startValue.toFixed(3) + suffix;
            }, 16);
        };
        
        kpiCards.style.display = 'block';
        animateIn(kpiCards);
        
        setTimeout(() => {
            animateValue(ndviValue, parseFloat(values.ndvi));
            animateValue(ndwiValue, parseFloat(values.ndwi));
        }, 300);
    }
    
    // Fonction pour obtenir la boîte englobante des coordonnées
    function getBoundingBox(coordinates) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        
        for (let i = 0; i < coordinates.length; i++) {
            const [x, y] = coordinates[i];
            
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        }
        
        return [minX, minY, maxX, maxY];
    }
    
    // Fonction pour afficher le contour de la localité
    function displayLocalityContour(locality, svgElement, gifElement) {
        if (locality && locality.geometry) {
            const coordinates = locality.geometry.coordinates[0];

            const [minX, minY, maxX, maxY] = getBoundingBox(coordinates);
            const width = svgElement.clientWidth;
            const height = svgElement.clientHeight;
            const scale = Math.min(width / (maxX - minX), height / (maxY - minY));
            const offsetX = (width - (maxX - minX) * scale) / 2;
            const offsetY = (height - (maxY - minY) * scale) / 2;
            const pathData = coordinates.map(coord => {
                const x = (coord[0] - minX) * scale + offsetX;
                const y = (maxY - coord[1]) * scale + offsetY;
                return `${x},${y}`;
            }).join(' ');

            svgElement.innerHTML = '';

            // Créer un masque SVG pour découper le GIF
            const defsElement = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const maskElement = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
            maskElement.setAttribute('id', `mask-${svgElement.id}`);
            
            // Ajouter un rectangle noir pour tout masquer par défaut
            const rectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rectElement.setAttribute('width', '100%');
            rectElement.setAttribute('height', '100%');
            rectElement.setAttribute('fill', 'black');
            maskElement.appendChild(rectElement);
            
            // Ajouter le polygone blanc pour montrer la zone de la localité
            const maskPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            maskPolygon.setAttribute('points', pathData);
            maskPolygon.setAttribute('fill', 'white');
            maskElement.appendChild(maskPolygon);
            
            defsElement.appendChild(maskElement);
            svgElement.appendChild(defsElement);
            
            // Ajouter aussi un contour visible pour la localité
            const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            pathElement.setAttribute('points', pathData);
            pathElement.setAttribute('fill', 'none');
            pathElement.setAttribute('stroke', '#2196F3');
            pathElement.setAttribute('stroke-width', '2');
            svgElement.appendChild(pathElement);

            // Appliquer le masque au GIF
            gifElement.style.mask = `url(#mask-${svgElement.id})`;
            gifElement.style.webkitMask = `url(#mask-${svgElement.id})`;
            
            // Ajouter la légende
            addLegend(svgElement, svgElement.id.includes('ndvi') ? 'NDVI' : 'NDWI');
        }
    }
    
    // Fonction pour ajouter une légende
    function addLegend(svgElement, type) {
        const legend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        legend.setAttribute('transform', 'translate(10, 350)');
        
        const legendTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        legendTitle.textContent = 'Légende';
        legendTitle.setAttribute('x', '0');
        legendTitle.setAttribute('y', '0');
        legendTitle.setAttribute('font-weight', 'bold');
        legendTitle.setAttribute('font-size', '12');
        legend.appendChild(legendTitle);
        
        const colors = type === 'NDVI' ? 
            [['< 0', '#8400A8'], ['0 à 0.1', '#EBE84A'], ['0.1 à 0.2', '#C5F358'], ['0.2 à 0.3', '#38A800'], ['> 0.3', '#008400']] :
            [['< 0', '#FFFFFF'], ['0 à 0.1', '#E6F5FF'], ['0.1 à 0.2', '#99D6FF'], ['0.2 à 0.3', '#0080FF'], ['> 0.3', '#0000FF']];
        
        for (let i = 0; i < colors.length; i++) {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', '0');
            rect.setAttribute('y', (i * 15 + 10).toString());
            rect.setAttribute('width', '15');
            rect.setAttribute('height', '12');
            rect.setAttribute('fill', colors[i][1]);
            legend.appendChild(rect);
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.textContent = colors[i][0];
            text.setAttribute('x', '20');
            text.setAttribute('y', (i * 15 + 20).toString());
            text.setAttribute('font-size', '10');
            legend.appendChild(text);
        }
        
        svgElement.appendChild(legend);
    }
    
    // Fonction pour ajouter un message de statut avec icônes
    function addStatusMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.classList.add('status-item', `status-${type}`);
        
        const timestamp = new Date().toLocaleTimeString();
        let icon = '';
        
        switch(type) {
            case 'info':
                icon = '<i class="bi bi-info-circle me-2"></i>';
                break;
            case 'success':
                icon = '<i class="bi bi-check-circle me-2"></i>';
                break;
            case 'error':
                icon = '<i class="bi bi-exclamation-triangle me-2"></i>';
                break;
        }
        
        messageElement.innerHTML = `
            <div class="d-flex align-items-center">
                ${icon}
                <div>
                    <small class="opacity-75">${timestamp}</small>
                    <div>${message}</div>
                </div>
            </div>
        `;
        
        statusMessages.innerHTML = ''; // Effacer les messages précédents
        statusMessages.appendChild(messageElement);
        statusMessages.scrollTop = statusMessages.scrollHeight;
        
        // Animation d'entrée
        animateIn(messageElement);
    }
    
    // Gestionnaire de soumission du formulaire
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const locality = document.getElementById('localitySelect').value;
        if (!locality) {
            addStatusMessage('Veuillez sélectionner une localité', 'error');
            return;
        }
        
        // Désactiver le bouton pendant le traitement avec animation
        processButton.disabled = true;
        processButton.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <i class="bi bi-satellite me-1"></i>
            Analyse en cours...
        `;
        
        // Réinitialiser les images avec transition fluide
        [ndviGif, ndwiGif].forEach(img => {
            img.style.transition = 'opacity 0.3s ease';
            img.style.opacity = '0';
            setTimeout(() => {
                img.classList.add('d-none');
                img.style.opacity = '1';
            }, 300);
        });
        
        [ndviPlaceholder, ndwiPlaceholder].forEach(placeholder => {
            placeholder.classList.remove('d-none');
            placeholder.classList.add('loading');
            placeholder.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <p>Traitement des images satellitaires...</p>
                    <small class="text-muted">Cela peut prendre quelques minutes</small>
                </div>
            `;
        });
        
        // Mettre à jour le statut
        addStatusMessage(`Récupération des données de ${locality}...`);
        
        // D'abord récupérer les données GeoJSON de la localité
        fetch(`/get_locality_geojson?name=${encodeURIComponent(locality)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(geojsonData => {
            // Stocker les données GeoJSON pour les utiliser plus tard
            window.currentLocalityGeoJson = geojsonData;
            
            addStatusMessage(`Lancement du traitement des images pour ${locality}...`);
            
            // Créer les données de formulaire pour le traitement
            const formData = new FormData();
            formData.append('locality', locality);
            
            // Lancer le traitement des images
            return fetch('/process', {
                method: 'POST',
                body: formData
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Traitement réussi avec animations
            addStatusMessage(`✨ Analyse terminée pour <strong>${data.locality}</strong>`, 'success');
            
            // Mettre à jour les KPI
            updateKPI(data.locality);
            
            // Désactiver l'animation de chargement
            [ndviPlaceholder, ndwiPlaceholder].forEach(placeholder => {
                placeholder.classList.remove('loading');
            });
            
            // Charger les GIFs avec un paramètre pour éviter la mise en cache
            const timestamp = new Date().getTime();
            ndviGif.src = data.ndvi_gif + '?t=' + timestamp;
            ndwiGif.src = data.ndwi_gif + '?t=' + timestamp;
            
            // Appliquer les masques quand les images sont chargées
            ndviGif.onload = function() {
                ndviPlaceholder.classList.add('d-none');
                ndviGif.classList.remove('d-none');
                ndviGif.style.opacity = '0';
                ndviGif.style.transition = 'opacity 0.6s ease';
                setTimeout(() => { ndviGif.style.opacity = '1'; }, 100);
                
                displayLocalityContour(window.currentLocalityGeoJson, ndviSvg, ndviGif);
                
                // Afficher les légendes
                legendSection.style.display = 'block';
                animateIn(legendSection);
            };
            
            ndwiGif.onload = function() {
                ndwiPlaceholder.classList.add('d-none');
                ndwiGif.classList.remove('d-none');
                ndwiGif.style.opacity = '0';
                ndwiGif.style.transition = 'opacity 0.6s ease';
                setTimeout(() => { ndwiGif.style.opacity = '1'; }, 100);
                
                displayLocalityContour(window.currentLocalityGeoJson, ndwiSvg, ndwiGif);
            };
        })
        .catch(error => {
            addStatusMessage(`❌ Erreur: ${error.message}`, 'error');
            [ndviPlaceholder, ndwiPlaceholder].forEach(placeholder => {
                placeholder.classList.remove('loading');
                placeholder.innerHTML = `
                    <div class="text-center text-danger">
                        <i class="bi bi-exclamation-triangle" style="font-size: 3rem; opacity: 0.3;"></i>
                        <p class="mt-2">Erreur lors du traitement</p>
                        <small class="text-muted">Veuillez réessayer</small>
                    </div>
                `;
            });
        })
        .finally(() => {
            // Réactiver le bouton avec animation
            processButton.disabled = false;
            processButton.innerHTML = `
                <i class="bi bi-play-circle me-2"></i>
                Lancer l'analyse
            `;
        });
    });
});
