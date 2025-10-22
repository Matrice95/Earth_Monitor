# 🛰️ **Earth Monitor - Surveillance Environnementale par Satellite**

Application web professionnelle pour l'analyse des indices de végétation (NDVI) et d'humidité (NDWI) en Côte d'Ivoire utilisant les données Sentinel-2 et Google Earth Engine.

## ✨ **Fonctionnalités**

- 🌍 **Interface Double** : Page d'accueil professionnelle + page de résultats détaillée
- 📊 **Tableaux de Bord KPI** : Métriques en temps réel avec animations
- 🎨 **Palette Earth Monitor** : Couleurs cohérentes et professionnelles  
- 🗺️ **Visualisations Satellitaires** : GIFs animés avec masquage géographique
- 📱 **Design Responsive** : Compatible mobile et desktop
- 🔍 **Localités Multiples** : Support de toutes les régions de Côte d'Ivoire

## 🚀 **Installation**

### Prérequis
- Python 3.8+
- Compte Google Earth Engine avec projet configuré
- Clés d'authentification GEE

### Configuration
```bash
# Cloner le projet
git clone <url-du-repo>
cd app

# Créer l'environnement virtuel
python -m venv .venv
source .venv/bin/activate  # Linux/Mac

# Installer les dépendances
pip install -r requirements.txt

# Configurer Google Earth Engine
python scripts/configure_gee.py
```

### Lancement
```bash
python app.py
```
L'application sera accessible sur `http://localhost:5000`

## 📁 **Structure du Projet**

```
app/
├── app.py                      # Application Flask principale
├── config.py                   # Configuration et paramètres
├── data/
│   └── cote_divoire_localities.json    # Données géographiques
├── scripts/
│   ├── generate_gifs.py        # Génération des visualisations
│   └── configure_gee.py        # Configuration Google Earth Engine
├── static/
│   ├── css/                    # Styles CSS
│   ├── js/                     # Scripts JavaScript
│   ├── images/                 # Assets graphiques
│   └── outputs/                # GIFs et cartes générés
└── templates/
    ├── landing.html            # Page d'accueil
    └── results.html            # Page de résultats
```

## 🎨 **Palette de Couleurs Earth Monitor**

### Couleurs Principales
- **Primary**: `#2E8B57` (Sea Green)
- **Secondary**: `#4682B4` (Steel Blue)  
- **Accent**: `#228B22` (Forest Green)
- **Warning**: `#FF8C00` (Dark Orange)
- **Success**: `#32CD32` (Lime Green)

### Palettes NDVI/NDWI
- **Sol nu très sec**: `#8B4513` (Marron)
- **Végétation clairsemée**: `#FFFF99` (Jaune)
- **Végétation dense**: `#009900` (Vert foncé)
- **Eau libre**: `#0066CC` (Bleu foncé)

## 📊 **Indices Analysés**

### NDVI (Normalized Difference Vegetation Index)
- **Gamme**: -0.2 à 1.0
- **Usage**: Évaluation de la santé végétale
- **Interprétation**:
  - < 0.1 : Sol nu, zones urbaines
  - 0.1-0.3 : Végétation clairsemée
  - 0.3-0.6 : Végétation modérée
  - > 0.6 : Végétation dense et saine

### NDWI (Normalized Difference Water Index)  
- **Gamme**: -1.0 à 1.0
- **Usage**: Détection de l'humidité et des plans d'eau
- **Interprétation**:
  - < 0 : Zones sèches, végétation
  - 0-0.3 : Humidité modérée
  - 0.3-0.8 : Zones humides
  - > 0.8 : Eau libre

## 🛠️ **Technologies Utilisées**

- **Backend**: Flask, Python
- **Satellite**: Google Earth Engine, Sentinel-2
- **Frontend**: Bootstrap 5, JavaScript ES6
- **Visualisation**: Custom CSS animations, GIF generation
- **Cartographie**: GeoJSON, Masquage SVG

## 📖 **Documentation Technique**

- [`ARCHITECTURE.md`](ARCHITECTURE.md) - Architecture détaillée du système
- [`PALETTES.md`](PALETTES.md) - Guide des palettes de couleurs
- [`README_UI.md`](README_UI.md) - Interface utilisateur et expérience

## 🤝 **Contribution**

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push sur la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📝 **Changelog**

### Version 2.0.0 (Octobre 2025)
- ✅ Interface double professionnelle
- ✅ Palette Earth Monitor cohérente
- ✅ Élimination des zones blanches sur les cartes
- ✅ Tableaux de bord KPI animés
- ✅ Design responsive optimisé

### Version 1.0.0 (Mars 2025)
- 🚀 Version initiale avec interface unique
- 🛰️ Intégration Google Earth Engine
- 📊 Génération GIFs NDVI/NDWI

## 📄 **Licence**

Ce projet est sous licence MIT. Voir le fichier [`LICENSE`](LICENSE) pour plus de détails.

## 🆘 **Support**

Pour toute question ou problème, veuillez ouvrir une issue sur le repository GitHub.

---

**Earth Monitor** - *Surveillance environnementale intelligente par satellite* 🌍🛰️
