<?php

namespace App\Services\Projects;

use RuntimeException;

/**
 * Thrown when a stored generated-file path is missing, invalid, or unsafe
 * (traversal, absolute path, master-template location, outside project
 * storage). Stored paths come from the database and are never trusted
 * blindly: every download/preview/generation resolves through the guard.
 */
class ProjectEfficiencySheetFileException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('Le fichier généré est introuvable.');
    }
}
