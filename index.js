// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import session from "express-session";
import createMemoryStore from "memorystore";
var MemoryStore = createMemoryStore(session);
var MemStorage = class {
  users;
  expenses;
  incomes;
  expenseCategories;
  expenseSubcategories;
  incomeCategories;
  incomeSubcategories;
  budgets;
  budgetAllocations;
  nextUserId;
  nextExpenseId;
  nextIncomeId;
  nextExpenseCategoryId;
  nextExpenseSubcategoryId;
  nextIncomeCategoryId;
  nextIncomeSubcategoryId;
  nextBudgetId;
  nextBudgetAllocationId;
  sessionStore;
  userRoles;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.expenses = /* @__PURE__ */ new Map();
    this.incomes = /* @__PURE__ */ new Map();
    this.expenseCategories = /* @__PURE__ */ new Map();
    this.expenseSubcategories = /* @__PURE__ */ new Map();
    this.incomeCategories = /* @__PURE__ */ new Map();
    this.incomeSubcategories = /* @__PURE__ */ new Map();
    this.budgets = /* @__PURE__ */ new Map();
    this.budgetAllocations = /* @__PURE__ */ new Map();
    this.nextUserId = 1;
    this.nextExpenseId = 1;
    this.nextIncomeId = 1;
    this.nextExpenseCategoryId = 1;
    this.nextExpenseSubcategoryId = 1;
    this.nextIncomeCategoryId = 1;
    this.nextIncomeSubcategoryId = 1;
    this.nextBudgetId = 1;
    this.nextBudgetAllocationId = 1;
    this.userRoles = /* @__PURE__ */ new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 864e5
      // prune expired entries every 24h
    });
    this.createDemoAccounts();
  }
  // Helper method to create default categories based on the Excel file
  async createDefaultCategories(userId) {
    const categories = {
      "Children": ["Activities", "Allowance", "Medical", "Childcare", "Clothing", "School", "Toys"],
      "Debt": ["Credit cards", "Student loans", "Other loans", "Taxes (federal)", "Taxes (state)", "Other"],
      "Education": ["Tuition", "Books", "Music lessons", "Other"],
      "Entertainment": ["Books", "Concerts/shows", "Games", "Hobbies", "Movies", "Music", "Outdoor activities", "Photography", "Sports", "Theater/plays", "TV", "Other"],
      "Everyday": ["Groceries", "Restaurants", "Personal supplies", "Clothes", "Laundry/dry cleaning", "Hair/beauty", "Subscriptions", "Other"],
      "Gifts": ["Gifts", "Donations (charity)", "Other"],
      "Health/medical": ["Doctors/dental/vision", "Specialty care", "Pharmacy", "Emergency", "Other"],
      "Home": ["Rent/mortgage", "Property taxes", "Furnishings", "Lawn/garden", "Supplies", "Maintenance", "Improvements", "Moving", "Other"],
      "Insurance": ["Car", "Health", "Home", "Life", "Other"],
      "Pets": ["Food", "Vet/medical", "Toys", "Supplies", "Other"],
      "Technology": ["Domains & hosting", "Online services", "Hardware", "Software", "Other"],
      "Transportation": ["Fuel", "Car payments", "Repairs", "Registration/license", "Supplies", "Public transit", "Other"],
      "Travel": ["Airfare", "Hotels", "Food", "Transportation", "Entertainment", "Other"],
      "Utilities": ["Phone", "TV", "Internet", "Electricity", "Heat/gas", "Water", "Trash", "Other"]
    };
    const incomeCategories2 = {
      "Wages": ["Paycheck", "Tips", "Bonus", "Commission", "Other"],
      "Other": ["Transfer from savings", "Interest income", "Dividends", "Gifts", "Refunds", "Other"]
    };
    for (const [categoryName, subcategories] of Object.entries(categories)) {
      const category = await this.createExpenseCategory(userId, {
        name: categoryName,
        description: `${categoryName} expenses`
      });
      for (const subcategoryName of subcategories) {
        await this.createExpenseSubcategory(userId, {
          categoryId: category.id,
          name: subcategoryName,
          description: `${subcategoryName} in ${categoryName}`
        });
      }
    }
    for (const [categoryName, subcategories] of Object.entries(incomeCategories2)) {
      const category = await this.createIncomeCategory(userId, {
        name: categoryName,
        description: `${categoryName} income`
      });
      for (const subcategoryName of subcategories) {
        await this.createIncomeSubcategory(userId, {
          categoryId: category.id,
          name: subcategoryName,
          description: `${subcategoryName} in ${categoryName}`
        });
      }
    }
  }
  // Helper method to create demo accounts
  async createDemoAccounts() {
    const demoUser = await this.getUserByUsername("demo");
    if (!demoUser) {
      const user = await this.createUser({
        username: "demo",
        password: "b60287264acd6c301166a63a231983be7b1c50472d531f739418b9f98a0ead1fd7fb8e3c10a39b716d735e1d4e42c784796faf9efc594469683566841d44bd53.e3ecf42fb63c9aa37f8a3556ad42f42a",
        // 'password'
        name: "Demo User",
        email: "demo@example.com"
      });
      await this.createDefaultCategories(user.id);
      const categories = await this.getExpenseCategories(user.id);
      const foodCategory = categories.find((c) => c.name === "Everyday");
      const transportCategory = categories.find((c) => c.name === "Transportation");
      const entertainmentCategory = categories.find((c) => c.name === "Entertainment");
      const groceriesSubcategory = foodCategory ? (await this.getExpenseSubcategories(foodCategory.id)).find((s) => s.name === "Groceries") : null;
      const fuelSubcategory = transportCategory ? (await this.getExpenseSubcategories(transportCategory.id)).find((s) => s.name === "Fuel") : null;
      const subscriptionsSubcategory = entertainmentCategory ? (await this.getExpenseSubcategories(entertainmentCategory.id)).find((s) => s.name === "Subscriptions") : null;
      const date = /* @__PURE__ */ new Date();
      if (foodCategory && groceriesSubcategory) {
        await this.createExpense({
          userId: user.id,
          amount: 12500,
          description: "Groceries",
          date: new Date(date.getTime() - 1 * 24 * 60 * 60 * 1e3),
          // 1 day ago
          categoryId: foodCategory.id,
          subcategoryId: groceriesSubcategory.id,
          merchant: "Supermarket",
          notes: "Weekly shopping"
        });
      }
      if (transportCategory && fuelSubcategory) {
        await this.createExpense({
          userId: user.id,
          amount: 22e3,
          description: "Gas",
          date: new Date(date.getTime() - 3 * 24 * 60 * 60 * 1e3),
          // 3 days ago
          categoryId: transportCategory.id,
          subcategoryId: fuelSubcategory.id,
          merchant: "Gas Station",
          notes: null
        });
      }
      if (entertainmentCategory && subscriptionsSubcategory) {
        await this.createExpense({
          userId: user.id,
          amount: 6500,
          description: "Netflix subscription",
          date: new Date(date.getTime() - 5 * 24 * 60 * 60 * 1e3),
          // 5 days ago
          categoryId: entertainmentCategory.id,
          subcategoryId: subscriptionsSubcategory.id,
          merchant: "Netflix",
          notes: "Monthly subscription"
        });
      }
      const incomeCategories2 = await this.getIncomeCategories(user.id);
      const wagesCategory = incomeCategories2.find((c) => c.name === "Wages");
      if (wagesCategory) {
        const paycheckSubcategory = (await this.getIncomeSubcategories(wagesCategory.id)).find((s) => s.name === "Paycheck");
        if (paycheckSubcategory) {
          await this.createIncome({
            userId: user.id,
            amount: 15e4,
            description: "Monthly salary",
            date: new Date(date.getTime() - 2 * 24 * 60 * 60 * 1e3),
            // 2 days ago
            categoryId: wagesCategory.id,
            subcategoryId: paycheckSubcategory.id,
            source: "Employer",
            notes: "Regular monthly payment"
          });
        }
      }
      const currentMonth = (/* @__PURE__ */ new Date()).getMonth();
      const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      const startDate = new Date(currentYear, currentMonth, 1);
      const endDate = new Date(currentYear, currentMonth + 1, 0);
      const budget = await this.createBudget({
        userId: user.id,
        title: "Monthly Budget",
        startDate,
        endDate,
        totalBudget: 3e5
      });
      if (foodCategory) {
        await this.createBudgetAllocation({
          budgetId: budget.id,
          categoryId: foodCategory.id,
          subcategoryId: null,
          amount: 5e4
        });
      }
      if (transportCategory) {
        await this.createBudgetAllocation({
          budgetId: budget.id,
          categoryId: transportCategory.id,
          subcategoryId: null,
          amount: 3e4
        });
      }
      if (entertainmentCategory) {
        await this.createBudgetAllocation({
          budgetId: budget.id,
          categoryId: entertainmentCategory.id,
          subcategoryId: null,
          amount: 2e4
        });
      }
    }
    const adminUser = await this.getUserByUsername("admin");
    if (!adminUser) {
      const admin = await this.createUser({
        username: "admin",
        password: "b60287264acd6c301166a63a231983be7b1c50472d531f739418b9f98a0ead1fd7fb8e3c10a39b716d735e1d4e42c784796faf9efc594469683566841d44bd53.e3ecf42fb63c9aa37f8a3556ad42f42a",
        // 'password'
        name: "Admin User",
        email: "admin@example.com"
      });
      await this.createDefaultCategories(admin.id);
    }
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.nextUserId++;
    const role = id === 2 ? "admin" : "user";
    const user = {
      ...insertUser,
      id,
      currency: "XAF",
      role
    };
    this.users.set(id, user);
    this.userRoles.set(id, role);
    return user;
  }
  async getAllUsers() {
    return Array.from(this.users.values());
  }
  async getUserRole(userId) {
    return this.userRoles.get(userId) || "user";
  }
  async setUserRole(userId, role) {
    this.userRoles.set(userId, role);
  }
  async updateUserSettings(userId, settings) {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    const updatedUser = {
      ...user,
      currency: settings.currency || user.currency || "XAF"
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  // Expense Category methods
  async getExpenseCategories(userId) {
    return Array.from(this.expenseCategories.values()).filter(
      (category) => category.userId === userId
    );
  }
  async getExpenseCategoryById(id) {
    return this.expenseCategories.get(id);
  }
  async createExpenseCategory(userId, category) {
    const id = this.nextExpenseCategoryId++;
    const newCategory = {
      ...category,
      id,
      userId,
      isSystem: false,
      createdAt: /* @__PURE__ */ new Date(),
      description: category.description || null
    };
    this.expenseCategories.set(id, newCategory);
    return newCategory;
  }
  async updateExpenseCategory(id, category) {
    const existingCategory = this.expenseCategories.get(id);
    if (!existingCategory) {
      throw new Error(`Category with id ${id} not found`);
    }
    const updatedCategory = {
      ...existingCategory,
      name: category.name,
      description: category.description || existingCategory.description
    };
    this.expenseCategories.set(id, updatedCategory);
    return updatedCategory;
  }
  async deleteExpenseCategory(id) {
    const hasExpenses = Array.from(this.expenses.values()).some(
      (expense) => expense.categoryId === id
    );
    if (hasExpenses) {
      throw new Error(`Cannot delete category with existing expenses`);
    }
    const hasSubcategories = Array.from(this.expenseSubcategories.values()).some(
      (subcategory) => subcategory.categoryId === id
    );
    if (hasSubcategories) {
      throw new Error(`Cannot delete category with existing subcategories`);
    }
    this.expenseCategories.delete(id);
  }
  // Expense Subcategory methods
  async getExpenseSubcategories(categoryId) {
    return Array.from(this.expenseSubcategories.values()).filter(
      (subcategory) => subcategory.categoryId === categoryId
    );
  }
  async getExpenseSubcategoryById(id) {
    return this.expenseSubcategories.get(id);
  }
  async createExpenseSubcategory(userId, subcategory) {
    const id = this.nextExpenseSubcategoryId++;
    const newSubcategory = {
      ...subcategory,
      id,
      userId,
      isSystem: false,
      createdAt: /* @__PURE__ */ new Date(),
      description: subcategory.description || null
    };
    this.expenseSubcategories.set(id, newSubcategory);
    return newSubcategory;
  }
  async updateExpenseSubcategory(id, subcategory) {
    const existingSubcategory = this.expenseSubcategories.get(id);
    if (!existingSubcategory) {
      throw new Error(`Subcategory with id ${id} not found`);
    }
    const updatedSubcategory = {
      ...existingSubcategory,
      name: subcategory.name,
      categoryId: subcategory.categoryId,
      description: subcategory.description || existingSubcategory.description
    };
    this.expenseSubcategories.set(id, updatedSubcategory);
    return updatedSubcategory;
  }
  async deleteExpenseSubcategory(id) {
    const hasExpenses = Array.from(this.expenses.values()).some(
      (expense) => expense.subcategoryId === id
    );
    if (hasExpenses) {
      throw new Error(`Cannot delete subcategory with existing expenses`);
    }
    this.expenseSubcategories.delete(id);
  }
  // Income Category methods
  async getIncomeCategories(userId) {
    return Array.from(this.incomeCategories.values()).filter(
      (category) => category.userId === userId
    );
  }
  async getIncomeCategoryById(id) {
    return this.incomeCategories.get(id);
  }
  async createIncomeCategory(userId, category) {
    const id = this.nextIncomeCategoryId++;
    const newCategory = {
      ...category,
      id,
      userId,
      isSystem: false,
      createdAt: /* @__PURE__ */ new Date(),
      description: category.description || null
    };
    this.incomeCategories.set(id, newCategory);
    return newCategory;
  }
  async updateIncomeCategory(id, category) {
    const existingCategory = this.incomeCategories.get(id);
    if (!existingCategory) {
      throw new Error(`Category with id ${id} not found`);
    }
    const updatedCategory = {
      ...existingCategory,
      name: category.name,
      description: category.description || existingCategory.description
    };
    this.incomeCategories.set(id, updatedCategory);
    return updatedCategory;
  }
  async deleteIncomeCategory(id) {
    const hasIncomes = Array.from(this.incomes.values()).some(
      (income) => income.categoryId === id
    );
    if (hasIncomes) {
      throw new Error(`Cannot delete category with existing income entries`);
    }
    const hasSubcategories = Array.from(this.incomeSubcategories.values()).some(
      (subcategory) => subcategory.categoryId === id
    );
    if (hasSubcategories) {
      throw new Error(`Cannot delete category with existing subcategories`);
    }
    this.incomeCategories.delete(id);
  }
  // Income Subcategory methods
  async getIncomeSubcategories(categoryId) {
    return Array.from(this.incomeSubcategories.values()).filter(
      (subcategory) => subcategory.categoryId === categoryId
    );
  }
  async getIncomeSubcategoryById(id) {
    return this.incomeSubcategories.get(id);
  }
  async createIncomeSubcategory(userId, subcategory) {
    const id = this.nextIncomeSubcategoryId++;
    const newSubcategory = {
      ...subcategory,
      id,
      userId,
      isSystem: false,
      createdAt: /* @__PURE__ */ new Date(),
      description: subcategory.description || null
    };
    this.incomeSubcategories.set(id, newSubcategory);
    return newSubcategory;
  }
  async updateIncomeSubcategory(id, subcategory) {
    const existingSubcategory = this.incomeSubcategories.get(id);
    if (!existingSubcategory) {
      throw new Error(`Subcategory with id ${id} not found`);
    }
    const updatedSubcategory = {
      ...existingSubcategory,
      name: subcategory.name,
      categoryId: subcategory.categoryId,
      description: subcategory.description || existingSubcategory.description
    };
    this.incomeSubcategories.set(id, updatedSubcategory);
    return updatedSubcategory;
  }
  async deleteIncomeSubcategory(id) {
    const hasIncomes = Array.from(this.incomes.values()).some(
      (income) => income.subcategoryId === id
    );
    if (hasIncomes) {
      throw new Error(`Cannot delete subcategory with existing income entries`);
    }
    this.incomeSubcategories.delete(id);
  }
  // Expense methods
  async getExpensesByUserId(userId) {
    return Array.from(this.expenses.values()).filter(
      (expense) => expense.userId === userId
    );
  }
  async getExpenseById(id) {
    return this.expenses.get(id);
  }
  async createExpense(expenseData) {
    const id = this.nextExpenseId++;
    const expense = {
      ...expenseData,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      merchant: expenseData.merchant || null,
      notes: expenseData.notes || null,
      subcategoryId: expenseData.subcategoryId || null
    };
    this.expenses.set(id, expense);
    return expense;
  }
  // For backwards compatibility
  async createLegacyExpense(expenseData) {
    const { category: categoryName, ...rest } = expenseData;
    let categoryId;
    let foundCategory = Array.from(this.expenseCategories.values()).find(
      (c) => c.userId === expenseData.userId && c.name.toLowerCase() === categoryName.toLowerCase()
    );
    if (foundCategory) {
      categoryId = foundCategory.id;
    } else {
      const newCategory = await this.createExpenseCategory(expenseData.userId, {
        name: categoryName,
        description: `${categoryName} expenses`
      });
      categoryId = newCategory.id;
    }
    return this.createExpense({
      ...rest,
      userId: expenseData.userId,
      categoryId
    });
  }
  async updateExpense(id, expenseData) {
    const existingExpense = this.expenses.get(id);
    if (!existingExpense) {
      throw new Error(`Expense with id ${id} not found`);
    }
    const updatedExpense = {
      ...existingExpense,
      ...expenseData,
      id,
      createdAt: existingExpense.createdAt,
      merchant: expenseData.merchant || null,
      notes: expenseData.notes || null,
      subcategoryId: expenseData.subcategoryId || null
    };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }
  // For backwards compatibility
  async updateLegacyExpense(id, expenseData) {
    const { category: categoryName, ...rest } = expenseData;
    let categoryId;
    let foundCategory = Array.from(this.expenseCategories.values()).find(
      (c) => c.userId === expenseData.userId && c.name.toLowerCase() === categoryName.toLowerCase()
    );
    if (foundCategory) {
      categoryId = foundCategory.id;
    } else {
      const newCategory = await this.createExpenseCategory(expenseData.userId, {
        name: categoryName,
        description: `${categoryName} expenses`
      });
      categoryId = newCategory.id;
    }
    return this.updateExpense(id, {
      ...rest,
      userId: expenseData.userId,
      categoryId
    });
  }
  async deleteExpense(id) {
    if (!this.expenses.has(id)) {
      throw new Error(`Expense with id ${id} not found`);
    }
    this.expenses.delete(id);
  }
  async getAllExpenses() {
    return Array.from(this.expenses.values());
  }
  // Income methods
  async getIncomesByUserId(userId) {
    return Array.from(this.incomes.values()).filter(
      (income) => income.userId === userId
    );
  }
  async getIncomeById(id) {
    return this.incomes.get(id);
  }
  async createIncome(incomeData) {
    const id = this.nextIncomeId++;
    const income = {
      ...incomeData,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      source: incomeData.source || null,
      notes: incomeData.notes || null,
      subcategoryId: incomeData.subcategoryId || null
    };
    this.incomes.set(id, income);
    return income;
  }
  async updateIncome(id, incomeData) {
    const existingIncome = this.incomes.get(id);
    if (!existingIncome) {
      throw new Error(`Income with id ${id} not found`);
    }
    const updatedIncome = {
      ...existingIncome,
      ...incomeData,
      id,
      createdAt: existingIncome.createdAt,
      source: incomeData.source || null,
      notes: incomeData.notes || null,
      subcategoryId: incomeData.subcategoryId || null
    };
    this.incomes.set(id, updatedIncome);
    return updatedIncome;
  }
  async deleteIncome(id) {
    if (!this.incomes.has(id)) {
      throw new Error(`Income with id ${id} not found`);
    }
    this.incomes.delete(id);
  }
  async getAllIncomes() {
    return Array.from(this.incomes.values());
  }
  // Budget methods
  async getBudgetsByUserId(userId) {
    return Array.from(this.budgets.values()).filter(
      (budget) => budget.userId === userId
    );
  }
  async getBudgetById(id) {
    return this.budgets.get(id);
  }
  async createBudget(budgetData) {
    const id = this.nextBudgetId++;
    const budget = {
      ...budgetData,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.budgets.set(id, budget);
    return budget;
  }
  async updateBudget(id, budgetData) {
    const existingBudget = this.budgets.get(id);
    if (!existingBudget) {
      throw new Error(`Budget with id ${id} not found`);
    }
    const updatedBudget = {
      ...existingBudget,
      title: budgetData.title,
      startDate: budgetData.startDate,
      endDate: budgetData.endDate,
      totalBudget: budgetData.totalBudget
    };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }
  async deleteBudget(id) {
    if (!this.budgets.has(id)) {
      throw new Error(`Budget with id ${id} not found`);
    }
    const allocationsToDelete = Array.from(this.budgetAllocations.values()).filter((allocation) => allocation.budgetId === id).map((allocation) => allocation.id);
    for (const allocationId of allocationsToDelete) {
      this.budgetAllocations.delete(allocationId);
    }
    this.budgets.delete(id);
  }
  // Budget Allocation methods
  async getBudgetAllocations(budgetId) {
    return Array.from(this.budgetAllocations.values()).filter(
      (allocation) => allocation.budgetId === budgetId
    );
  }
  async createBudgetAllocation(allocationData) {
    const id = this.nextBudgetAllocationId++;
    const allocation = {
      ...allocationData,
      id,
      subcategoryId: allocationData.subcategoryId || null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.budgetAllocations.set(id, allocation);
    return allocation;
  }
  async updateBudgetAllocation(id, allocationData) {
    const existingAllocation = this.budgetAllocations.get(id);
    if (!existingAllocation) {
      throw new Error(`Budget allocation with id ${id} not found`);
    }
    const updatedAllocation = {
      ...existingAllocation,
      budgetId: allocationData.budgetId,
      categoryId: allocationData.categoryId,
      subcategoryId: allocationData.subcategoryId || null,
      amount: allocationData.amount
    };
    this.budgetAllocations.set(id, updatedAllocation);
    return updatedAllocation;
  }
  async deleteBudgetAllocation(id) {
    if (!this.budgetAllocations.has(id)) {
      throw new Error(`Budget allocation with id ${id} not found`);
    }
    this.budgetAllocations.delete(id);
  }
  // Reports and analytics
  async getMonthlyExpenseTotals(userId, year) {
    const expenses2 = await this.getExpensesByUserId(userId);
    const monthlyTotals = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: 0
    }));
    for (const expense of expenses2) {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getFullYear() === year) {
        const month = expenseDate.getMonth();
        monthlyTotals[month].total += expense.amount;
      }
    }
    return monthlyTotals;
  }
  async getCategoryExpenseTotals(userId, startDate, endDate) {
    const expenses2 = await this.getExpensesByUserId(userId);
    const categories = await this.getExpenseCategories(userId);
    const categoryMap = /* @__PURE__ */ new Map();
    for (const category of categories) {
      categoryMap.set(category.id, category.name);
    }
    const filteredExpenses = expenses2.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
    const categoryTotals = /* @__PURE__ */ new Map();
    for (const expense of filteredExpenses) {
      const categoryName = categoryMap.get(expense.categoryId) || "Uncategorized";
      const currentTotal = categoryTotals.get(categoryName) || 0;
      categoryTotals.set(categoryName, currentTotal + expense.amount);
    }
    return Array.from(categoryTotals.entries()).map(([category, total]) => ({
      category,
      total
    }));
  }
  async getMonthlyIncomeTotals(userId, year) {
    const incomes2 = await this.getIncomesByUserId(userId);
    const monthlyTotals = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: 0
    }));
    for (const income of incomes2) {
      const incomeDate = new Date(income.date);
      if (incomeDate.getFullYear() === year) {
        const month = incomeDate.getMonth();
        monthlyTotals[month].total += income.amount;
      }
    }
    return monthlyTotals;
  }
  async getCategoryIncomeTotals(userId, startDate, endDate) {
    const incomes2 = await this.getIncomesByUserId(userId);
    const categories = await this.getIncomeCategories(userId);
    const categoryMap = /* @__PURE__ */ new Map();
    for (const category of categories) {
      categoryMap.set(category.id, category.name);
    }
    const filteredIncomes = incomes2.filter((income) => {
      const incomeDate = new Date(income.date);
      return incomeDate >= startDate && incomeDate <= endDate;
    });
    const categoryTotals = /* @__PURE__ */ new Map();
    for (const income of filteredIncomes) {
      const categoryName = categoryMap.get(income.categoryId) || "Uncategorized";
      const currentTotal = categoryTotals.get(categoryName) || 0;
      categoryTotals.set(categoryName, currentTotal + income.amount);
    }
    return Array.from(categoryTotals.entries()).map(([category, total]) => ({
      category,
      total
    }));
  }
  async getBudgetPerformance(budgetId) {
    const budget = await this.getBudgetById(budgetId);
    if (!budget) {
      throw new Error(`Budget with id ${budgetId} not found`);
    }
    const allocations = await this.getBudgetAllocations(budgetId);
    const expenses2 = await this.getExpensesByUserId(budget.userId);
    const budgetExpenses = expenses2.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= budget.startDate && expenseDate <= budget.endDate;
    });
    const totalAllocated = allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
    const categoryTotals = /* @__PURE__ */ new Map();
    for (const expense of budgetExpenses) {
      const currentTotal = categoryTotals.get(expense.categoryId) || 0;
      categoryTotals.set(expense.categoryId, currentTotal + expense.amount);
    }
    const categoryPerformance = allocations.map((allocation) => {
      const spent = categoryTotals.get(allocation.categoryId) || 0;
      return {
        categoryId: allocation.categoryId,
        allocated: allocation.amount,
        spent,
        remaining: allocation.amount - spent
      };
    });
    const totalSpent = categoryPerformance.reduce((sum, cat) => sum + cat.spent, 0);
    const totalRemaining = totalAllocated - totalSpent;
    return {
      allocated: totalAllocated,
      spent: totalSpent,
      remaining: totalRemaining,
      categories: categoryPerformance
    };
  }
};
var storage = new MemStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  currency: text("currency").default("XAF"),
  role: text("role").default("user")
});
var expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  isSystem: boolean("is_system").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var expenseSubcategories = pgTable("expense_subcategories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => expenseCategories.id),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  isSystem: boolean("is_system").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var incomeCategories = pgTable("income_categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  isSystem: boolean("is_system").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var incomeSubcategories = pgTable("income_subcategories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => incomeCategories.id),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  isSystem: boolean("is_system").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: doublePrecision("amount").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  categoryId: integer("category_id").notNull().references(() => expenseCategories.id),
  subcategoryId: integer("subcategory_id").references(() => expenseSubcategories.id),
  merchant: text("merchant"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var incomes = pgTable("incomes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: doublePrecision("amount").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  categoryId: integer("category_id").notNull().references(() => incomeCategories.id),
  subcategoryId: integer("subcategory_id").references(() => incomeSubcategories.id),
  source: text("source"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  period: text("period").notNull().default("monthly"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  amount: doublePrecision("amount").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var budgetAllocations = pgTable("budget_allocations", {
  id: serial("id").primaryKey(),
  budgetId: integer("budget_id").notNull().references(() => budgets.id),
  categoryId: integer("category_id").notNull().references(() => expenseCategories.id),
  subcategoryId: integer("subcategory_id").references(() => expenseSubcategories.id),
  amount: doublePrecision("amount").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true
});
var insertExpenseCategorySchema = createInsertSchema(expenseCategories).pick({
  name: true,
  description: true
});
var insertExpenseSubcategorySchema = createInsertSchema(expenseSubcategories).pick({
  categoryId: true,
  name: true,
  description: true
});
var insertIncomeCategorySchema = createInsertSchema(incomeCategories).pick({
  name: true,
  description: true
});
var insertIncomeSubcategorySchema = createInsertSchema(incomeSubcategories).pick({
  categoryId: true,
  name: true,
  description: true
});
var legacyInsertExpenseSchema = createInsertSchema(expenses).pick({
  amount: true,
  description: true,
  date: true,
  merchant: true,
  notes: true
}).extend({
  category: z.string()
  // For backward compatibility
});
var insertExpenseSchema = createInsertSchema(expenses).pick({
  amount: true,
  description: true,
  date: true,
  categoryId: true,
  subcategoryId: true,
  merchant: true,
  notes: true
});
var insertIncomeSchema = createInsertSchema(incomes).pick({
  amount: true,
  description: true,
  date: true,
  categoryId: true,
  subcategoryId: true,
  source: true,
  notes: true
});
var insertBudgetSchema = createInsertSchema(budgets).pick({
  name: true,
  period: true,
  startDate: true,
  endDate: true,
  amount: true,
  notes: true
});
var insertBudgetAllocationSchema = createInsertSchema(budgetAllocations).pick({
  budgetId: true,
  categoryId: true,
  subcategoryId: true,
  amount: true
});
var clientExpenseSchema = insertExpenseSchema.extend({
  date: z.union([z.date(), z.string().min(1).pipe(z.coerce.date())])
});
var clientIncomeSchema = insertIncomeSchema.extend({
  date: z.union([z.date(), z.string().min(1).pipe(z.coerce.date())])
});
var clientBudgetSchema = insertBudgetSchema.extend({
  startDate: z.union([z.date(), z.string().min(1).pipe(z.coerce.date())]),
  endDate: z.union([z.date(), z.string().min(1).pipe(z.coerce.date())])
});

// server/auth.ts
import { z as z2 } from "zod";
import { fromZodError } from "zod-validation-error";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  if (!process.env.SESSION_SECRET) {
    console.warn("No SESSION_SECRET env var set, using a default value");
  }
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "ExpenseTrack-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1e3 * 60 * 60 * 24 * 7
      // 1 week
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser({
        ...userData,
        password: await hashPassword(userData.password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.login(user, (err2) => {
        if (err2) return next(err2);
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}

// server/routes.ts
import { ZodError } from "zod";
import { fromZodError as fromZodError2 } from "zod-validation-error";
var requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401);
  }
  next();
};
var requireAdmin = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401);
  }
  const userRole = await storage.getUserRole(req.user.id);
  if (userRole !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/expense-categories", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getExpenseCategories(req.user.id);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching expense categories:", error);
      res.status(500).json({ message: "Failed to fetch expense categories" });
    }
  });
  app2.post("/api/expense-categories", requireAuth, async (req, res) => {
    try {
      const categoryData = insertExpenseCategorySchema.parse(req.body);
      const category = await storage.createExpenseCategory(req.user.id, categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError2(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating expense category:", error);
        res.status(500).json({ message: "Failed to create expense category" });
      }
    }
  });
  app2.patch("/api/expense-categories/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getExpenseCategoryById(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      if (category.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this category" });
      }
      const categoryData = insertExpenseCategorySchema.parse(req.body);
      const updatedCategory = await storage.updateExpenseCategory(id, categoryData);
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError2(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating expense category:", error);
        res.status(500).json({ message: "Failed to update expense category" });
      }
    }
  });
  app2.delete("/api/expense-categories/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getExpenseCategoryById(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      if (category.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this category" });
      }
      await storage.deleteExpenseCategory(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting expense category:", error);
      res.status(500).json({ message: "Failed to delete expense category", error: error.message });
    }
  });
  app2.get("/api/expense-categories/:categoryId/subcategories", requireAuth, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const category = await storage.getExpenseCategoryById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      if (category.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this category" });
      }
      const subcategories = await storage.getExpenseSubcategories(categoryId);
      res.json(subcategories);
    } catch (error) {
      console.error("Error fetching expense subcategories:", error);
      res.status(500).json({ message: "Failed to fetch expense subcategories" });
    }
  });
  app2.post("/api/expense-subcategories", requireAuth, async (req, res) => {
    try {
      const subcategoryData = insertExpenseSubcategorySchema.parse(req.body);
      const category = await storage.getExpenseCategoryById(subcategoryData.categoryId);
      if (!category || category.userId !== req.user.id) {
        return res.status(403).json({ message: "Invalid category" });
      }
      const subcategory = await storage.createExpenseSubcategory(req.user.id, subcategoryData);
      res.status(201).json(subcategory);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError2(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating expense subcategory:", error);
        res.status(500).json({ message: "Failed to create expense subcategory" });
      }
    }
  });
  app2.patch("/api/expense-subcategories/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subcategory = await storage.getExpenseSubcategoryById(id);
      if (!subcategory) {
        return res.status(404).json({ message: "Subcategory not found" });
      }
      if (subcategory.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this subcategory" });
      }
      const subcategoryData = insertExpenseSubcategorySchema.parse(req.body);
      const category = await storage.getExpenseCategoryById(subcategoryData.categoryId);
      if (!category || category.userId !== req.user.id) {
        return res.status(403).json({ message: "Invalid category" });
      }
      const updatedSubcategory = await storage.updateExpenseSubcategory(id, subcategoryData);
      res.json(updatedSubcategory);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError2(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating expense subcategory:", error);
        res.status(500).json({ message: "Failed to update expense subcategory" });
      }
    }
  });
  app2.delete("/api/expense-subcategories/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subcategory = await storage.getExpenseSubcategoryById(id);
      if (!subcategory) {
        return res.status(404).json({ message: "Subcategory not found" });
      }
      if (subcategory.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this subcategory" });
      }
      await storage.deleteExpenseSubcategory(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting expense subcategory:", error);
      res.status(500).json({ message: "Failed to delete expense subcategory", error: error.message });
    }
  });
  app2.get("/api/income-categories", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getIncomeCategories(req.user.id);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching income categories:", error);
      res.status(500).json({ message: "Failed to fetch income categories" });
    }
  });
  app2.post("/api/income-categories", requireAuth, async (req, res) => {
    try {
      const categoryData = insertIncomeCategorySchema.parse(req.body);
      const category = await storage.createIncomeCategory(req.user.id, categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError2(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating income category:", error);
        res.status(500).json({ message: "Failed to create income category" });
      }
    }
  });
  app2.patch("/api/income-categories/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getIncomeCategoryById(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      if (category.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this category" });
      }
      const categoryData = insertIncomeCategorySchema.parse(req.body);
      const updatedCategory = await storage.updateIncomeCategory(id, categoryData);
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError2(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating income category:", error);
        res.status(500).json({ message: "Failed to update income category" });
      }
    }
  });
  app2.delete("/api/income-categories/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getIncomeCategoryById(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      if (category.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this category" });
      }
      await storage.deleteIncomeCategory(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting income category:", error);
      res.status(500).json({ message: "Failed to delete income category", error: error.message });
    }
  });
  app2.get("/api/income-categories/:categoryId/subcategories", requireAuth, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const category = await storage.getIncomeCategoryById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      if (category.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this category" });
      }
      const subcategories = await storage.getIncomeSubcategories(categoryId);
      res.json(subcategories);
    } catch (error) {
      console.error("Error fetching income subcategories:", error);
      res.status(500).json({ message: "Failed to fetch income subcategories" });
    }
  });
  app2.post("/api/income-subcategories", requireAuth, async (req, res) => {
    try {
      const subcategoryData = insertIncomeSubcategorySchema.parse(req.body);
      const category = await storage.getIncomeCategoryById(subcategoryData.categoryId);
      if (!category || category.userId !== req.user.id) {
        return res.status(403).json({ message: "Invalid category" });
      }
      const subcategory = await storage.createIncomeSubcategory(req.user.id, subcategoryData);
      res.status(201).json(subcategory);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError2(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating income subcategory:", error);
        res.status(500).json({ message: "Failed to create income subcategory" });
      }
    }
  });
  app2.patch("/api/income-subcategories/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subcategory = await storage.getIncomeSubcategoryById(id);
      if (!subcategory) {
        return res.status(404).json({ message: "Subcategory not found" });
      }
      if (subcategory.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this subcategory" });
      }
      const subcategoryData = insertIncomeSubcategorySchema.parse(req.body);
      const category = await storage.getIncomeCategoryById(subcategoryData.categoryId);
      if (!category || category.userId !== req.user.id) {
        return res.status(403).json({ message: "Invalid category" });
      }
      const updatedSubcategory = await storage.updateIncomeSubcategory(id, subcategoryData);
      res.json(updatedSubcategory);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError2(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating income subcategory:", error);
        res.status(500).json({ message: "Failed to update income subcategory" });
      }
    }
  });
  app2.delete("/api/income-subcategories/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subcategory = await storage.getIncomeSubcategoryById(id);
      if (!subcategory) {
        return res.status(404).json({ message: "Subcategory not found" });
      }
      if (subcategory.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this subcategory" });
      }
      await storage.deleteIncomeSubcategory(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting income subcategory:", error);
      res.status(500).json({ message: "Failed to delete income subcategory", error: error.message });
    }
  });
  app2.get("/api/expenses", requireAuth, async (req, res) => {
    try {
      const expenses2 = await storage.getExpensesByUserId(req.user.id);
      const augmentedExpenses = await Promise.all(expenses2.map(async (expense) => {
        const category = await storage.getExpenseCategoryById(expense.categoryId);
        let subcategory = null;
        if (expense.subcategoryId) {
          subcategory = await storage.getExpenseSubcategoryById(expense.subcategoryId);
        }
        return {
          ...expense,
          categoryName: category?.name || "Unknown",
          subcategoryName: subcategory?.name || null
        };
      }));
      res.json(augmentedExpenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });
  app2.post("/api/expenses", requireAuth, async (req, res) => {
    try {
      const data = req.body;
      if (data.date && typeof data.date === "string") {
        data.date = new Date(data.date);
      }
      let expense;
      if ("category" in data) {
        const expenseData = legacyInsertExpenseSchema.parse(data);
        expense = await storage.createLegacyExpense({
          ...expenseData,
          userId: req.user.id
        });
      } else {
        const expenseData = insertExpenseSchema.parse(data);
        const category = await storage.getExpenseCategoryById(expenseData.categoryId);
        const userRole = await storage.getUserRole(req.user.id);
        if (!category || category.userId !== req.user.id && userRole !== "admin") {
          return res.status(403).json({ message: "Invalid category" });
        }
        if (expenseData.subcategoryId) {
          const subcategory = await storage.getExpenseSubcategoryById(expenseData.subcategoryId);
          if (!subcategory || subcategory.categoryId !== expenseData.categoryId) {
            return res.status(403).json({ message: "Invalid subcategory" });
          }
        }
        expense = await storage.createExpense({
          ...expenseData,
          userId: req.user.id
        });
      }
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError2(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating expense:", error);
        res.status(500).json({ message: "Failed to create expense" });
      }
    }
  });
  app2.get("/api/expenses/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expense = await storage.getExpenseById(id);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      if (expense.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this expense" });
      }
      res.json(expense);
    } catch (error) {
      console.error("Error fetching expense:", error);
      res.status(500).json({ message: "Failed to fetch expense" });
    }
  });
  app2.patch("/api/expenses/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expense = await storage.getExpenseById(id);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      const userRole = await storage.getUserRole(req.user.id);
      if (expense.userId !== req.user.id && userRole !== "admin") {
        return res.status(403).json({ message: "You don't have permission to update this expense" });
      }
      const data = req.body;
      if (data.date && typeof data.date === "string") {
        data.date = new Date(data.date);
      }
      let updatedExpense;
      if ("category" in data) {
        const expenseData = legacyInsertExpenseSchema.parse(data);
        updatedExpense = await storage.updateLegacyExpense(id, {
          ...expenseData,
          userId: req.user.id
        });
      } else {
        const expenseData = insertExpenseSchema.parse(data);
        const categoryUserRole = await storage.getUserRole(req.user.id);
        const category = await storage.getExpenseCategoryById(expenseData.categoryId);
        if (!category || category.userId !== req.user.id && categoryUserRole !== "admin") {
          return res.status(403).json({ message: "Invalid category" });
        }
        if (expenseData.subcategoryId) {
          const subcategory = await storage.getExpenseSubcategoryById(expenseData.subcategoryId);
          if (!subcategory || subcategory.categoryId !== expenseData.categoryId) {
            return res.status(403).json({ message: "Invalid subcategory" });
          }
        }
        updatedExpense = await storage.updateExpense(id, {
          ...expenseData,
          userId: req.user.id
        });
      }
      res.json(updatedExpense);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError2(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating expense:", error);
        res.status(500).json({ message: "Failed to update expense" });
      }
    }
  });
  app2.delete("/api/expenses/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expense = await storage.getExpenseById(id);
      const userRole = await storage.getUserRole(req.user.id);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      if (expense.userId !== req.user.id && userRole !== "admin") {
        return res.status(403).json({ message: "You don't have permission to delete this expense" });
      }
      await storage.deleteExpense(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });
  app2.get("/api/incomes", requireAuth, async (req, res) => {
    try {
      const incomes2 = await storage.getIncomesByUserId(req.user.id);
      const augmentedIncomes = await Promise.all(incomes2.map(async (income) => {
        const category = await storage.getIncomeCategoryById(income.categoryId);
        let subcategory = null;
        if (income.subcategoryId) {
          subcategory = await storage.getIncomeSubcategoryById(income.subcategoryId);
        }
        return {
          ...income,
          categoryName: category?.name || "Unknown",
          subcategoryName: subcategory?.name || null
        };
      }));
      res.json(augmentedIncomes);
    } catch (error) {
      console.error("Error fetching incomes:", error);
      res.status(500).json({ message: "Failed to fetch incomes" });
    }
  });
  app2.post("/api/incomes", requireAuth, async (req, res) => {
    try {
      const data = req.body;
      if (data.date && typeof data.date === "string") {
        data.date = new Date(data.date);
      }
      const incomeData = insertIncomeSchema.parse(data);
      const category = await storage.getIncomeCategoryById(incomeData.categoryId);
      if (!category || category.userId !== req.user.id) {
        return res.status(403).json({ message: "Invalid category" });
      }
      if (incomeData.subcategoryId) {
        const subcategory = await storage.getIncomeSubcategoryById(incomeData.subcategoryId);
        if (!subcategory || subcategory.categoryId !== incomeData.categoryId) {
          return res.status(403).json({ message: "Invalid subcategory" });
        }
      }
      const income = await storage.createIncome({
        ...incomeData,
        userId: req.user.id
      });
      res.status(201).json(income);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError2(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating income:", error);
        res.status(500).json({ message: "Failed to create income" });
      }
    }
  });
  app2.get("/api/incomes/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const income = await storage.getIncomeById(id);
      if (!income) {
        return res.status(404).json({ message: "Income not found" });
      }
      if (income.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this income" });
      }
      res.json(income);
    } catch (error) {
      console.error("Error fetching income:", error);
      res.status(500).json({ message: "Failed to fetch income" });
    }
  });
  app2.patch("/api/incomes/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const income = await storage.getIncomeById(id);
      if (!income) {
        return res.status(404).json({ message: "Income not found" });
      }
      if (income.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this income" });
      }
      const data = req.body;
      if (data.date && typeof data.date === "string") {
        data.date = new Date(data.date);
      }
      const incomeData = insertIncomeSchema.parse(data);
      const category = await storage.getIncomeCategoryById(incomeData.categoryId);
      if (!category || category.userId !== req.user.id) {
        return res.status(403).json({ message: "Invalid category" });
      }
      if (incomeData.subcategoryId) {
        const subcategory = await storage.getIncomeSubcategoryById(incomeData.subcategoryId);
        if (!subcategory || subcategory.categoryId !== incomeData.categoryId) {
          return res.status(403).json({ message: "Invalid subcategory" });
        }
      }
      const updatedIncome = await storage.updateIncome(id, {
        ...incomeData,
        userId: req.user.id
      });
      res.json(updatedIncome);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError2(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating income:", error);
        res.status(500).json({ message: "Failed to update income" });
      }
    }
  });
  app2.delete("/api/incomes/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const income = await storage.getIncomeById(id);
      if (!income) {
        return res.status(404).json({ message: "Income not found" });
      }
      if (income.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this income" });
      }
      await storage.deleteIncome(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting income:", error);
      res.status(500).json({ message: "Failed to delete income" });
    }
  });
  app2.get("/api/budgets", requireAuth, async (req, res) => {
    try {
      const budgets2 = await storage.getBudgetsByUserId(req.user.id);
      res.json(budgets2);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });
  app2.post("/api/budgets", requireAuth, async (req, res) => {
    try {
      const data = req.body;
      if (data.startDate && typeof data.startDate === "string") {
        data.startDate = new Date(data.startDate);
      }
      if (data.endDate && typeof data.endDate === "string") {
        data.endDate = new Date(data.endDate);
      }
      const categoryIds = data.categoryIds;
      delete data.categoryIds;
      const budgetData = insertBudgetSchema.parse(data);
      const budget = await storage.createBudget({
        ...budgetData,
        userId: req.user.id
      });
      if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
        const budgetId = budget.id;
        for (const categoryId of categoryIds) {
          const category = await storage.getExpenseCategoryById(categoryId);
          if (category && category.userId === req.user.id) {
            await storage.createBudgetAllocation({
              budgetId,
              categoryId,
              subcategoryId: null,
              amount: 0
            });
          }
        }
      }
      res.status(201).json(budget);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError2(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating budget:", error);
        res.status(500).json({ message: "Failed to create budget" });
      }
    }
  });
  app2.get("/api/budgets/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const budget = await storage.getBudgetById(id);
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      if (budget.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this budget" });
      }
      const allocations = await storage.getBudgetAllocations(id);
      const performance = await storage.getBudgetPerformance(id);
      res.json({
        budget,
        allocations,
        performance
      });
    } catch (error) {
      console.error("Error fetching budget:", error);
      res.status(500).json({ message: "Failed to fetch budget" });
    }
  });
  app2.patch("/api/budgets/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const budget = await storage.getBudgetById(id);
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      if (budget.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this budget" });
      }
      const data = req.body;
      if (data.startDate && typeof data.startDate === "string") {
        data.startDate = new Date(data.startDate);
      }
      if (data.endDate && typeof data.endDate === "string") {
        data.endDate = new Date(data.endDate);
      }
      const budgetData = insertBudgetSchema.parse(data);
      const updatedBudget = await storage.updateBudget(id, budgetData);
      res.json(updatedBudget);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError2(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating budget:", error);
        res.status(500).json({ message: "Failed to update budget" });
      }
    }
  });
  app2.delete("/api/budgets/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const budget = await storage.getBudgetById(id);
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      if (budget.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this budget" });
      }
      await storage.deleteBudget(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting budget:", error);
      res.status(500).json({ message: "Failed to delete budget" });
    }
  });
  app2.get("/api/budgets/:budgetId/allocations", requireAuth, async (req, res) => {
    try {
      const budgetId = parseInt(req.params.budgetId);
      const budget = await storage.getBudgetById(budgetId);
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      if (budget.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this budget" });
      }
      const allocations = await storage.getBudgetAllocations(budgetId);
      res.json(allocations);
    } catch (error) {
      console.error("Error fetching budget allocations:", error);
      res.status(500).json({ message: "Failed to fetch budget allocations" });
    }
  });
  app2.get("/api/budgets/:budgetId/performance", requireAuth, async (req, res) => {
    try {
      const budgetId = parseInt(req.params.budgetId);
      const budget = await storage.getBudgetById(budgetId);
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      if (budget.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this budget" });
      }
      const performance = await storage.getBudgetPerformance(budgetId);
      res.json(performance);
    } catch (error) {
      console.error("Error fetching budget performance:", error);
      res.status(500).json({ message: "Failed to fetch budget performance" });
    }
  });
  app2.post("/api/budget-allocations", requireAuth, async (req, res) => {
    try {
      const allocationData = insertBudgetAllocationSchema.parse(req.body);
      const budget = await storage.getBudgetById(allocationData.budgetId);
      if (!budget || budget.userId !== req.user.id) {
        return res.status(403).json({ message: "Invalid budget" });
      }
      const category = await storage.getExpenseCategoryById(allocationData.categoryId);
      if (!category || category.userId !== req.user.id) {
        return res.status(403).json({ message: "Invalid category" });
      }
      if (allocationData.subcategoryId) {
        const subcategory = await storage.getExpenseSubcategoryById(allocationData.subcategoryId);
        if (!subcategory || subcategory.categoryId !== allocationData.categoryId) {
          return res.status(403).json({ message: "Invalid subcategory" });
        }
      }
      const allocation = await storage.createBudgetAllocation(allocationData);
      res.status(201).json(allocation);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError2(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating budget allocation:", error);
        res.status(500).json({ message: "Failed to create budget allocation" });
      }
    }
  });
  app2.patch("/api/budget-allocations/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const allocationData = insertBudgetAllocationSchema.parse(req.body);
      const budget = await storage.getBudgetById(allocationData.budgetId);
      if (!budget || budget.userId !== req.user.id) {
        return res.status(403).json({ message: "Invalid budget" });
      }
      const category = await storage.getExpenseCategoryById(allocationData.categoryId);
      if (!category || category.userId !== req.user.id) {
        return res.status(403).json({ message: "Invalid category" });
      }
      if (allocationData.subcategoryId) {
        const subcategory = await storage.getExpenseSubcategoryById(allocationData.subcategoryId);
        if (!subcategory || subcategory.categoryId !== allocationData.categoryId) {
          return res.status(403).json({ message: "Invalid subcategory" });
        }
      }
      const updatedAllocation = await storage.updateBudgetAllocation(id, allocationData);
      res.json(updatedAllocation);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError2(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating budget allocation:", error);
        res.status(500).json({ message: "Failed to update budget allocation" });
      }
    }
  });
  app2.delete("/api/budget-allocations/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBudgetAllocation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting budget allocation:", error);
      res.status(500).json({ message: "Failed to delete budget allocation" });
    }
  });
  app2.get("/api/reports/monthly-expenses/:year", requireAuth, async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const monthlyExpenses = await storage.getMonthlyExpenseTotals(req.user.id, year);
      res.json(monthlyExpenses);
    } catch (error) {
      console.error("Error fetching monthly expense report:", error);
      res.status(500).json({ message: "Failed to fetch monthly expense report" });
    }
  });
  app2.get("/api/reports/category-expenses", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      const categoryExpenses = await storage.getCategoryExpenseTotals(req.user.id, start, end);
      res.json(categoryExpenses);
    } catch (error) {
      console.error("Error fetching category expense report:", error);
      res.status(500).json({ message: "Failed to fetch category expense report" });
    }
  });
  app2.get("/api/reports/monthly-incomes/:year", requireAuth, async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const monthlyIncomes = await storage.getMonthlyIncomeTotals(req.user.id, year);
      res.json(monthlyIncomes);
    } catch (error) {
      console.error("Error fetching monthly income report:", error);
      res.status(500).json({ message: "Failed to fetch monthly income report" });
    }
  });
  app2.get("/api/reports/category-incomes", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      const categoryIncomes = await storage.getCategoryIncomeTotals(req.user.id, start, end);
      res.json(categoryIncomes);
    } catch (error) {
      console.error("Error fetching category income report:", error);
      res.status(500).json({ message: "Failed to fetch category income report" });
    }
  });
  app2.get("/api/reports/budget-performance/:budgetId", requireAuth, async (req, res) => {
    try {
      const budgetId = parseInt(req.params.budgetId);
      const budget = await storage.getBudgetById(budgetId);
      if (!budget || budget.userId !== req.user.id) {
        return res.status(403).json({ message: "Invalid budget" });
      }
      const performance = await storage.getBudgetPerformance(budgetId);
      res.json(performance);
    } catch (error) {
      console.error("Error fetching budget performance:", error);
      res.status(500).json({ message: "Failed to fetch budget performance" });
    }
  });
  app2.patch("/api/user/settings", requireAuth, async (req, res) => {
    try {
      const { currency } = req.body;
      const updatedUser = await storage.updateUserSettings(req.user.id, { currency });
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(500).json({ message: "Failed to update user settings" });
    }
  });
  app2.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const safeUsers = users2.map(({ password, ...user }) => ({
        ...user,
        role: storage.getUserRole(user.id)
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/admin/expenses", requireAdmin, async (req, res) => {
    try {
      const expenses2 = await storage.getAllExpenses();
      res.json(expenses2);
    } catch (error) {
      console.error("Error fetching all expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });
  app2.get("/api/admin/incomes", requireAdmin, async (req, res) => {
    try {
      const incomes2 = await storage.getAllIncomes();
      res.json(incomes2);
    } catch (error) {
      console.error("Error fetching all incomes:", error);
      res.status(500).json({ message: "Failed to fetch incomes" });
    }
  });
  app2.get("/api/admin/budgets", requireAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const allBudgets = [];
      for (const user of users2) {
        const budgets2 = await storage.getBudgetsByUserId(user.id);
        const augmentedBudgets = budgets2.map((budget) => ({
          ...budget,
          userName: user.name,
          userEmail: user.email
        }));
        allBudgets.push(...augmentedBudgets);
      }
      res.json(allBudgets);
    } catch (error) {
      console.error("Error fetching all budgets:", error);
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });
  app2.patch("/api/admin/users/:id/role", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;
      if (!role || !["admin", "user"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      await storage.setUserRole(userId, role);
      res.status(200).json({ message: "User role updated" });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });
  app2.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (userId === req.user.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = Number(process.env.port) || 8080;
  const host = "127.0.0.1";
  server.listen(port, host, () => {
    console.log(`Server running on port at http://${host}:${port}`);
  });
})();
