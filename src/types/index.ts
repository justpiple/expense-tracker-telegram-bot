export interface ExpenseData {
  description: string;
  amount: number;
  date: string;
  subcategory?: string;
  account?: string;
  receipt?: string;
}

export interface Subcategory {
  id: string;
  name: string;
}

export interface Account {
  id: string;
  name: string;
}

export interface ExpenseProcessResult {
  expenseId?: string;
  matchedSubcategory?: string;
  isNewSubcategory?: boolean;
  isNewMonth?: boolean;
  isNewYear?: boolean;
  success: boolean;
  error?: string;
}

export interface DateTracker {
  monthId?: string;
  yearId?: string;
  isNewMonth?: boolean;
  isNewYear?: boolean;
}

export interface MultiExpenseResult {
  successes: number;
  failures: number;
  expenses: ExpenseProcessResult[];
}

export interface AIExpenseResponse {
  expenses: ExpenseData[];
}
