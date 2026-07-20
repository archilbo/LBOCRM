<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreExpenseRequest;
use App\Http\Requests\Finance\UpdateExpenseRequest;
use App\Models\Expense;
use App\Services\Finance\FinanceActivityService;
use App\Services\Finance\FinanceContextService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Expense::class);

        return redirect()->route('finance.documents.index', ['tab' => 'expenses']);
    }

    public function store(StoreExpenseRequest $request): RedirectResponse
    {
        $this->authorize('create', Expense::class);
        $data = $request->validated();

        $expense = Expense::create([
            ...app(FinanceContextService::class)->payload($request->user()),
            ...$data,
            'created_by' => Auth::id(),
        ]);
        app(FinanceActivityService::class)->log($expense, $request->user(), 'finance.expense.created', [], $expense->only(['category', 'vendor', 'amount', 'expense_date']));

        return redirect()->route('finance.expenses.index')
            ->with('success', 'Depense enregistree avec succes.');
    }

    public function update(UpdateExpenseRequest $request, Expense $expense): RedirectResponse
    {
        $this->authorize('update', $expense);
        $old = $expense->only(['category', 'vendor', 'amount', 'expense_date', 'payment_method']);
        $expense->update($request->validated());
        app(FinanceActivityService::class)->log($expense, $request->user(), 'finance.expense.updated', $old, $expense->only(array_keys($old)));

        return redirect()->route('finance.expenses.index')
            ->with('success', 'Depense mise a jour avec succes.');
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        $this->authorize('delete', $expense);
        app(FinanceActivityService::class)->log($expense, request()->user(), 'finance.expense.deleted', $expense->toArray());
        $expense->delete();

        return redirect()->route('finance.expenses.index')
            ->with('success', 'Depense supprimee.');
    }
}
