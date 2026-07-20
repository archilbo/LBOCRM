<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Company;
use App\Models\FinanceTemplate;
use App\Models\User;
use App\Services\Finance\DefaultFinanceTemplateFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class FinanceTemplateManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private FinanceTemplate $template;

    protected function setUp(): void
    {
        parent::setUp();

        $company = Company::query()->firstOrFail();
        $branch = Branch::query()->where('company_id', $company->id)->firstOrFail();
        $this->user = User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
        ]);
        Role::findOrCreate('admin', 'web');
        $this->user->assignRole('admin');

        $this->template = FinanceTemplate::create(array_merge(
            app(DefaultFinanceTemplateFactory::class)->invoice(),
            [
                'name' => 'Template DB visible',
                'slug' => 'template-db-visible',
                'is_default' => false,
                'company_id' => $company->id,
                'branch_id' => $branch->id,
                'created_by' => $this->user->id,
            ],
        ));
    }

    public function test_index_returns_templates_persisted_for_the_user_scope(): void
    {
        $count = FinanceTemplate::query()
            ->where('company_id', $this->user->company_id)
            ->where('branch_id', $this->user->branch_id)
            ->count();

        $this->actingAs($this->user)
            ->get(route('finance.templates.index', ['type' => 'invoice']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Finance/Templates/Index')
                ->has('templates', $count));
    }

    public function test_finance_documents_templates_tab_receives_all_persisted_templates(): void
    {
        $count = FinanceTemplate::query()
            ->where('company_id', $this->user->company_id)
            ->where('branch_id', $this->user->branch_id)
            ->count();

        $this->actingAs($this->user)
            ->get(route('finance.documents.index', ['tab' => 'templates']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Finance/Documents/Index')
                ->has('templates', $count)
                ->where('filters.tab', 'templates'));
    }

    public function test_template_can_be_renamed_without_changing_its_slug(): void
    {
        $this->actingAs($this->user)
            ->patch(route('finance.templates.rename', $this->template), [
                'name' => 'Facture architecture premium',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('finance_templates', [
            'id' => $this->template->id,
            'name' => 'Facture architecture premium',
            'slug' => 'template-db-visible',
        ]);
        $this->assertDatabaseHas('finance_activity_logs', [
            'subject_type' => FinanceTemplate::class,
            'subject_id' => $this->template->id,
            'action' => 'finance.template.renamed',
        ]);
    }
}
