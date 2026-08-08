export const frDocumentsExplorer = {
    documentsExplorer: {
        title: 'Documents',

        locations: {
            all: 'Tous les documents',
            shared: 'Fichiers partagés du client',
            projects: 'Projets',
        },

        tabs: {
            projectFiles: 'Fichiers du projet',
            generated: 'Documents générés',
            generatedEmpty:
                'Les documents générés (contrat, fiche d’efficacité) apparaîtront ici après leur génération.',
        },

        search: {
            placeholder: 'Rechercher un fichier…',
            noResults: 'Aucun document ne correspond à votre recherche.',
        },

        filters: {
            type: 'Type',
            status: 'Statut',
            allTypes: 'Tous les types',
            allStatuses: 'Tous les statuts',
            clear: 'Effacer les filtres',
        },

        sort: {
            label: 'Trier',
            name: 'Nom',
            updatedAt: 'Dernière modification',
            uploadedAt: 'Date d’ajout',
            size: 'Taille',
            type: 'Type',
            status: 'Statut',
            ascending: 'Ordre croissant',
            descending: 'Ordre décroissant',
        },

        view: {
            grid: 'Vue en grille',
            list: 'Vue en liste',
        },

        thumbnail: {
            loading: 'Chargement de la miniature…',
            previewUnavailable: 'Aperçu non disponible',
        },

        metadata: {
            unknownSize: 'Taille inconnue',
            unknownDate: 'Date inconnue',
            sharedFile: 'Fichier partagé',
        },

        list: {
            ariaLabel: 'Documents en liste',
        },

        grid: {
            ariaLabel: 'Documents en grille',
        },

        fileTypes: {
            image: 'Image',
            pdf: 'PDF',
            docx: 'Document Word',
            markdown: 'Markdown',
            text: 'Texte',
            archive: 'Archive',
            spreadsheet: 'Tableur',
            other: 'Autre fichier',
            unsupported: 'Autre fichier',
        },

        actions: {
            open: 'Ouvrir',
            preview: 'Aperçu',
            download: 'Télécharger',
            print: 'Imprimer',
            printUnavailable: 'Impression non disponible pour les images',
            replace: 'Remplacer le fichier',
            updateStatus: 'Modifier le statut',
            details: 'Afficher les détails',
            delete: 'Supprimer',
            more: 'Plus d’actions',
            upload: 'Importer un document',
            openDocuments: 'Ouvrir dans Documents',
        },

        deleteModal: {
            title: 'Supprimer le document ?',
            body: 'Confirmez la suppression de {name} ?',
            cancel: 'Annuler',
            delete: 'Supprimer',
            success: 'Document supprimé.',
        },

        viewer: {
            title: 'Aperçu du document',
            previewUnavailable: 'Aperçu non disponible',
            previewFailed: 'Impossible d’afficher ce document.',
            retry: 'Réessayer',
            downloadOriginal: 'Télécharger le fichier',
            close: 'Fermer',
            previous: 'Document précédent',
            next: 'Document suivant',
            invalid: 'Ce document est introuvable ou inaccessible.',
            position: '{current} / {total}',
            details: 'Détails',
            hideDetails: 'Masquer les détails',
            zoomIn: 'Zoom avant',
            zoomOut: 'Zoom arrière',
            actualSize: 'Taille réelle',
            fitViewport: 'Ajuster à la fenêtre',
            fitWidth: 'Ajuster à la largeur',
            fitPage: 'Ajuster à la page',
            rotateLeft: 'Pivoter à gauche',
            rotateRight: 'Pivoter à droite',
            reset: 'Réinitialiser la vue',
            previousPage: 'Page précédente',
            nextPage: 'Page suivante',
            pageNumber: 'Numéro de page',
            loadingPdf: 'Chargement du PDF…',
            loadingImage: 'Chargement de l’image…',
            pdfPasswordRequired: 'Ce PDF est protégé par un mot de passe.',
            pdfLoadFailed: 'Impossible d’afficher ce PDF.',
            imageLoadFailed: 'Impossible d’afficher cette image.',
            text: {
                loading: 'Chargement du contenu…',
                search: 'Rechercher dans le document',
                noMatches: 'Aucun résultat',
                previousMatch: 'Résultat précédent',
                nextMatch: 'Résultat suivant',
                matchPosition: '{current} / {total}',
                wrapLines: 'Couper les lignes',
                doNotWrapLines: 'Ne pas couper les lignes',
                copy: 'Copier',
                copied: 'Copié',
                copyFailed: 'Échec de la copie',
                truncated: 'Aperçu tronqué — le fichier dépasse la limite d’affichage.',
                encodingError: 'Encodage non pris en charge.',
                unsupported: 'Ce type de contenu ne peut pas être affiché.',
                binary: 'Le contenu binaire ne peut pas être affiché.',
                loadFailed: 'Impossible de charger le contenu.',
                accessDenied: 'Accès au contenu refusé.',
                notFound: 'Le fichier est introuvable.',
            },
            metadata: {
                name: 'Nom',
                originalFilename: 'Nom du fichier',
                type: 'Type',
                size: 'Taille',
                documentNumber: 'Numéro de document',
                status: 'Statut',
                project: 'Projet',
                uploadedAt: 'Date d’ajout',
                updatedAt: 'Dernière modification',
                uploadedBy: 'Ajouté par',
                notes: 'Notes',
            },
        },

        empty: {
            title: 'Aucun document',
            description:
                'Ajoutez le premier document requis pour ce projet.',
        },

        sharedInformation: {
            title: 'Informations réutilisées du client',
            description:
                'Informations du client disponibles pour les projets.',
        },

        sharedFiles: {
            title: 'Fichiers partagés du client',
        },
    },
};
