<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreExpenseRequest;
use App\Http\Requests\Finance\UpdateExpenseRequest;
use App\Models\Expense;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::with(['dossier', 'creator'])
            ->orderByDesc('expense_date')
            ->orderByDesc('created_at');

        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('vendor', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('dossier', fn ($dq) => $dq->where('dossier_number', 'like', "%{$search}%"));
            });
        }

        if ($from = $request->input('date_from')) {
            $query->whereDate('expense_date', '>=', $from);
        }

        if ($to = $request->input('date_to')) {
            $query->whereDate('expense_date', '<=', $to);
        }

        $expenses = $query->limit(100)->get()->map(fn (Expense $expense) => [
            'id' => $expense->id,
            'category' => $expense->category,
            'vendor' => $expense->vendor,
            'amount' => (float) $expense->amount,
            'currency' => $expense->currency,
            'expenseDate' => $expense->expense_date->toDateString(),
            'paymentMethod' => $expense->payment_method,
            'notes' => $expense->notes,
            'dossier' => $expense->dossier ? [
                'id' => $expense->dossier->id,
                'number' => $expense->dossier->dossier_number,
            ] : null,
            'createdBy' => $expense->creator?->name,
            'createdAt' => $expense->created_at?->toDateTimeString(),
        ]);

        return Inertia::render('Finance/Expenses/Index', [
            'expenses' => $expenses,
            'filters' => $request->only(['category', 'search', 'date_from', 'date_to']),
        ]);
    }

    public function store(StoreExpenseRequest $request): RedirectResponse
    {
        $data = $request->validated();

        Expense::create([
            ...$data,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('finance.expenses.index')
            ->with('success', 'Depense enregistree avec succes.');
    }

    public function update(UpdateExpenseRequest $request, Expense $expense): RedirectResponse
    {
        $expense->update($request->validated());

        return redirect()->route('finance.expenses.index')
            ->with('success', 'Depense mise a jour avec succes.');
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        $expense->delete();

        return redirect()->route('finance.expenses.index')
            ->with('success', 'Depense supprimee.');
    }
}
