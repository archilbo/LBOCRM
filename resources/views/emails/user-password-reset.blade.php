@component('mail::message')
# Reset your password

Hi **{{ $user->name }}**,

An ARCHI LBO administrator requested a password reset for your account.

@component('mail::button', ['url' => $resetUrl, 'color' => 'primary'])
Set a new password
@endcomponent

This link expires according to the platform security policy. If you did not expect this request, contact your administrator immediately.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
