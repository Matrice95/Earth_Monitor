import os
import json
import ee
from flask import Flask, render_template, request, jsonify
from scripts.generate_gifs import process_locality

app = Flask(__name__)

# Configuration
app.config.from_pyfile('config.py')

# Initialisation Earth Engine
try:
    ee.Initialize(project='ee-metamatrice')
except:
    ee.Authenticate()
    ee.Initialize(project='ee-metamatrice')

# Chargement des localités
with open(app.config['GEOJSON_PATH'], 'r') as f:
    geojson_data = json.load(f)

@app.route('/')
def index():
    # Extraction des noms de localités pour le menu déroulant
    localities = []
    for feature in geojson_data["features"]:
        localities.append(feature["properties"]["NAME_3"])
    
    return render_template('index.html', localities=sorted(localities))

@app.route('/process', methods=['POST'])
def process():
    locality_name = request.form.get('locality')
    if not locality_name:
        return jsonify({"error": "Nom de localité manquant"}), 400
    
    try:
        # Appel du script de traitement
        output_path = process_locality(locality_name)
        return jsonify({
            "success": True,
            "locality": locality_name,
            "ndvi_gif": f"/static/outputs/{locality_name}_gifs/NDVI_spatial.gif",
            "ndwi_gif": f"/static/outputs/{locality_name}_gifs/NDWI_spatial.gif"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
