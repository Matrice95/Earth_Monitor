import ee
import imageio.v3 as imageio
import os
import requests
import json
from datetime import datetime
import time
import logging
from io import BytesIO
from flask import current_app

def process_locality(locality_name):
    """
    Traite la localité spécifiée pour générer des GIFs NDVI et NDWI
    """
    # Configuration du logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    # Paramètres
    GEOJSON_PATH = current_app.config['GEOJSON_PATH']
    OUTPUT_DIR = os.path.join(current_app.config['OUTPUT_DIR'], f"{locality_name}_gifs")
    MAX_CLOUD_COVER = 20
    SCALE = 30
    NDVI_THRESHOLD = 0.25
    NDWI_THRESHOLD = 0.1
    TIMEOUT = 45  # Secondes pour le téléchargement
    
    # Création des dossiers
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Chargement GeoJSON
    try:
        with open(GEOJSON_PATH, "r") as f:
            geojson_data = json.load(f)
        logging.info("GeoJSON chargé avec succès")
    except Exception as e:
        logging.error(f"Erreur GeoJSON: {e}")
        raise
    
    # Récupération géométrie
    def get_roi():
        for feature in geojson_data["features"]:
            if feature["properties"]["NAME_3"] == locality_name:
                coords = feature["geometry"]["coordinates"]
                return ee.Geometry.Polygon(coords)
        raise ValueError(f"Localité {locality_name} introuvable")
    
    try:
        roi = get_roi()
        logging.info(f"Zone d'étude chargée : {roi.getInfo()}")
    except Exception as e:
        logging.error(f"Erreur géométrie: {e}")
        raise
    
    # Période d'étude
    start_date = datetime(2025, 1, 1)
    end_date = datetime(2025, 3, 10)
    logging.info(f"Période analysée: {start_date.date()} to {end_date.date()}")
    
    # Chargement données Sentinel-2
    try:
        sentinel2 = (
            ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
            .filterDate(start_date, end_date)
            .filterBounds(roi)
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', MAX_CLOUD_COVER))
        )
        logging.info(f"Nombre d'images initiales: {sentinel2.size().getInfo()}")
    except Exception as e:
        logging.error(f"Erreur chargement Sentinel: {e}")
        raise
    
    # Calcul indices
    def add_indices(image):
        ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
        ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI')
        return image.addBands([ndvi, ndwi])
    
    sentinel2 = sentinel2.map(add_indices)
    
    # Création des composites mensuels
    def create_monthly_composites(collection, index_name):
        composites = []
        
        for year in range(start_date.year, end_date.year + 1):
            for month in range(1, 13):
                monthly_col = collection.filter(
                    ee.Filter.calendarRange(year, year, 'year')
                    .And(ee.Filter.calendarRange(month, month, 'month'))
                )
                
                count = monthly_col.size()
                monthly_mean = ee.Image(
                    ee.Algorithms.If(
                        count.gt(0),
                        monthly_col.mean().rename(index_name),
                        ee.Image.constant(-1).rename(index_name)  # Valeur nodata
                    )
                )
                
                composite = monthly_mean.set({
                    'year': year,
                    'month': month,
                    'data_available': count.gt(0)
                })
                
                composites.append(composite)
        
        return ee.ImageCollection(composites)
    
    # Génération GIF spatial
    def create_spatial_gif(collection, index_name, threshold, color):
        try:
            collection = collection.sort('month')
            images = []
            vis_params = {
                'min': 0,
                'max': 1,
                'palette': ['000000', color[1:]],
                'region': roi,
                'dimensions': 1024,
                'format': 'png'
            }
            
            for i in range(collection.size().getInfo()):
                img = ee.Image(collection.toList(collection.size()).get(i))
                
                # Vérification des données
                has_data = img.get('data_available').getInfo()
                if not has_data:
                    logging.warning(f"Pas de données pour {index_name} - {img.get('month').getInfo()}/{img.get('year').getInfo()}")
                    continue
                    
                # Vérification des bandes
                band_name = img.bandNames().getInfo()
                if index_name not in band_name:
                    logging.error(f"Bande manquante dans l'image {i+1}: {band_name}")
                    continue
                    
                # Traitement de l'image
                masked = img.select([index_name]).gte(threshold).selfMask()
                url = masked.getThumbURL(vis_params)
                
                # Téléchargement
                try:
                    response = requests.get(url, timeout=TIMEOUT)
                    response.raise_for_status()
                    images.append(imageio.imread(BytesIO(response.content)))
                    logging.info(f"Image {i+1}/{collection.size().getInfo()} téléchargée")
                except Exception as e:
                    logging.error(f"Échec téléchargement image {i+1}: {e}")
                    continue
            
            # Génération GIF
            if images:
                output_path = os.path.join(OUTPUT_DIR, f'{index_name}_spatial.gif')
                imageio.imwrite(
                    output_path,
                    images,
                    duration=800,
                    loop=0
                )
                logging.info(f"GIF {index_name} généré avec {len(images)} images")
                return output_path
            else:
                logging.error(f"Aucune image valide pour {index_name}")
                raise ValueError(f"Aucune image valide pour {index_name}")

        except Exception as e:
            logging.error(f"Erreur critique dans create_spatial_gif: {str(e)[:200]}")
            raise
    
    # Exécution principale
    try:
        logging.info("Début traitement NDVI...")
        ndvi_monthly = create_monthly_composites(sentinel2.select('NDVI'), 'NDVI')
        ndvi_path = create_spatial_gif(ndvi_monthly, 'NDVI', NDVI_THRESHOLD, '#00FF00')
        
        logging.info("Début traitement NDWI...")
        ndwi_monthly = create_monthly_composites(sentinel2.select('NDWI'), 'NDWI')
        ndwi_path = create_spatial_gif(ndwi_monthly, 'NDWI', NDWI_THRESHOLD, '#0000FF')
        
        return OUTPUT_DIR
    except Exception as e:
        logging.error(f"Erreur principale: {e}")
        raise
