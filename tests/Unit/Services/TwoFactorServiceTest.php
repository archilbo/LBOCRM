<?php

namespace Tests\Unit\Services;

use App\Services\Security\TwoFactorService;
use Tests\TestCase;

class TwoFactorServiceTest extends TestCase
{
    public function test_generates_the_rfc_totp_value_for_a_known_secret(): void
    {
        $service = new TwoFactorService();

        $this->assertSame('287082', $service->codeForCounter('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ', 1));
    }
}
