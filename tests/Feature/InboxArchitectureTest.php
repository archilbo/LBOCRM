<?php

namespace Tests\Feature;

use App\Events\Chat\MessageCreated;
use App\Events\Chat\MessagesRead;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use App\Services\Chat\ChatService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Event;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class InboxArchitectureTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;
    private User $member;

    protected function setUp(): void
    {
        parent::setUp();
        $company = Company::query()->firstOrFail();
        $branch = Branch::query()->where('company_id', $company->id)->firstOrFail();
        Role::findOrCreate('admin', 'web');
        $this->owner = User::factory()->create(['company_id' => $company->id, 'branch_id' => $branch->id]);
        $this->member = User::factory()->create(['company_id' => $company->id, 'branch_id' => $branch->id]);
        $this->owner->assignRole('admin');
        app(\Spatie\Permission\Models\Permission::class)::findOrCreate('view inbox', 'web');
        $this->member->givePermissionTo('view inbox');
    }

    public function test_direct_conversation_is_reused(): void
    {
        $service = app(ChatService::class);
        $first = $service->findOrCreateDirectConversation($this->owner, $this->member);
        $second = $service->findOrCreateDirectConversation($this->member, $this->owner);

        $this->assertTrue($first->is($second));
        $this->assertDatabaseCount('conversations', 1);
    }

    public function test_inbox_listing_is_tenant_scoped(): void
    {
        $visible = $this->conversation();
        $otherCompany = Company::create(['name' => 'Other', 'slug' => 'other', 'is_active' => true]);
        $outsider = User::factory()->create(['company_id' => $otherCompany->id, 'branch_id' => null]);
        $hidden = Conversation::create(['company_id' => $otherCompany->id, 'type' => 'direct']);
        $hidden->participants()->create(['user_id' => $outsider->id, 'role' => 'owner']);
        $hidden->participants()->create(['user_id' => $this->owner->id, 'role' => 'member']);

        $response = $this->actingAs($this->owner)->getJson('/inbox/conversations/list');

        $response->assertOk()->assertJsonPath('paginator.total', 1);
        $this->assertSame($visible->id, $response->json('conversations.0.id'));
    }

    public function test_messages_use_private_storage_and_authorized_downloads(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();

        $response = $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'Document joint',
            'files' => [UploadedFile::fake()->create('plan.pdf', 120, 'application/pdf')],
        ]);

        $response->assertOk();
        $attachment = $conversation->messages()->firstOrFail()->attachments()->firstOrFail();
        $this->assertSame('local', $attachment->disk);
        Storage::disk('local')->assertExists($attachment->storage_path);
        $this->actingAs($this->member)->get(route('inbox.attachments.download', $attachment))->assertOk();
    }

    public function test_member_cannot_manage_group_but_owner_can(): void
    {
        $conversation = $this->conversation('group');

        $this->actingAs($this->member)->putJson('/inbox/'.$conversation->id, ['subject' => 'Blocked'])->assertForbidden();
        $this->actingAs($this->owner)->putJson('/inbox/'.$conversation->id, ['subject' => 'Architecture'])->assertOk();
        $this->assertDatabaseHas('conversations', ['id' => $conversation->id, 'subject' => 'Architecture']);
    }

    public function test_delete_and_bulk_read_tracking_work(): void
    {
        Event::fake([MessagesRead::class]);
        $conversation = $this->conversation();
        $message = Message::create(['conversation_id' => $conversation->id, 'user_id' => $this->member->id, 'body' => 'Bonjour']);

        $this->actingAs($this->owner)->getJson('/inbox/'.$conversation->id)->assertOk();
        $this->assertDatabaseHas('message_reads', ['message_id' => $message->id, 'user_id' => $this->owner->id]);
        Event::assertDispatched(MessagesRead::class, fn (MessagesRead $event) => $event->conversation->is($conversation)
            && $event->user->is($this->owner)
            && $event->lastReadMessageId === $message->id);

        $ownMessage = Message::create(['conversation_id' => $conversation->id, 'user_id' => $this->owner->id, 'body' => 'À supprimer']);
        $this->actingAs($this->owner)->deleteJson('/inbox/'.$conversation->id.'/messages/'.$ownMessage->id)->assertOk();
        $this->assertSoftDeleted('messages', ['id' => $ownMessage->id]);
    }

    public function test_send_message_with_multiple_files(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();
        $files = [
            UploadedFile::fake()->image('photo.jpg'),
            UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf'),
        ];

        $response = $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'Avec fichiers',
            'files' => $files,
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['id', 'clientMessageId', 'attachments']);
        $this->assertCount(2, $response->json('attachments'));
        $messageId = $response->json('id');

        $attachments = MessageAttachment::where('message_id', $messageId)->get();
        $this->assertCount(2, $attachments);
        foreach ($attachments as $attachment) {
            $this->assertSame('local', $attachment->disk);
            Storage::disk('local')->assertExists($attachment->storage_path);
            $this->assertStringStartsWith('archilbo/', $attachment->storage_path);
            $this->assertStringContainsString('/chat/conversation-'.$conversation->id.'/message-'.$messageId, $attachment->storage_path);
        }
    }

    public function test_send_message_with_files_only_no_body(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();

        $response = $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'files' => [UploadedFile::fake()->image('only.jpg')],
        ]);

        $response->assertOk();
        $this->assertNull($response->json('body'));
        $this->assertCount(1, $response->json('attachments'));
    }

    public function test_send_message_with_body_only_no_files(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();

        $response = $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'Message texte seul',
        ]);

        $response->assertOk();
        $this->assertSame('Message texte seul', $response->json('body'));
        $this->assertCount(0, $response->json('attachments'));
    }

    public function test_empty_body_and_no_files_fails_validation(): void
    {
        $conversation = $this->conversation();

        $response = $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', ['body' => '']);

        $response->assertSessionHasErrors('body');
    }

    public function test_rejects_invalid_file_type(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();

        $response = $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'Mauvais type',
            'files' => [UploadedFile::fake()->create('script.exe', 100, 'application/x-msdownload')],
        ]);

        $response->assertSessionHasErrors('files.0');
    }

    public function test_rejects_oversized_file(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();
        $maxKb = config('chat.max_attachment_kilobytes', 15360);

        $response = $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'Trop gros',
            'files' => [UploadedFile::fake()->create('big.pdf', $maxKb + 1, 'application/pdf')],
        ]);

        $response->assertSessionHasErrors('files.0');
    }

    public function test_rejects_too_many_files(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();
        $max = config('chat.max_attachments', 10);
        $files = [];
        for ($i = 0; $i < $max + 1; $i++) {
            $files[] = UploadedFile::fake()->image('img-'.$i.'.jpg');
        }

        $response = $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'Trop de fichiers',
            'files' => $files,
        ]);

        $response->assertSessionHasErrors('files');
    }

    public function test_csv_and_zip_files_are_accepted(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();
        $files = [
            UploadedFile::fake()->create('data.csv', 50, 'text/csv'),
            UploadedFile::fake()->create('archive.zip', 200, 'application/zip'),
        ];

        $response = $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'CSV + ZIP acceptés',
            'files' => $files,
        ]);

        $response->assertOk();
        $this->assertCount(2, $response->json('attachments'));
    }

    public function test_images_field_is_accepted(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();

        $response = $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'Via champ images',
            'images' => [UploadedFile::fake()->image('snap.png')],
        ]);

        $response->assertOk();
        $this->assertCount(1, $response->json('attachments'));
    }

    public function test_attachment_thumbnail_url_only_for_images(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();
        $files = [
            UploadedFile::fake()->image('img.png'),
            UploadedFile::fake()->create('doc.pdf', 80, 'application/pdf'),
        ];

        $response = $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'test',
            'files' => $files,
        ]);

        $response->assertOk();
        $atts = $response->json('attachments');
        $this->assertCount(2, $atts);
        $img = collect($atts)->firstWhere('originalFilename', 'img.png');
        $doc = collect($atts)->firstWhere('originalFilename', 'doc.pdf');
        $this->assertNotNull($img['thumbnailUrl']);
        $this->assertNull($doc['thumbnailUrl']);
    }

    public function test_image_attachments_get_thumbnail_url(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();

        $response = $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'Image test',
            'files' => [UploadedFile::fake()->image('photo.jpg')],
        ]);

        $response->assertOk();
        $attachment = $response->json('attachments.0');
        $this->assertNotNull($attachment['url']);
        $this->assertNotNull($attachment['thumbnailUrl']);
        $this->assertNotNull($attachment['downloadUrl']);
        $this->assertStringStartsWith('/inbox/attachments/', $attachment['url']);
        $this->assertStringStartsWith('/inbox/attachments/', $attachment['downloadUrl']);
        $this->actingAs($this->owner)
            ->get($attachment['url'])
            ->assertOk()
            ->assertHeader('content-type', 'image/jpeg');
    }

    public function test_send_message_updates_last_message_at(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();

        $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'Met à jour le timestamp',
        ]);

        $this->assertNotNull($conversation->fresh()->last_message_at);
    }

    public function test_non_participant_cannot_send_message(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();
        $outsider = User::factory()->create([
            'company_id' => $this->owner->company_id,
            'branch_id' => $this->owner->branch_id,
        ]);

        $response = $this->actingAs($outsider)->postJson('/inbox/'.$conversation->id.'/messages', [
            'body' => 'Non autorisé',
        ]);

        $response->assertForbidden();
    }

    public function test_non_participant_cannot_download_attachment(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();
        $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'test',
            'files' => [UploadedFile::fake()->image('secret.jpg')],
        ]);
        $attachment = MessageAttachment::firstOrFail();

        $outsider = User::factory()->create([
            'company_id' => $this->owner->company_id,
            'branch_id' => $this->owner->branch_id,
        ]);

        $this->actingAs($outsider)->get(route('inbox.attachments.download', $attachment))->assertForbidden();
        $this->actingAs($outsider)->get(route('inbox.attachments.view', $attachment))->assertForbidden();
    }

    public function test_view_only_member_cannot_forward_or_publish_typing_state(): void
    {
        $conversation = $this->conversation();
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $this->owner->id,
            'body' => 'Message protege',
        ]);

        $this->actingAs($this->member)
            ->postJson("/inbox/{$conversation->id}/messages/{$message->id}/forward", ['conversation_ids' => [$conversation->id]])
            ->assertForbidden();

        $this->actingAs($this->member)
            ->postJson("/inbox/{$conversation->id}/typing")
            ->assertForbidden();
    }

    public function test_send_message_with_reply_to_and_files(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();
        $original = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $this->member->id,
            'body' => 'Message original',
        ]);

        $response = $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'En réponse',
            'files' => [UploadedFile::fake()->image('reply.jpg')],
            'reply_to_message_id' => $original->id,
        ]);

        $response->assertOk();
        $this->assertSame($original->id, $response->json('replyTo.id'));
        $this->assertCount(1, $response->json('attachments'));
    }

    public function test_reply_to_message_from_different_conversation_is_rejected(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();
        $other = $this->conversation();
        $otherMsg = Message::create([
            'conversation_id' => $other->id,
            'user_id' => $this->owner->id,
            'body' => 'Autre conversation',
        ]);

        $response = $this->actingAs($this->owner)->postJson('/inbox/'.$conversation->id.'/messages', [
            'body' => 'Réponse invalide',
            'reply_to_message_id' => $otherMsg->id,
        ]);

        $response->assertStatus(422);
    }

    public function test_client_message_id_returns_existing_message(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();
        $clientId = 'test-client-uuid-123';

        $first = $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'Premier envoi',
            'files' => [UploadedFile::fake()->image('first.jpg')],
            'client_message_id' => $clientId,
        ]);
        $first->assertOk();
        $firstMsgId = $first->json('id');

        $second = $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'Doublon',
            'files' => [UploadedFile::fake()->image('second.jpg')],
            'client_message_id' => $clientId,
        ]);
        $second->assertOk();
        $secondMsgId = $second->json('id');

        $this->assertSame($firstMsgId, $secondMsgId);
        $this->assertSame($first->json('clientMessageId'), $second->json('clientMessageId'));
        $this->assertSame('Premier envoi', $second->json('body'));
        $this->assertCount(1, $second->json('attachments'));
        $this->assertSame('first.jpg', $second->json('attachments.0.originalFilename'));
        $this->assertDatabaseCount('messages', 1);
    }

    public function test_different_client_message_id_creates_new_message(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();

        $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'Message A',
            'client_message_id' => 'uuid-A',
        ]);
        $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'Message B',
            'client_message_id' => 'uuid-B',
        ]);

        $this->assertDatabaseCount('messages', 2);
    }

    public function test_client_message_id_scoped_per_user_and_conversation(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();
        $otherConv = $this->conversation();
        app(\Spatie\Permission\Models\Permission::class)::findOrCreate('manage inbox', 'web');
        $this->member->givePermissionTo('manage inbox');

        $clientId = 'shared-client-id';

        $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'Owner dans conv1',
            'client_message_id' => $clientId,
        ]);
        $this->actingAs($this->member)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'Member dans conv1',
            'client_message_id' => $clientId,
        ]);
        $this->actingAs($this->owner)->post('/inbox/'.$otherConv->id.'/messages', [
            'body' => 'Owner dans conv2',
            'client_message_id' => $clientId,
        ]);

        $this->assertDatabaseCount('messages', 3);
    }

    public function test_broadcast_dispatched_on_file_upload(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();

        Event::fake([MessageCreated::class]);

        $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'Avec fichier',
            'files' => [UploadedFile::fake()->image('broadcast.jpg')],
        ]);

        Event::assertDispatched(MessageCreated::class);
    }

    public function test_send_message_returns_client_message_id(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();

        $response = $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'Vérification clientMessageId',
            'client_message_id' => 'custom-client-id',
        ]);

        $response->assertOk();
        $this->assertSame('custom-client-id', $response->json('clientMessageId'));
    }

    public function test_send_message_without_client_message_id_returns_null(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();

        $response = $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'Sans id client',
        ]);

        $response->assertOk();
        $this->assertNull($response->json('clientMessageId'));
    }

    public function test_consecutive_messages_with_same_body_are_distinct(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();

        $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', ['body' => 'Même contenu']);
        $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', ['body' => 'Même contenu']);

        $this->assertDatabaseCount('messages', 2);
    }

    public function test_files_array_preserves_order(): void
    {
        Storage::fake('local');
        $conversation = $this->conversation();

        $response = $this->actingAs($this->owner)->post('/inbox/'.$conversation->id.'/messages', [
            'body' => 'Ordre',
            'files' => [
                UploadedFile::fake()->create('first.pdf', 50, 'application/pdf'),
                UploadedFile::fake()->image('second.jpg'),
                UploadedFile::fake()->create('third.docx', 60, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
            ],
        ]);

        $response->assertOk();
        $atts = $response->json('attachments');
        $this->assertSame('first.pdf', $atts[0]['originalFilename']);
        $this->assertSame('second.jpg', $atts[1]['originalFilename']);
        $this->assertSame('third.docx', $atts[2]['originalFilename']);
    }

    private function conversation(string $type = 'direct'): Conversation
    {
        $conversation = Conversation::create([
            'company_id' => $this->owner->company_id,
            'branch_id' => $this->owner->branch_id,
            'type' => $type,
            'subject' => $type === 'group' ? 'Groupe' : null,
        ]);
        $conversation->participants()->create(['user_id' => $this->owner->id, 'role' => 'owner']);
        $conversation->participants()->create(['user_id' => $this->member->id, 'role' => 'member']);

        return $conversation;
    }
}
