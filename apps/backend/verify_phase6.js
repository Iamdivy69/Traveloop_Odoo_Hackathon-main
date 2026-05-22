const BASE_URL = 'http://localhost:3000/api/v1';

async function runTests() {
  console.log('=== Starting Phase 6 (Expense & Financial) Verification ===');
  
  let passed = [];
  let failed = [];
  let warnings = [];
  let criticalIssues = [];
  
  // Helper for requests
  async function api(path, options = {}) {
    const url = `${BASE_URL}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    const res = await fetch(url, {
      ...options,
      headers,
    });
    const status = res.status;
    let data;
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }
    return { status, data };
  }

  // 1. Setup - Register users
  console.log('\n[Setup] Registering test users...');
  const suffix = Math.floor(Math.random() * 100000);
  const userAEmail = `exp_a_${suffix}@traveloop.test`;
  const userBEmail = `exp_b_${suffix}@traveloop.test`;
  const userCEmail = `exp_c_${suffix}@traveloop.test`;
  
  const regA = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'User A', email: userAEmail, password: 'SecurePassword123!' })
  });
  
  const regB = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'User B', email: userBEmail, password: 'SecurePassword123!' })
  });

  const regC = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'User C', email: userCEmail, password: 'SecurePassword123!' })
  });

  if (regA.status !== 201 || regB.status !== 201 || regC.status !== 201) {
    console.error('Failed to register users:', regA, regB, regC);
    process.exit(1);
  }

  const tokenA = regA.data.data.token;
  const userIdA = regA.data.data.user.id;
  const tokenB = regB.data.data.token;
  const userIdB = regB.data.data.user.id;
  const tokenC = regC.data.data.token;
  const userIdC = regC.data.data.user.id;

  const authA = { headers: { 'Authorization': `Bearer ${tokenA}` } };
  const authB = { headers: { 'Authorization': `Bearer ${tokenB}` } };

  // Create a Trip
  console.log('[Setup] Creating a trip...');
  const tripRes = await api('/trips', {
    method: 'POST',
    body: JSON.stringify({ name: 'Goa Split Trip' }),
    ...authA
  });

  if (tripRes.status !== 201) {
    console.error('Failed to create trip:', tripRes);
    process.exit(1);
  }
  const tripId = tripRes.data.data.id;

  // -------------------------------------------------------------
  // TC-EXP-01: Create Expense — Happy Path
  // -------------------------------------------------------------
  console.log('\n--- Running TC-EXP-01: Create Expense Happy Path ---');
  try {
    const expenseData = {
      title: 'Resort stay',
      amount: 12000,
      currency: 'INR',
      category: 'ACCOMMODATION',
      splits: [
        { userId: userIdA, amount: 6000 },
        { userId: userIdB, amount: 6000 }
      ]
    };

    const res = await api(`/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(expenseData),
      ...authA
    });

    if (res.status === 201 && res.data.success) {
      const exp = res.data.data;
      if (exp.amount == 12000 && exp.paid_by_id === userIdA && exp.splits.length === 2) {
        passed.push('TC-EXP-01');
        console.log('✅ TC-EXP-01 Passed');
      } else {
        failed.push('TC-EXP-01: Incorrect expense properties returned');
      }
    } else {
      failed.push(`TC-EXP-01: Status ${res.status}, response: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    failed.push(`TC-EXP-01 Exception: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TC-EXP-02: Create Expense — Validation Failure
  // -------------------------------------------------------------
  console.log('\n--- Running TC-EXP-02: Create Expense Validation ---');
  try {
    let subtests = [];
    
    // Negative amount
    const resNeg = await api(`/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Negative', amount: -500, category: 'FOOD' }),
      ...authA
    });
    subtests.push(resNeg.status === 400);

    // Zero amount
    const resZero = await api(`/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Zero', amount: 0, category: 'FOOD' }),
      ...authA
    });
    subtests.push(resZero.status === 400);

    // Invalid category
    const resCat = await api(`/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Bad Cat', amount: 100, category: 'INVALID_CATEGORY' }),
      ...authA
    });
    subtests.push(resCat.status === 400);

    // Malformed split total (splits don't match amount)
    const resSplit = await api(`/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Bad splits',
        amount: 100,
        category: 'FOOD',
        splits: [
          { userId: userIdA, amount: 40 },
          { userId: userIdB, amount: 40 }
        ]
      }),
      ...authA
    });
    subtests.push(resSplit.status === 400);

    // Transaction Rollback Check: Verify no expense was created for the bad splits payload
    // Let's check DB list
    const listRes = await api(`/trips/${tripId}/expenses`, authA);
    const hasBadSplitExpense = listRes.data.data.some(e => e.title === 'Bad splits');
    subtests.push(!hasBadSplitExpense);

    if (subtests.every(x => x)) {
      passed.push('TC-EXP-02');
      console.log('✅ TC-EXP-02 Passed');
    } else {
      failed.push(`TC-EXP-02: Some validation cases failed. Results: ${JSON.stringify(subtests)}`);
    }
  } catch (err) {
    failed.push(`TC-EXP-02 Exception: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TC-EXP-03: Expense Split Calculations
  // -------------------------------------------------------------
  console.log('\n--- Running TC-EXP-03: Split Calculations ---');
  try {
    let splitSubtests = [];
    
    // Equal split check with 3 users (decimal uneven splits)
    // 100 divided by 3: 33.33, 33.33, 33.34
    const unevenExpense = await api(`/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Uneven Split Test',
        amount: 100,
        category: 'ACTIVITY',
        splits: [
          { userId: userIdA, amount: 33.33 },
          { userId: userIdB, amount: 33.33 },
          { userId: userIdC, amount: 33.34 }
        ]
      }),
      ...authA
    });
    splitSubtests.push(unevenExpense.status === 201);

    // Small rounding drift check (e.g. 33.33 * 3 = 99.99, difference is 0.01, which is allowed by service limit <= 0.01)
    const driftExpense = await api(`/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Drift Split Test',
        amount: 100,
        category: 'ACTIVITY',
        splits: [
          { userId: userIdA, amount: 33.33 },
          { userId: userIdB, amount: 33.33 },
          { userId: userIdC, amount: 33.33 }
        ]
      }),
      ...authA
    });
    // This should pass because Math.abs(99.99 - 100) = 0.01 <= 0.01
    splitSubtests.push(driftExpense.status === 201);

    // Over-tolerance check (difference is 0.02, e.g. 33.33 * 3 = 99.99 for a 100.01 amount)
    const badDriftExpense = await api(`/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Bad Drift Split Test',
        amount: 100.02,
        category: 'ACTIVITY',
        splits: [
          { userId: userIdA, amount: 33.33 },
          { userId: userIdB, amount: 33.33 },
          { userId: userIdC, amount: 33.33 }
        ]
      }),
      ...authA
    });
    // Math.abs(99.99 - 100.02) = 0.03 > 0.01, should fail with 400
    splitSubtests.push(badDriftExpense.status === 400);

    if (splitSubtests.every(x => x)) {
      passed.push('TC-EXP-03');
      console.log('✅ TC-EXP-03 Passed');
    } else {
      failed.push(`TC-EXP-03: Split calculations failed. Results: ${JSON.stringify(splitSubtests)}`);
    }
  } catch (err) {
    failed.push(`TC-EXP-03 Exception: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TC-EXP-04: Expense Summary & Balances
  // -------------------------------------------------------------
  console.log('\n--- Running TC-EXP-04: Summary & Balances ---');
  try {
    // Current expenses in DB for tripId:
    // 1. Resort Stay: 12000 paid by A, splits: A (6000), B (6000)
    // 2. Uneven Split: 100 paid by A, splits: A (33.33), B (33.33), C (33.34)
    // 3. Drift Split: 100 paid by A, splits: A (33.33), B (33.33), C (33.33)
    // Total spent paid by A = 12000 + 100 + 100 = 12200
    // Balances calculation:
    // A paid: 12200, owes: 6000 + 33.33 + 33.33 = 6066.66. Net balance A = +6133.34
    // B paid: 0, owes: 6000 + 33.33 + 33.33 = 6066.66. Net balance B = -6066.66
    // C paid: 0, owes: 0 + 33.34 + 33.33 = 66.67. Net balance C = -66.67
    
    const summaryRes = await api(`/trips/${tripId}/expenses/summary`, authA);

    if (summaryRes.status === 200) {
      const summary = summaryRes.data.data;
      console.log('Total Spent returned:', summary.totalSpent);
      console.log('Category breakdown:', JSON.stringify(summary.byCategory));
      console.log('Balances breakdown:', JSON.stringify(summary.byPerson));
      
      const aBalance = summary.byPerson.find(p => p.id === userIdA);
      const bBalance = summary.byPerson.find(p => p.id === userIdB);
      const cBalance = summary.byPerson.find(p => p.id === userIdC);

      const aCorrect = aBalance && Math.abs(aBalance.balance - 6133.34) < 0.05;
      const bCorrect = bBalance && Math.abs(bBalance.balance - (-6066.66)) < 0.05;
      const cCorrect = cBalance && Math.abs(cBalance.balance - (-66.67)) < 0.05;

      if (summary.totalSpent === 12200 && aCorrect && bCorrect && cCorrect) {
        passed.push('TC-EXP-04');
        console.log('✅ TC-EXP-04 Passed');
      } else {
        failed.push(`TC-EXP-04: Calculations incorrect. A: ${aBalance?.balance}, B: ${bBalance?.balance}, C: ${cBalance?.balance}`);
      }
    } else {
      failed.push(`TC-EXP-04: Summary API status ${summaryRes.status}`);
    }

    // MULTI-CURRENCY WARNING CHECK
    // Create an expense in USD for $100
    console.log('[Multi-Currency Test] Adding $100 USD expense...');
    const usdExpense = await api(`/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'USD Dinner',
        amount: 100,
        currency: 'USD',
        category: 'FOOD'
      }),
      ...authA
    });

    const newSummaryRes = await api(`/trips/${tripId}/expenses/summary`, authA);
    if (newSummaryRes.status === 200) {
      const newSummary = newSummaryRes.data.data;
      console.log(`New total spent with USD: ${newSummary.totalSpent} (Previous 12200 + 100 USD)`);
      if (newSummary.totalSpent === 12300) {
        warnings.push('Multi-currency bug verified: USD amount summed directly into INR total spent without conversion.');
        criticalIssues.push('CRITICAL: Financial currency mismatch! USD amounts are directly added to INR amounts in the trip summary.');
      }
    }
  } catch (err) {
    failed.push(`TC-EXP-04 Exception: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TC-EXP-05: Expense Editing & Deletion
  // -------------------------------------------------------------
  console.log('\n--- Running TC-EXP-05: Editing & Deletion ---');
  try {
    let subtests = [];
    
    // Create a throwaway expense
    const throwaway = await api(`/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Throwaway hotel',
        amount: 3000,
        category: 'ACCOMMODATION',
        splits: [
          { userId: userIdA, amount: 1500 },
          { userId: userIdB, amount: 1500 }
        ]
      }),
      ...authA
    });
    
    const expId = throwaway.data.data.id;
    
    // Edit the expense title & amount to 4000
    const editRes = await api(`/trips/${tripId}/expenses/${expId}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: 'Updated hotel name',
        amount: 4000
      }),
      ...authA
    });
    subtests.push(editRes.status === 200 && editRes.data.data.title === 'Updated hotel name');

    // Delete the expense
    const delRes = await api(`/trips/${tripId}/expenses/${expId}`, {
      method: 'DELETE',
      ...authA
    });
    subtests.push(delRes.status === 200);

    // Verify it is gone
    const listRes = await api(`/trips/${tripId}/expenses`, authA);
    const exists = listRes.data.data.some(e => e.id === expId);
    subtests.push(!exists);

    if (subtests.every(x => x)) {
      passed.push('TC-EXP-05');
      console.log('✅ TC-EXP-05 Passed');
    } else {
      failed.push(`TC-EXP-05: Editing/deletion failed. Subtests: ${JSON.stringify(subtests)}`);
    }
  } catch (err) {
    failed.push(`TC-EXP-05 Exception: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TC-EXP-07: Edge Cases & Concurrency
  // -------------------------------------------------------------
  console.log('\n--- Running TC-EXP-07: Edge Cases & Concurrency ---');
  try {
    // Send 5 concurrent requests to create expenses
    console.log('Sending 5 concurrent expense creation requests...');
    const promises = Array.from({ length: 5 }).map((_, i) => {
      return api(`/trips/${tripId}/expenses`, {
        method: 'POST',
        body: JSON.stringify({
          title: `Concurrent Exp ${i}`,
          amount: 100,
          category: 'OTHER'
        }),
        ...authA
      });
    });

    const results = await Promise.all(promises);
    const allSuccessful = results.every(res => res.status === 201);
    
    if (allSuccessful) {
      passed.push('TC-EXP-07');
      console.log('✅ TC-EXP-07 Passed');
    } else {
      failed.push(`TC-EXP-07: Concurrent creation failed. Statuses: ${results.map(r => r.status).join(', ')}`);
    }
  } catch (err) {
    failed.push(`TC-EXP-07 Exception: ${err.message}`);
  }

  // Print results
  console.log('\n=== Phase 6 Verification Completed ===');
  console.log(`Passed: ${passed.join(', ')}`);
  console.log(`Failed: ${failed.join(', ')}`);
  console.log(`Warnings: ${warnings.join('\n')}`);
  console.log(`Critical Issues: ${criticalIssues.join('\n')}`);
}

runTests();
