# Fiche efficacité — Mapping des données

> Étape 1 de la fonctionnalité « Fiche efficacité ». Document de référence pour la
> génération future de la fiche : inventaire du modèle, mécanique de remplacement,
> correspondance champ → source de données, et champs Entreprise ajoutés.

## 1. Inventaire du modèle de fiche

| Élément | Valeur |
| --- | --- |
| Fichier source | `storage/app/private/archi-templates/fiche_efficacite/fiche_efficacite.docx` |
| Format | DOCX (Office Open XML) — généré à l'origine par **BINAYATE Prescriptive v2018.3** (logiciel AMEE), export daté 06/01/2025 |
| Contenu | Fiche RTCM « II — Approche prescriptive » avec exemple complet : parois (dallage, plancher hourdis, mur, PH, fenêtres), TGBV, zone climatique, valeurs U et R |
| Placeholders | **Aucun.** Le modèle contient des **données d'exemple figées** (client et entreprise réels d'un projet de démonstration), pas de tokens `[KEY]` |

### Structure du document

1. **Identification du projet** — usage du bâtiment, intitulé, adresse, maître d'ouvrage (nom, adresse, téléphone, fax, e-mail)
2. **Identification du signataire** — nom & prénom, adresse, téléphone, fax, e-mail (données de l'entreprise d'architecture)
3. **Performances thermiques du bâtiment** — tableau des parois (valeur projet vs valeur max RTCM) et calculs
4. **II — Approche prescriptive** — zone climatique, TGBV, facteur solaire, « Signature et cachet »
5. **Pied de page** — mention AMEE + générateur « BINAYATE Prescriptive v2018.3 »

> ⚠️ Contrainte : ce modèle ne doit **pas** être modifié (mécanique de copie identique
> aux contrats). La conversion en modèle à placeholders est une étape ultérieure.

## 2. Mécanique de remplacement des placeholders (réutilisable)

Le générateur de contrats (`app/Services/ContractDocumentGenerator.php`) fournit le
pattern à répliquer pour la fiche :

1. **Copie** du modèle source → fichier généré (`File::copy`), jamais d'édition du source.
2. **`PhpOffice\PhpWord\TemplateProcessor`** avec délimiteurs personnalisés `[` / `]`
   (`setMacroOpeningChars` / `setMacroClosingChars`) — étape tentée en `try/catch`.
3. **`replaceSquarePlaceholdersInDocx()`** — fallback XML brut via `ZipArchive` + `DOMDocument` :
   - remplace `[KEY]` dans tous les `word/*.xml` ;
   - **gère les placeholders coupés entre plusieurs `<w:t>`** (fusion des nœuds texte d'un paragraphe avant remplacement) ;
   - conserve le fichier généré intact à 100 % en dehors des remplacements.
4. **`UnicodeText::forDocument()`** — normalisation typographique (apostrophes/guillemets droits).
5. **`ContractPdfGenerator`** (DomPDF) — conversion PDF via vue `pdfs.contract`.

## 3. Données figées du modèle vs sources de données

Aucun placeholder n'existe aujourd'hui : les valeurs ci-dessous sont **codées en dur**
dans `fiche_efficacite.docx`. Le mapping indique la source qui alimenterait chaque champ
lors de la conversion en modèle dynamique.

### 3.1. Identification du signataire → Paramètres Entreprise

Correspond au bloc « Identification du signataire » de la fiche.

| Champ fiche (valeur figée dans le modèle) | Token proposé (étape future) | Source de données | Statut |
| --- | --- | --- | --- |
| Nom & prénom (`OMAR LAABISSI`) | `[ENTREPRISE_CEO]` | Paramètres → Entreprise → **Représentant légal** (`company_legal_representative`) | ✅ **Champ ajouté (étape 1)** |
| Adresse (`Immeuble nr 959 lotissement AL MASSAR Marrakech`) | `[ENTREPRISE_ADRESSE]` | `company_address` | Existant |
| Téléphone (`0600640858`) | `[ENTREPRISE_TELEPHONE]` | `company_phone` | Existant |
| Fax (`0526035012`) | `[ENTREPRISE_FAX]` | **`company_fax`** | ✅ **Champ ajouté (étape 1)** |
| E-mail (`archilboalmassar@gmail.com`) | `[ENTREPRISE_EMAIL]` | `company_email` | Existant |

### 3.2. Identification du projet → Client + Dossier

| Champ fiche | Token proposé (étape future) | Source de données | Statut |
| --- | --- | --- | --- |
| Usage du bâtiment (`Résidentiel`) | `[USAGE_DU_BATIMENT]` | **Manuel — jamais auto-rempli** | 📝 Saisie manuelle |
| Intitulé (`CONSTRUCTION D'UN LOGEMENT RURALE EN RDC`) | `[PROJET_INTITULE]` | `dossiers.project_object` | Existant |
| Adresse (`DR OULED SAID OU MOUSSAN`) | `[PROJET_ADRESSE]` | `dossiers.project_address` | Existant |
| Nom & prénom du maître d'ouvrage (`Mr. ZINE ELABIDINE ZOUHAIR`) | `[NOM_PRENOM_DOUVRAGE]` | **Manuel — jamais auto-rempli** | 📝 Saisie manuelle |
| Adresse (client) (`LOT BARAKA N0 62 AMERCHICH MARRAKECH`) | `[CLIENT_ADRESSE]` | `clients.address` | Existant |
| Téléphone (client) (`0600640858`) | `[CLIENT_TELEPHONE]` | `clients.phone` | Existant |
| Fax (client) | `[CLIENT_FAX]` | `clients.fax` | À vérifier (colonne client) |
| E-mail (client) (`OLAABISSI@GMAIL.COM`) | `[CLIENT_EMAIL]` | `clients.email` | Existant |

### 3.3. Données techniques (RTCM)

| Champ fiche | Token proposé (étape future) | Source |
| --- | --- | --- |
| Zone climatique (ZT1…ZT6, exemple ZT5) | `[ZONE_CLIMATIQUE]` | Manuel (donnée RTCM) |
| TGBV (exemple 32.8 %) | `[TGBV]` | Manuel (étude thermique) |
| Parois — composition, valeur U/R projet vs max | `[PAROIS_*]` (table) | Manuel (étude thermique) |
| Facteur solaire baies vitrées | `[FS_BAIES_VITREES]` | Manuel (étude thermique) |

## 4. Architecture de stockage (à créer aux étapes suivantes)

| Élément | Emplacement prévu |
| --- | --- |
| Modèle | `storage/app/private/archi-templates/fiche_efficacite/fiche_efficacite.docx` (existant) |
| Config | clé `fiche_efficacite` dans `config/archilbo_templates.php` (à ajouter, calqué sur `contracts`) |
| Générateur DOCX | `app/Services/FicheEfficaciteDocumentGenerator.php` (à créer, calqué sur `ContractDocumentGenerator`) |
| Convertisseur PDF | réutilise le pattern `ContractPdfGenerator` (vue dédiée ou conversion directe) |
| Documents générés | chemin par dossier via `DossierPathBuilder` (pattern `contractDocxPath`) |
| Versionnage | historique par dossier via `audit_logs` (pattern existant des contrats) |

## 5. Étape 1 — Champs Entreprise ajoutés

### Backend

- **Stockage** : `company_settings` est une table **clé/valeur** (`group`, `key`, `value`,
  `type`, `label`, `description`, `is_public`, `updated_by`, `timestamps`). Aucune
  **migration de schéma** n'est nécessaire : les deux nouvelles clés sont des **lignes**
  créées au premier enregistrement via `CompanySetting::setValue()` (contrainte
  `unique(group, key)`).
  - `company_fax` — type `string`, nullable
  - `company_legal_representative` — type `string`, nullable
- **Points d'entrée/sortie** :
  - `app/Http/Requests/Finance/UpdateFinanceSettingsRequest.php` — règles `company.company_fax`
    (regex téléphone, max 25) et `company.company_legal_representative` (max 255), nullable ;
  - `app/Http/Controllers/Finance/FinanceSettingsController.php::update()` — persistance
    des deux clés avec les autres `company_*` ;
  - `app/Services/Finance/FinanceSettingsService.php` — getters `getCompanyFax()` /
    `getCompanyLegalRepresentative()`, exposés dans `companyInfo()` sous les clés
    `companyFax` / `companyLegalRepresentative` (consommées par Paramètres, devis/factures
    et futures générations de documents) ; alias `normalizeKey()` : `fax`, `representative`,
    `legal_representative`, `ceo`.

### Frontend

- `resources/js/features/finance/components/FinanceSettingsForm.tsx` — section
  « Informations de l'entreprise » : champs **Représentant légal** (à côté de la raison
  sociale) et **Fax** (à côté du téléphone), validation client (même regex que téléphone),
  assainissement de saisie (chiffres/espaces/`+()-.`, 25 caractères max), envoi via le
  payload `company.company_fax` / `company.company_legal_representative` (autosave existant).

### Tests

- `tests/Feature/Settings/FinanceSettingsTest.php` — persistance, nullabilité, rejet des
  valeurs invalides, champs inconnus ignorés, exposition via le service.

## 6. Périmètre des étapes suivantes (hors étape 1)

1. Table `efficiency_sheets` + modèle + relation Dossier ;
2. Tiroir « Fiche efficacité » (création/édition) ;
3. Conversion du modèle DOCX en placeholders (les données figées deviennent `[TOKENS]`) ;
4. Générateur DOCX/PDF (pattern contrats) + stockage versionné par dossier ;
5. Permissions et intégration au workflow (config `workflow_document_templates.fiche_energetique`).
