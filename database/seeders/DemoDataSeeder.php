<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Conversation;
use App\Models\Dossier;
use App\Models\Message;
use App\Models\MessageRead;
use App\Models\Task;
use App\Models\TaskChecklistItem;
use App\Models\TaskComment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        /* ================================================================
         * 1. USERS — idempotent, with known passwords and Spatie roles
         * ================================================================ */
        $admin    = $this->ensureUser('admin@archilbo.local',    'Admin',       now(),        'admin');
        $manager  = $this->ensureUser('manager@archilbo.local',  'Manager',     now()->subMinutes(5),  'manager');
        $staff    = $this->ensureUser('staff@archilbo.local',    'Staff',       now()->subMinutes(15), 'staff');
        $viewer   = $this->ensureUser('viewer@archilbo.local',   'Viewer',      now()->subHours(1),    'viewer');
        $architect = $this->ensureUser('architect@archilbo.local', 'Architect', now()->subMinutes(2),  'staff');
        $assistant = $this->ensureUser('assistant@archilbo.local', 'Assistant', now()->subHours(3),    'staff');

        $this->command->info('Users ready: admin, manager, staff, viewer, architect, assistant');

        /* ================================================================
         * 2. CLIENTS (ref existing or create)
         * ================================================================ */
        $clients = [];
        $clientData = [
            ['cin' => 'AB123456', 'full_name' => 'Mohamed Ouknin',         'phone' => '0612345678', 'email' => 'mohamed@email.ma'],
            ['cin' => 'CD789012', 'full_name' => 'Salma El Mansouri',      'phone' => '0698765432', 'email' => 'salma@email.ma'],
            ['cin' => 'XX999999', 'full_name' => 'Omar Hassani',           'phone' => '0677777777', 'email' => 'omar@email.ma'],
        ];
        foreach ($clientData as $i => $d) {
            $clients[] = Client::firstOrCreate(
                ['cin' => $d['cin']],
                [
                    'client_number' => 'CL-DEMO-' . str_pad((string) ($i + 1), 3, '0', STR_PAD_LEFT),
                    'civility' => 'Mr',
                    'first_name' => explode(' ', $d['full_name'])[0],
                    'last_name' => explode(' ', $d['full_name'])[1] ?? '',
                    'full_name' => $d['full_name'],
                    'phone' => $d['phone'],
                    'email' => $d['email'],
                    'address' => $d['cin'] . ' Rue, Casablanca',
                    'status' => 'active',
                ],
            );
        }

        /* ================================================================
         * 3. DOSSIERS (projects)
         * ================================================================ */
        $dossiers = [];
        $dossierData = [
            ['num' => 'DOS-DEMO-001', 'client' => 0, 'object' => 'Residence Al Warda',          'province' => 'Casablanca', 'commune' => 'Maarif',     'status' => 'active',  'step' => 'contract'],
            ['num' => 'DOS-DEMO-002', 'client' => 1, 'object' => 'Immeuble commercial R+2',      'province' => 'Rabat',      'commune' => 'Agdal',     'status' => 'active',  'step' => 'rokhas'],
            ['num' => 'DOS-DEMO-003', 'client' => 2, 'object' => 'Villa avec jardin',            'province' => 'Marrakech',  'commune' => 'Gueliz',    'status' => 'opened',  'step' => 'documents'],
        ];
        foreach ($dossierData as $d) {
            $dossiers[] = Dossier::firstOrCreate(
                ['dossier_number' => $d['num']],
                [
                    'client_id' => $clients[$d['client']]->id,
                    'project_object' => $d['object'],
                    'province' => $d['province'],
                    'commune' => $d['commune'],
                    'status' => $d['status'],
                    'workflow_step' => $d['step'],
                    'opened_at' => now()->subDays(rand(10, 60)),
                ],
            );
        }

        /* ================================================================
         * 4. TASKS linked to dossiers and assigned to specific users
         * ================================================================ */
        $tasks = [];
        $taskDefs = [
            ['title' => 'Rediger le contrat pour Residence Al Warda',       'priority' => 'urgent', 'cat' => 'contract',      'status' => 'in_progress',  'assignee' => $manager,   'dossier' => 0, 'chk' => ['Verifier superficie', 'Calculer honoraires', 'Preparer engagement'], 'cmts' => ['Le client a accepté le devis.', 'Contrat en cours de redaction.']],
            ['title' => 'Suivi permis pour Immeuble R+2',                   'priority' => 'high',   'cat' => 'authorization',  'status' => 'in_progress',  'assignee' => $architect, 'dossier' => 1, 'chk' => ['Verifier dossier complet', 'Deposer a la commune'], 'cmts' => ['Les plans sont prets pour depot.']],
            ['title' => 'Collecter documents pour Villa jardin',            'priority' => 'medium', 'cat' => 'documents',     'status' => 'not_started',  'assignee' => $staff,     'dossier' => 2, 'chk' => ['CIN client', 'Certificat propriete', 'Plan cadastral']],
            ['title' => 'Preparer facture pour Residence Al Warda',         'priority' => 'high',   'cat' => 'finance',       'status' => 'not_started',  'assignee' => $staff,     'dossier' => 0, 'chk' => ['Calculer montant', 'Ajouter TVA', 'Envoyer au client']],
            ['title' => 'Inspection chantier Villa jardin',                 'priority' => 'medium', 'cat' => 'general_admin',  'status' => 'in_review',    'assignee' => $architect, 'dossier' => 2, 'chk' => ['Mesurer terrain', 'Verifier bornage', 'Photographier'], 'cmts' => ['Les mesures sont conformes au plan.', 'Rapport photo attache.']],
            ['title' => 'Relancer paiement client El Mansouri',             'priority' => 'high',   'cat' => 'finance',       'status' => 'in_progress',  'assignee' => $manager,   'dossier' => 1, 'chk' => ['Envoyer rappel', 'Confirmer reception'], 'cmts' => ['Le client est en retard de 15 jours.']],
            ['title' => 'Archiver documents Residence Al Warda',            'priority' => 'low',    'cat' => 'archive',       'status' => 'completed',    'assignee' => $staff,     'dossier' => 0, 'chk' => ['Classer physique', 'Numeriser', 'Mettre a jour registre'], 'cmts' => ['Tous les documents sont archives.']],
        ];

        foreach ($taskDefs as $i => $t) {
            $taskNum = 'DEMO-TASK-' . str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT);
            $status = $t['status'];
            $progress = match ($status) { 'completed' => 100, 'in_progress' => 35, 'in_review' => 75, default => 0 };

            $task = Task::updateOrCreate(
                ['task_number' => $taskNum],
                [
                    'title' => $t['title'],
                    'status' => $status,
                    'priority' => $t['priority'],
                    'category' => $t['cat'],
                    'progress' => $progress,
                    'due_date' => match ($t['priority']) { 'urgent' => now(), 'high' => now()->addDays(3), default => now()->addDays(7) },
                    'created_by' => $admin->id,
                    'assigned_by' => $admin->id,
                    'dossier_id' => $dossiers[$t['dossier']]->id,
                    'client_id' => $dossiers[$t['dossier']]->client_id,
                    'completed_at' => $status === 'completed' ? now() : null,
                ]);

            $task->assignees()->sync([$t['assignee']->id]);
            $task->watchers()->sync([$admin->id, $manager->id]);

            if (!empty($t['chk'])) {
                foreach ($t['chk'] as $j => $label) {
                    TaskChecklistItem::create([
                        'task_id' => $task->id,
                        'label' => $label,
                        'is_done' => $status === 'completed' || ($status === 'in_progress' && $j === 0),
                        'position' => $j,
                    ]);
                }
            }
            if (!empty($t['cmts'])) {
                foreach ($t['cmts'] as $body) {
                    TaskComment::create([
                        'task_id' => $task->id,
                        'user_id' => $t['assignee']->id,
                        'body' => $body,
                        'created_at' => now()->subHours(rand(1, 48)),
                    ]);
                }
            }
            $tasks[] = $task;
        }

        $this->command->info(count($taskDefs) . ' demo tasks created.');

        /* ================================================================
         * 5. CONVERSATIONS & MESSAGES — using ChatService helpers
         * ================================================================ */

        // 5a. Admin ↔ Manager conversation about Residence Al Warda
        $convIds = [];
        $conv1 = $this->findOrCreateConv('direct', null, [$admin->id, $manager->id]); $convIds[] = $conv1->id;
        $m1 = $this->makeMsg($conv1, $admin->id, 'Bonjour, le projet Residence Al Warda avance bien. Il faut preparer le contrat urgent.', now()->subHours(4));
        $this->markRead($m1, $manager->id);
        $m2 = $this->makeMsg($conv1, $manager->id, "D'accord, je m'en occupe aujourd'hui. J'ai deja les infos du client.", now()->subHours(3));
        $this->markRead($m2, $admin->id);
        $m3 = $this->makeMsg($conv1, $manager->id, 'Voici le projet de contrat pour verification.', now()->subHours(2)->addMinutes(20));
        $this->markRead($m3, $admin->id);
        $m4 = $this->makeMsg($conv1, $admin->id, 'Parfait! Quelques petites modifications puis on envoie au client.', now()->subHours(1));
        $m4->update(['is_edited' => true, 'edited_at' => now()->subMinutes(30), 'body' => 'Parfait! Quelques petites modifications sur le taux puis on envoie au client.']);
        $this->markRead($m4, $manager->id);
        $this->makeMsg($conv1, $manager->id, 'Modifications faites. Pret pour signature.', now()->subMinutes(45), $m1->id); // reply to first msg
        $conv1->update(['last_message_at' => now()->subMinutes(45)]);

        // 5b. Architect ↔ Staff conversation about Villa jardin inspection
        $conv2 = $this->findOrCreateConv('direct', null, [$architect->id, $staff->id]); $convIds[] = $conv2->id;
        $m5 = $this->makeMsg($conv2, $architect->id, "J'ai termine l'inspection pour la Villa jardin. Les mesures sont bonnes.", now()->subDays(1)->addHours(2));
        $this->markRead($m5, $staff->id);
        $m6 = $this->makeMsg($conv2, $staff->id, 'Super! Je prepare le rapport et je l\'ajoute au dossier.', now()->subDays(1)->addHours(5));
        $this->markRead($m6, $architect->id);
        $this->makeMsg($conv2, $staff->id, 'Rapport ajoute. Tu peux le verifier quand tu as le temps.', now()->subHours(4));
        $conv2->update(['last_message_at' => now()->subHours(4)]);

        // 5c. Group conversation: all users discussing general project status
        $conv3 = $this->findOrCreateConv('group', 'Suivi projets en cours', [$admin->id, $manager->id, $architect->id, $staff->id]); $convIds[] = $conv3->id;
        $g1 = $this->makeMsg($conv3, $admin->id, "Point hebdomadaire : Residence Al Warda contrat en cours, Immeuble R+2 permis depose, Villa jardin inspection faite.", now()->subDays(2));
        foreach ([$manager->id, $architect->id, $staff->id] as $uid) { $this->markRead($g1, $uid); }
        $g2 = $this->makeMsg($conv3, $architect->id, "Pour l'Immeuble R+2, j'attends le retour de la commune pour le permis.", now()->subDays(2)->addHours(1));
        foreach ([$admin->id, $manager->id, $staff->id] as $uid) { $this->markRead($g2, $uid); }
        $g3 = $this->makeMsg($conv3, $manager->id, "OK. Je vais relancer la commune cette semaine.", now()->subDays(2)->addHours(2));
        foreach ([$admin->id, $architect->id, $staff->id] as $uid) { $this->markRead($g3, $uid); }
        $g4 = $this->makeMsg($conv3, $staff->id, 'J\'ai finalise l\'archivage de Residence Al Warda.', now()->subDays(1)->addMinutes(30));
        foreach ([$admin->id, $manager->id, $architect->id] as $uid) { $this->markRead($g4, $uid); }
        $g5 = $this->makeMsg($conv3, $admin->id, "Super. Merci a tous pour le bon travail cette semaine.", now()->subHours(6));
        $g5->update(['is_forwarded' => true]);
        foreach ([$manager->id, $architect->id, $staff->id] as $uid) { $this->markRead($g5, $uid); }
        $this->makeMsg($conv3, $architect->id, "Merci! Bon weekend a tous.", now()->subHours(5), $g5->id);
        $conv3->update(['last_message_at' => now()->subHours(5)]);

        // 5d. Direct conversation: Viewer → Manager (read-only scenario)
        $conv4 = $this->findOrCreateConv('direct', null, [$viewer->id, $manager->id]); $convIds[] = $conv4->id;
        $this->makeMsg($conv4, $viewer->id, "Bonjour Manager, pourrais-je avoir un acces aux documents du projet Residence Al Warda?", now()->subHours(2));
        $this->makeMsg($conv4, $manager->id, "Bien sur, je vous donne acces. Je partage le lien dans la journee.", now()->subHour());

        // 5e. Group conversation: Finance-focused
        $conv5 = $this->findOrCreateConv('group', 'Finance / Facturation', [$admin->id, $manager->id, $staff->id]); $convIds[] = $conv5->id;

        if (Message::whereIn('conversation_id', $convIds)->exists()) {
            $this->command->info('5 demo conversations already have messages — skipping.');
        } else {
        $f1 = $this->makeMsg($conv5, $manager->id, "Rappel: la facture pour Residence Al Warda doit etre envoyee cette semaine.", now()->subDays(1)->addHours(3));
        foreach ([$admin->id, $staff->id] as $uid) { $this->markRead($f1, $uid); }
        $this->makeMsg($conv5, $staff->id, 'Je prepare la facture aujourd\'hui et je l\'envoie au client demain.', now()->subHours(12));

        $this->command->info('5 demo conversations with messages created.');
        }

        /* ================================================================
         * 6. Summary
         * ================================================================ */
        $this->command->info(sprintf(
            'DemoDataSeeder done: %d users, %d clients, %d dossiers, %d tasks, %d conversations.',
            User::count(), Client::count(), Dossier::count(), Task::count(), Conversation::count(),
        ));
    }

    /* ---- helpers ----------------------------------------------------- */

    private function ensureUser(string $email, string $name, ?Carbon $lastSeen, string $role): User
    {
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make('password'),
                'last_seen_at' => $lastSeen,
            ],
        );
        if (!$user->hasRole($role)) {
            $user->assignRole($role);
        }
        return $user;
    }

    private function findOrCreateConv(string $type, ?string $subject, array $userIds): Conversation
    {
        if ($type === 'direct' && count($userIds) === 2) {
            $existing = Conversation::where('type', 'direct')
                ->whereHas('participants', fn ($q) => $q->where('user_id', $userIds[0]))
                ->whereHas('participants', fn ($q) => $q->where('user_id', $userIds[1]))
                ->first();
            if ($existing) {
                return $existing;
            }
        }
        $conv = Conversation::create(['type' => $type, 'subject' => $subject, 'last_message_at' => now()]);
        foreach ($userIds as $uid) {
            $conv->participants()->create(['user_id' => $uid]);
        }
        return $conv;
    }

    private function makeMsg(Conversation $conv, int $userId, string $body, Carbon $createdAt, ?int $replyToId = null): Message
    {
        return Message::create([
            'conversation_id' => $conv->id,
            'user_id' => $userId,
            'body' => $body,
            'reply_to_message_id' => $replyToId,
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ]);
    }

    private function markRead(Message $message, int $userId): void
    {
        MessageRead::firstOrCreate(
            ['message_id' => $message->id, 'user_id' => $userId],
            ['read_at' => $message->created_at?->addMinutes(rand(1, 10)) ?? now()],
        );
    }
}
