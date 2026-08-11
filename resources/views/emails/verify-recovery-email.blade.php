@component('mail::message')
# Verify your backup email

Hi **{{ $user->name }}**,

Use this link to confirm this address as a backup email for your account. It expires in 24 hours.

@component('mail::button', ['url' => $verificationUrl, 'color' => 'primary'])
Verify backup email
@endcomponent

If you did not request this, you can safely ignore this email.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
