<?php

namespace App\Services\Projects;

use RuntimeException;

/**
 * Thrown when a fiche efficacité cannot be generated because one or more
 * placeholder sources are empty. Carries the placeholder token codes so the
 * API layer can report exactly what is missing.
 */
class ProjectEfficiencySheetGenerationException extends RuntimeException
{
    /**
     * @param  list<string>  $missingCodes
     */
    public function __construct(private readonly array $missingCodes)
    {
        parent::__construct('Fiche efficacité: valeurs manquantes pour la génération.');
    }

    /**
     * @return list<string>
     */
    public function missingCodes(): array
    {
        return $this->missingCodes;
    }
}
