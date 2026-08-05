<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApplySecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        // The authenticated same-origin print page embeds documents.view in an
        // <iframe> (PDFs, text). Frame-blocking headers on that response would
        // blank the print output, so it is exempted; every other response —
        // including the print page itself — keeps DENY / frame-ancestors 'none'.
        // Cross-site embedding of documents.view is still prevented by the
        // session + documents.view policy + tenant scope (SameSite=Lax cookies
        // are not sent to cross-site subframes).
        $isFrameableView = $request->routeIs('documents.view');

        $csp = "base-uri 'self'; form-action 'self'".($isFrameableView ? '' : "; frame-ancestors 'none'");
        $response->headers->set('Content-Security-Policy', $csp);
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        if (! $isFrameableView) {
            $response->headers->set('X-Frame-Options', 'DENY');
        }

        if ($request->routeIs('login', 'login.store', 'logout')) {
            $response->headers->set('Cache-Control', 'no-store, private, max-age=0');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', '0');
        }

        if (app()->environment('production') && $request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}
