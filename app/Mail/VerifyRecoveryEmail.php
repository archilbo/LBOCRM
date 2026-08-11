<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerifyRecoveryEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user, public string $verificationUrl) {}

    public function envelope(): Envelope { return new Envelope(subject: 'Verify your backup email for '.config('app.name')); }
    public function content(): Content { return new Content(markdown: 'emails.verify-recovery-email'); }
}
