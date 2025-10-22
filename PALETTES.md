# 🎨 Guide des Palettes de Couleurs - Earth Monitor

## 🌿 Palette NDVI (Normalized Difference Vegetation Index)

### Signification des couleurs
Le NDVI mesure la densité et la santé de la végétation avec des valeurs de 0 à 1.

| Valeur NDVI | Couleur | Code Hex | Signification |
|-------------|---------|----------|---------------|
| 0.0 | Brun foncé | `#8C543E` | Sol nu, roche |
| 0.1 | Brun moyen | `#A0703B` | Sol avec débris végétaux |
| 0.2 | Brun jaune | `#B8860B` | Végétation très clairsemée |
| 0.3 | Or terne | `#DAA520` | Début de végétation |
| 0.4 | Vert jaune | `#ADFF2F` | Végétation clairsemée |
| 0.5 | Vert olive | `#9ACD32` | Végétation modérée |
| 0.6 | Vert prairie | `#7CFC00` | Végétation établie |
| 0.7 | Vert citron | `#32CD32` | Végétation saine |
| 0.8 | Vert forêt | `#228B22` | Végétation dense |
| 1.0 | Vert vif | `#79E1B8` | Végétation très dense |

### Interprétation
- **< 0.2** : Zones non végétalisées (sol nu, eau, constructions)
- **0.2 - 0.4** : Végétation clairsemée (prairies, cultures jeunes)
- **0.4 - 0.6** : Végétation modérée (cultures développées, arbustes)
- **> 0.6** : Végétation dense (forêts, cultures matures)

---

## 💧 Palette NDWI (Normalized Difference Water Index)

### Signification des couleurs
Le NDWI détecte l'eau et l'humidité avec des valeurs de -1 à 1.

| Valeur NDWI | Couleur | Code Hex | Signification |
|-------------|---------|----------|---------------|
| -1.0 | Beige | `#D5C2B8` | Très sec (désert, sol aride) |
| -0.6 | Beige gris | `#C4B5A8` | Sec (sol sans humidité) |
| -0.2 | Gris beige | `#B3A898` | Peu d'humidité |
| 0.0 | Gris | `#A29B88` | Humidité modérée |
| 0.2 | Bleu clair | `#8BB8E8` | Sol humide |
| 0.4 | Bleu moyen | `#6FA8DC` | Très humide |
| 0.6 | Bleu | `#5398D0` | Zones humides |
| 0.8 | Bleu foncé | `#3788C4` | Présence d'eau |
| 1.0 | Bleu profond | `#1E5F8C` | Eau libre (rivières, lacs) |

### Interprétation
- **< -0.5** : Zones très sèches (sols arides, zones urbaines)
- **-0.5 - 0.0** : Sols secs à modérément humides
- **0.0 - 0.3** : Sols humides, végétation avec stress hydrique
- **> 0.3** : Présence d'eau libre ou sols saturés

---

## 🎯 Cohérence Visuelle

### Application des palettes
1. **Scripts Python** : Les palettes sont définies dans `generate_gifs.py`
2. **Légendes CSS** : Dégradés correspondants dans `landing.css` et `results.css`
3. **Interface** : Labels explicatifs dans les templates HTML

### Avantages
- ✅ **Scientifiquement cohérent** : Couleurs standard en télédétection
- ✅ **Visuellement intuitif** : Brun→Vert (végétation), Beige→Bleu (eau)
- ✅ **Accessible** : Contrastes suffisants pour daltoniens
- ✅ **Professionnel** : Respecte les conventions académiques

---

## 🔧 Utilisation Technique

### Dans le code Python
```python
# NDVI
'palette': [
    '8C543E', 'A0703B', 'B8860B', 'DAA520', 'ADFF2F',
    '9ACD32', '7CFC00', '32CD32', '228B22', '79E1B8'
]

# NDWI  
'palette': [
    'D5C2B8', 'C4B5A8', 'B3A898', 'A29B88', '8BB8E8',
    '6FA8DC', '5398D0', '3788C4', '1E5F8C'
]
```

### Dans le CSS
```css
.ndvi-gradient {
    background: linear-gradient(to right, 
        #8C543E 0%, #A0703B 10%, /* ... */
    );
}
```

Cette harmonisation garantit que les utilisateurs voient des couleurs cohérentes entre les cartes générées et les légendes de l'interface ! 🎨✨