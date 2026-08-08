<?php

namespace App\Services\Projects;

use RuntimeException;

/**
 * Thrown when PDF generation is requested but no valid generated DOCX exists
 * yet. The fiche must be generated as DOCX first — PDF never proceeds blindly.
 */
class ProjectEfficiencySheetDocxMissingException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('Le document DOCX doit être généré avant de créer le PDF.');
    }
}
