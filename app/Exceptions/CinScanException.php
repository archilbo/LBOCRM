<?php

namespace App\Exceptions;

use RuntimeException;

final class CinScanException extends RuntimeException
{
    public function __construct(
        public readonly string $errorCode,
        string $message,
        public readonly int $httpStatus = 422,
        ?\Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }

    public static function unreadableImage(string $side): self
    {
        return new self(
            'unreadable_image',
            "L\'image {$side} de la CNI n\'est pas suffisamment lisible.",
            422,
        );
    }

    public static function invalidDocument(): self
    {
        return new self(
            'invalid_document',
            'Les images ne semblent pas représenter une carte nationale d\'identité marocaine.',
            422,
        );
    }

    public static function configurationMissing(): self
    {
        return new self(
            'scanner_configuration_missing',
            'Le service de lecture de la CNI n\'est pas configuré.',
            503,
        );
    }

    public static function rateLimited(): self
    {
        return new self(
            'provider_rate_limited',
            'Le service de lecture est temporairement saturé. Réessayez dans un instant.',
            429,
        );
    }

    public static function providerTimeout(?\Throwable $previous = null): self
    {
        return new self(
            'provider_timeout',
            'Le service de lecture a dépassé le délai autorisé.',
            504,
            $previous,
        );
    }

    public static function providerUnavailable(?\Throwable $previous = null): self
    {
        return new self(
            'provider_unavailable',
            'Le service de lecture de la CNI est temporairement indisponible.',
            503,
            $previous,
        );
    }

    public static function invalidProviderResponse(): self
    {
        return new self(
            'provider_invalid_response',
            'Le service de lecture a renvoyé une réponse invalide.',
            502,
        );
    }
}
