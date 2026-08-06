<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Resolves the request locale (used for validation messages and other
 * server-rendered strings) from the client's Accept-Language header.
 *
 * When the header is absent, the configured application locale is kept —
 * getPreferredLanguage() is NOT a safe fallback: without a header it returns
 * an arbitrary supported language instead of null.
 */
class SetLocaleFromRequest
{
    /**
     * @var list<string> supported language codes (ISO 639-1)
     */
    private const SUPPORTED = ['fr', 'en'];

    public function handle(Request $request, Closure $next): Response
    {
        $header = $request->headers->get('accept-language');

        if (is_string($header) && $header !== '') {
            foreach ($request->getLanguages() as $language) {
                $code = strtolower((string) strtok($language, '-'));

                if (in_array($code, self::SUPPORTED, true)) {
                    app()->setLocale($code);

                    break;
                }
            }
        }

        return $next($request);
    }
}
