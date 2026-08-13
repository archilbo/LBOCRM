<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserPasswordReset extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user, public string $resetUrl)
    {
        $this->locale('fr');
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Réinitialisation de votre mot de passe '.config('app.name'));
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.user-password-reset');
    }
}
