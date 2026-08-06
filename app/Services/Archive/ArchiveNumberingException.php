<?php

namespace App\Services\Archive;

use RuntimeException;

/**
 * Thrown when an archive number cannot be generated for a dossier
 * (missing company scope or missing/blank city code).
 */
class ArchiveNumberingException extends RuntimeException
{
}
