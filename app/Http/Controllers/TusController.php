<?php

namespace App\Http\Controllers;

use App\Services\Tus\TusServer;
use Illuminate\Http\Request;

class TusController extends Controller
{
    public function __construct(
        private readonly TusServer $tus,
    ) {}

    public function options(): \Symfony\Component\HttpFoundation\Response
    {
        return $this->tus->capabilities();
    }

    public function post(Request $request): \Symfony\Component\HttpFoundation\Response
    {
        if ($request->isMethod('OPTIONS')) {
            return $this->tus->capabilities();
        }
        return $this->tus->create($request);
    }

    public function head(Request $request, string $upload): \Symfony\Component\HttpFoundation\Response
    {
        if ($request->isMethod('OPTIONS')) {
            return $this->tus->capabilities();
        }
        return $this->tus->head($upload);
    }

    public function patch(Request $request, string $upload): \Symfony\Component\HttpFoundation\Response
    {
        return $this->tus->patch($request, $upload);
    }

    public function delete(string $upload): \Symfony\Component\HttpFoundation\Response
    {
        return $this->tus->delete($upload);
    }
}
