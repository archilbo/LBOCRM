@component('mail::message')
<div style="margin-bottom: 24px; color: #9a7b2f; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;">
    {{ config('app.name') }} · Sécurité du compte
</div>

# Réinitialisez votre mot de passe

Bonjour **{{ $user->name }}**,

Une demande de réinitialisation a été effectuée par un administrateur ARCHI LBO pour sécuriser l’accès à votre compte.

@component('mail::panel')
Utilisez le bouton ci-dessous pour choisir un nouveau mot de passe sécurisé. Cette action ne modifie rien tant que vous n’avez pas validé votre nouveau mot de passe.
@endcomponent

@component('mail::button', ['url' => $resetUrl, 'color' => 'primary'])
Définir un nouveau mot de passe
@endcomponent

Ce lien est personnel et expire conformément à la politique de sécurité de la plateforme.

Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail et contacter immédiatement votre administrateur.

À bientôt,<br>
{{ config('app.name') }}
@rendcomponent
