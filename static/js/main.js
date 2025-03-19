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
    
    // Fonction pour ajouter un message de statut
    function addStatusMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.classList.add('status-item', `status-${type}`);
        
        const timestamp = new Date().toLocaleTimeString();
        messageElement.innerHTML = `<small>${timestamp}</small> - ${message}`;
        
        statusMessages.innerHTML = ''; // Effacer les messages précédents
        statusMessages.appendChild(messageElement);
        statusMessages.scrollTop = statusMessages.scrollHeight;
    }
    
    // Gestionnaire de soumission du formulaire
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const locality = document.getElementById('localitySelect').value;
        if (!locality) {
            addStatusMessage('Veuillez sélectionner une localité', 'error');
            return;
        }
        
        // Désactiver le bouton pendant le traitement
        processButton.disabled = true;
        processButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Traitement en cours...';
        
        // Réinitialiser les images
        ndviGif.classList.add('d-none');
        ndwiGif.classList.add('d-none');
        ndviPlaceholder.classList.remove('d-none');
        ndwiPlaceholder.classList.remove('d-none');
        ndviPlaceholder.classList.add('loading');
        ndwiPlaceholder.classList.add('loading');
        
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
            // Traitement réussi
            addStatusMessage(`Traitement terminé pour ${data.locality}`, 'success');
            
            // Désactiver l'animation de chargement
            ndviPlaceholder.classList.remove('loading');
            ndwiPlaceholder.classList.remove('loading');
            
            // Charger les GIFs avec un paramètre pour éviter la mise en cache
            ndviGif.src = data.ndvi_gif + '?t=' + new Date().getTime();
            ndwiGif.src = data.ndwi_gif + '?t=' + new Date().getTime();
            
            // Appliquer les masques quand les images sont chargées
            ndviGif.onload = function() {
                ndviGif.classList.remove('d-none');
                ndviPlaceholder.classList.add('d-none');
                displayLocalityContour(window.currentLocalityGeoJson, ndviSvg, ndviGif);
            };
            
            ndwiGif.onload = function() {
                ndwiGif.classList.remove('d-none');
                ndwiPlaceholder.classList.add('d-none');
                displayLocalityContour(window.currentLocalityGeoJson, ndwiSvg, ndwiGif);
            };
        })
        .catch(error => {
            addStatusMessage(`Erreur: ${error.message}`, 'error');
            ndviPlaceholder.classList.remove('loading');
            ndwiPlaceholder.classList.remove('loading');
        })
        .finally(() => {
            // Réactiver le bouton
            processButton.disabled = false;
            processButton.innerHTML = 'Lancer le traitement';
        });
    });
});
