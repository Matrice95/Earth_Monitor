import os
import json
import ee
from flask import Flask, render_template, request, jsonify, redirect, url_for
from scripts.generate_gifs import process_locality
from datetime import datetime

app = Flask(__name__)

# Configuration
app.config.from_pyfile('config.py')

# Initialisation Earth Engine
try:
    ee.Initialize(project='ee-metamatrice95')
except:
    ee.Authenticate()
    ee.Initialize(project='ee-metamatrice95')

# Chargement des localités
with open(app.config['GEOJSON_PATH'], 'r') as f:
    geojson_data = json.load(f)

@app.route('/')
def landing():
    """Page d'accueil avec sélection de localité"""
    # Extraction des noms de localités pour le menu déroulant
    localities = []
    for feature in geojson_data["features"]:
        localities.append(feature["properties"]["NAME_3"])
    
    return render_template('landing.html', localities=sorted(localities))

@app.route('/results/<locality>')
def results(locality):
    """Page de résultats pour une localité spécifique"""
    # Vérifier si la localité existe
    locality_found = False
    for feature in geojson_data["features"]:
        if feature["properties"]["NAME_3"] == locality:
            locality_found = True
            break
    
    if not locality_found:
        return redirect(url_for('landing'))
    
    # Chemins vers les GIFs (ils doivent exister)
    ndvi_gif_path = f"/static/outputs/{locality}_gifs/NDVI_spatial.gif"
    ndwi_gif_path = f"/static/outputs/{locality}_gifs/NDWI_spatial.gif"
    
    # Simulation de valeurs pour la démo (en attendant le vrai traitement)
    # Ces valeurs seront remplacées par les vraies données après traitement
    import random
    random.seed(hash(locality))  # Pour avoir des valeurs cohérentes par localité
    
    mock_data = {
        'locality': locality,
        'ndvi_gif': ndvi_gif_path,
        'ndwi_gif': ndwi_gif_path,
        'ndvi_mean': round(random.uniform(0.2, 0.8), 3),
        'ndwi_mean': round(random.uniform(-0.3, 0.4), 3),
        'surface_area': round(random.uniform(50, 500), 1),
        'data_quality': round(random.uniform(75, 95), 0),
        'timestamp': int(datetime.now().timestamp()),
        'generation_date': datetime.now().strftime('%d/%m/%Y à %H:%M')
    }
    
    return render_template('results.html', **mock_data)

@app.route('/process', methods=['POST'])
def process():
    """Traite une localité et redirige vers les résultats"""
    locality_name = request.form.get('locality')
    if not locality_name:
        return jsonify({"error": "Nom de localité manquant"}), 400
    
    try:
        # Appel du script de traitement
        output_path = process_locality(locality_name)
        
        # Retourner le succès pour redirection côté client
        return jsonify({
            "success": True,
            "locality": locality_name,
            "redirect_url": f"/results/{locality_name}"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/get_locality_geojson')
def get_locality_geojson():
    locality_name = request.args.get('name')
    if not locality_name:
        return jsonify({"error": "Nom de localité manquant"}), 400
    
    try:
        # Parcourir le GeoJSON pour trouver la localité
        for feature in geojson_data["features"]:
            if feature["properties"]["NAME_3"] == locality_name:
                return jsonify(feature)
        
        return jsonify({"error": f"Localité {locality_name} introuvable"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
