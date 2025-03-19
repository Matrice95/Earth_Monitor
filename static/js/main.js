document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('localityForm');
    const processButton = document.getElementById('processButton');
    const statusMessages = document.getElementById('statusMessages');
    const ndviGif = document.getElementById('ndviGif');
    const ndwiGif = document.getElementById('ndwiGif');
    const ndviPlaceholder = document.getElementById('ndviPlaceholder');
    const ndwiPlaceholder = document.getElementById('ndwiPlaceholder');
    
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
        
        // Mettre à jour le statut
        addStatusMessage(`Lancement du traitement pour ${locality}...`);
        
        // Créer les données de formulaire
        const formData = new FormData();
        formData.append('locality', locality);
        
        // Envoyer la requête au serveur
        fetch('/process', {
            method: 'POST',
            body: formData
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
            
            // Afficher les GIFs
            ndviGif.src = data.ndvi_gif + '?t=' + new Date().getTime(); // Éviter la mise en cache
            ndwiGif.src = data.ndwi_gif + '?t=' + new Date().getTime();
            
            ndviGif.onload = function() {
                ndviGif.classList.remove('d-none');
                ndviPlaceholder.classList.add('d-none');
            };
            
            ndwiGif.onload = function() {
                ndwiGif.classList.remove('d-none');
                ndwiPlaceholder.classList.add('d-none');
            };
        })
        .catch(error => {
            addStatusMessage(`Erreur: ${error.message}`, 'error');
        })
        .finally(() => {
            // Réactiver le bouton
            processButton.disabled = false;
            processButton.innerHTML = 'Lancer le traitement';
        });
    });
});