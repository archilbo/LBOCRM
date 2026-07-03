@component('mail::message')
# You're invited to join {{ config('app.name') }}

Hi **{{ $user->name }}**,

You have been invited to join the **{{ config('app.name') }}** platform.

Click the button below to set your password and activate your account.

@component('mail::button', ['url' => $acceptUrl, 'color' => 'primary'])
Accept Invitation
@endcomponent

This link will expire once used. If you did not expect this invitation, you can safely ignore this email.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
