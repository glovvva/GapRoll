/**
 * Solio Solver — greedy salary remediation optimizer.
 * Pure functions, no side effects. Art. 9 Dyrektywy 2023/970.
 */

export interface Employee {
  id: string;
  gender: "K" | "M";
  salary: number;
  department: string;
  position: string;
  evg_group: string;
  /** Optional 1–5 rating; used when performanceWeight > 0 for priority scoring */
  performance_rating?: number;
}

export interface SolioConstraints {
  targetGap: number; // e.g. 0.05 = 5%
  budgetLimit: number; // PLN
  minRaise: number; // PLN
  departmentFilter: string[] | "ALL"; // "ALL" or array of dept names
  lockSenior: boolean;
  /** 0–1; when > 0 and employee has performance_rating, used in priorityScore */
  performanceWeight?: number;
  /** IDs that MUST get a raise first (priority = Infinity) */
  lockedIds?: string[];
  /** IDs excluded from eligible list (no raise) */
  bannedIds?: string[];
}

export interface SolioRaise {
  id: string;
  oldSalary: number;
  newSalary: number;
  raise: number;
  department: string;
  position: string;
}

export interface SolioScenario {
  name: string;
  totalCost: number;
  affectedEmployees: number;
  newGap: number;
  raises: SolioRaise[];
  /** True if target gap was reached within budget */
  targetReached: boolean;
  /** Message when target not reached (budget exhausted or already below target) */
  message?: string;
}

const SENIOR_POSITION_PATTERN = /Dyrektor|Manager|Kierownik/i;

/** Male median salary per EVG group. */
function getMaleMedianByEvg(employees: Employee[]): Record<string, number> {
  const men = employees.filter((e) => e.gender === "M");
  const byEvg: Record<string, number[]> = {};
  for (const e of men) {
    if (!byEvg[e.evg_group]) byEvg[e.evg_group] = [];
    byEvg[e.evg_group].push(e.salary);
  }
  const out: Record<string, number> = {};
  for (const [evg, sal] of Object.entries(byEvg)) {
    out[evg] = median(sal);
  }
  return out;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Pay gap as (median_male - median_female) / median_male.
 * Returns 0 if no men (avoid div by zero).
 */
export function computeGap(employees: Employee[]): number {
  const men = employees.filter((e) => e.gender === "M").map((e) => e.salary);
  const women = employees.filter((e) => e.gender === "K").map((e) => e.salary);
  const medianM = median(men);
  const medianK = median(women);
  if (medianM <= 0) return 0;
  return (medianM - medianK) / medianM;
}

function applyRaises(
  employees: Employee[],
  raises: Map<string, number>
): Employee[] {
  return employees.map((e) => {
    const r = raises.get(e.id);
    return r != null ? { ...e, salary: e.salary + r } : e;
  });
}

function filterEmployees(
  employees: Employee[],
  constraints: SolioConstraints
): Employee[] {
  let list = employees;
  if (constraints.departmentFilter !== "ALL" && constraints.departmentFilter.length > 0) {
    const depts = new Set(constraints.departmentFilter);
    list = list.filter((e) => depts.has(e.department));
  }
  if (constraints.lockSenior) {
    list = list.filter((e) => !SENIOR_POSITION_PATTERN.test(e.position));
  }
  if (constraints.bannedIds && constraints.bannedIds.length > 0) {
    const banned = new Set(constraints.bannedIds);
    list = list.filter((e) => !banned.has(e.id));
  }
  return list;
}

const lockedSet = (c: SolioConstraints): Set<string> =>
  c.lockedIds && c.lockedIds.length > 0 ? new Set(c.lockedIds) : new Set();

/** Priority score for sorting: higher = process first. Locked get Infinity. */
function getPriorityScore(
  w: Employee,
  medianM: number,
  constraints: SolioConstraints
): number {
  if (lockedSet(constraints).has(w.id)) return Infinity;
  const gapScore = medianM > 0 ? Math.max(0, (medianM - w.salary) / medianM) : 0;
  const perf = w.performance_rating;
  const weight = constraints.performanceWeight ?? 0;
  if (weight > 0 && perf != null && perf >= 1 && perf <= 5) {
    const perfScore = (perf - 1) / 4;
    return (1 - weight) * gapScore + weight * perfScore;
  }
  return gapScore;
}

/**
 * Scenario A "Minimalne koszty" (Ostrożny): ONLY raise women >10% below male median in their EVG.
 * Sort lowest salary first. Full raise to EVG male median. minRaise. Stop at budget.
 */
function scenarioMinimalCost(
  employees: Employee[],
  constraints: SolioConstraints
): SolioScenario {
  const men = employees.filter((e) => e.gender === "M");
  const women = employees.filter((e) => e.gender === "K");
  const medianM = median(men.map((e) => e.salary));
  const targetMedianF = medianM * (1 - constraints.targetGap);
  const maleMedianByEvg = getMaleMedianByEvg(employees);

  const currentMedianF = median(women.map((e) => e.salary));
  if (currentMedianF >= targetMedianF) {
    const gap = computeGap(employees);
    return {
      name: "Minimalne koszty",
      totalCost: 0,
      affectedEmployees: 0,
      newGap: gap,
      raises: [],
      targetReached: true,
      message: "Luka już poniżej docelowej. Korekty nie są wymagane.",
    };
  }

  const locked = lockedSet(constraints);
  const belowTarget = women
    .filter((w) => {
      const evgMedian = maleMedianByEvg[w.evg_group];
      if (evgMedian == null || evgMedian <= 0) return false;
      return w.salary < evgMedian * 0.9;
    })
    .sort((a, b) => {
      const aLocked = locked.has(a.id);
      const bLocked = locked.has(b.id);
      if (aLocked && !bLocked) return -1;
      if (!aLocked && bLocked) return 1;
      const usePerf = (constraints.performanceWeight ?? 0) > 0;
      if (usePerf) return getPriorityScore(b, medianM, constraints) - getPriorityScore(a, medianM, constraints);
      return a.salary - b.salary;
    });

  const raises: SolioRaise[] = [];
  let budgetLeft = constraints.budgetLimit;

  for (const w of belowTarget) {
    if (budgetLeft <= 0) break;
    const evgMedian = maleMedianByEvg[w.evg_group] ?? medianM;
    const needed = evgMedian - w.salary;
    const raise = Math.max(needed, constraints.minRaise);
    const actualRaise = Math.min(raise, budgetLeft);
    if (actualRaise < constraints.minRaise) continue;

    const raiseRounded = Math.round(actualRaise);
    const newSalaryRounded = w.salary + raiseRounded;
    budgetLeft -= raiseRounded;

    raises.push({
      id: w.id,
      oldSalary: w.salary,
      newSalary: newSalaryRounded,
      raise: raiseRounded,
      department: w.department,
      position: w.position,
    });
  }

  const raisedMap = new Map(raises.map((r) => [r.id, r.raise]));
  const updatedEmployees = applyRaises(employees, raisedMap);
  const newGap = computeGap(updatedEmployees);
  const targetReached = newGap <= constraints.targetGap;

  return {
    name: "Minimalne koszty",
    totalCost: raises.reduce((s, r) => s + r.raise, 0),
    affectedEmployees: raises.length,
    newGap,
    raises,
    targetReached,
    message: targetReached
      ? undefined
      : "Cel nieosiągalny w podanym budżecie. Zwiększ budżet lub obniż docelową lukę.",
  };
}

/**
 * Scenario B "Zbalansowany": Raise ALL women below (global) target median.
 * If over budget: scale ALL raises proportionally (same % of needed raise each).
 */
function scenarioBalanced(
  employees: Employee[],
  constraints: SolioConstraints
): SolioScenario {
  const women = employees.filter((e) => e.gender === "K");
  const men = employees.filter((e) => e.gender === "M");
  const medianM = median(men.map((e) => e.salary));
  const targetMedianF = medianM * (1 - constraints.targetGap);
  const currentMedianF = median(women.map((e) => e.salary));
  if (currentMedianF >= targetMedianF) {
    const gap = computeGap(employees);
    return {
      name: "Zbalansowany",
      totalCost: 0,
      affectedEmployees: 0,
      newGap: gap,
      raises: [],
      targetReached: true,
      message: "Luka już poniżej docelowej. Korekty nie są wymagane.",
    };
  }

  const locked = lockedSet(constraints);
  const belowTarget = women.filter((e) => e.salary < targetMedianF);
  const lockedWomen = belowTarget.filter((w) => locked.has(w.id));
  const restWomen = belowTarget.filter((w) => !locked.has(w.id));

  let budgetLeft = constraints.budgetLimit;
  const raises: SolioRaise[] = [];

  for (const w of lockedWomen) {
    const needed = Math.max(targetMedianF - w.salary, constraints.minRaise);
    const actualRaise = Math.min(needed, budgetLeft);
    if (actualRaise < constraints.minRaise) continue;
    const raiseRounded = Math.round(actualRaise);
    budgetLeft -= raiseRounded;
    raises.push({
      id: w.id,
      oldSalary: w.salary,
      newSalary: w.salary + raiseRounded,
      raise: raiseRounded,
      department: w.department,
      position: w.position,
    });
  }

  const neededPerPerson = restWomen.map((w) => ({
    ...w,
    needed: Math.max(targetMedianF - w.salary, constraints.minRaise),
  }));
  const totalNeeded = neededPerPerson.reduce((s, x) => s + x.needed, 0);
  const scale = totalNeeded > 0 ? Math.min(1, budgetLeft / totalNeeded) : 0;

  for (const w of neededPerPerson) {
    const rawRaise = w.needed * scale;
    const raiseRounded = Math.round(rawRaise);
    if (raiseRounded <= 0) continue;
    raises.push({
      id: w.id,
      oldSalary: w.salary,
      newSalary: w.salary + raiseRounded,
      raise: raiseRounded,
      department: w.department,
      position: w.position,
    });
  }

  const raisedMap = new Map(raises.map((r) => [r.id, r.raise]));
  const updatedEmployees = applyRaises(employees, raisedMap);
  const newGap = computeGap(updatedEmployees);
  const targetReached = newGap <= constraints.targetGap;

  return {
    name: "Zbalansowany",
    totalCost: raises.reduce((s, r) => s + r.raise, 0),
    affectedEmployees: raises.length,
    newGap,
    raises,
    targetReached,
    message: targetReached
      ? undefined
      : "Cel nieosiągalny w podanym budżecie (wariant zbalansowany).",
  };
}

/**
 * Scenario C "Ekspresowy": Sort by gap_percent DESC (most % underpaid first). Full raise to target. No minRaise. Stop at budget.
 */
function scenarioEkspresowy(
  employees: Employee[],
  constraints: SolioConstraints
): SolioScenario {
  const women = employees.filter((e) => e.gender === "K");
  const men = employees.filter((e) => e.gender === "M");
  const medianM = median(men.map((e) => e.salary));
  const targetMedianF = medianM * (1 - constraints.targetGap);
  const currentMedianF = median(women.map((e) => e.salary));
  if (currentMedianF >= targetMedianF) {
    const gap = computeGap(employees);
    return {
      name: "Ekspresowy",
      totalCost: 0,
      affectedEmployees: 0,
      newGap: gap,
      raises: [],
      targetReached: true,
      message: "Luka już poniżej docelowej. Korekty nie są wymagane.",
    };
  }

  if (medianM <= 0) {
    return {
      name: "Ekspresowy",
      totalCost: 0,
      affectedEmployees: 0,
      newGap: 0,
      raises: [],
      targetReached: true,
    };
  }

  const locked = lockedSet(constraints);
  const belowTarget = women
    .filter((e) => e.salary < targetMedianF)
    .map((e) => ({
      ...e,
      gapPercent: (medianM - e.salary) / medianM,
    }))
    .sort((a, b) => {
      const aLocked = locked.has(a.id);
      const bLocked = locked.has(b.id);
      if (aLocked && !bLocked) return -1;
      if (!aLocked && bLocked) return 1;
      const usePerf = (constraints.performanceWeight ?? 0) > 0;
      if (usePerf) return getPriorityScore(b, medianM, constraints) - getPriorityScore(a, medianM, constraints);
      return b.gapPercent - a.gapPercent;
    });

  const raises: SolioRaise[] = [];
  let budgetLeft = constraints.budgetLimit;

  for (const w of belowTarget) {
    if (budgetLeft <= 0) break;
    const needed = targetMedianF - w.salary;
    const actualRaise = Math.min(needed, budgetLeft);
    if (actualRaise <= 0) continue;

    const raiseRounded = Math.round(actualRaise);
    const newSalaryRounded = w.salary + raiseRounded;
    budgetLeft -= raiseRounded;

    raises.push({
      id: w.id,
      oldSalary: w.salary,
      newSalary: newSalaryRounded,
      raise: raiseRounded,
      department: w.department,
      position: w.position,
    });
  }

  const raisedMap = new Map(raises.map((r) => [r.id, r.raise]));
  const updatedEmployees = applyRaises(employees, raisedMap);
  const newGap = computeGap(updatedEmployees);
  const targetReached = newGap <= constraints.targetGap;

  return {
    name: "Ekspresowy",
    totalCost: raises.reduce((s, r) => s + r.raise, 0),
    affectedEmployees: raises.length,
    newGap,
    raises,
    targetReached,
    message: targetReached
      ? undefined
      : "Cel nieosiągalny w podanym budżecie (wariant ekspresowy).",
  };
}

/**
 * Minimum budget (PLN) required to reach target gap with scenario A strategy.
 * Use when target was not reached to show "Zwiększ budżet do minimum X PLN".
 */
export function getMinimumBudgetForTarget(
  employees: Employee[],
  constraints: SolioConstraints
): number {
  const filtered = filterEmployees(employees, constraints);
  const women = filtered.filter((e) => e.gender === "K");
  const men = filtered.filter((e) => e.gender === "M");
  const medianM = median(men.map((e) => e.salary));
  const targetMedianF = medianM * (1 - constraints.targetGap);
  const currentMedianF = median(women.map((e) => e.salary));
  if (currentMedianF >= targetMedianF) return 0;
  const belowTarget = women
    .filter((e) => e.salary < targetMedianF)
    .sort((a, b) => a.salary - b.salary);
  let total = 0;
  for (const w of belowTarget) {
    const needed = targetMedianF - w.salary;
    total += Math.max(needed, constraints.minRaise);
  }
  return Math.ceil(total);
}

/**
 * Gap level (as decimal, e.g. 0.085 = 8.5%) achievable with the given budget.
 * Runs greedy (scenario A order) without budget cap, tracks cost after each raise; returns gap reachable within budgetLimit, rounded to nearest 0.5%.
 */
export function computeAchievableGap(
  employees: Employee[],
  constraints: SolioConstraints
): number {
  const filtered = filterEmployees(employees, constraints);
  const women = filtered.filter((e) => e.gender === "K");
  const men = filtered.filter((e) => e.gender === "M");
  const medianM = median(men.map((e) => e.salary));
  const targetMedianF = medianM * (1 - constraints.targetGap);
  const currentMedianF = median(women.map((e) => e.salary));
  if (medianM <= 0) return 0;
  const initialGap = computeGap(filtered);
  if (currentMedianF >= targetMedianF) return Math.round(initialGap * 20) / 20;

  const belowTarget = women
    .filter((e) => e.salary < targetMedianF)
    .sort((a, b) => a.salary - b.salary);

  const points: { cost: number; gap: number }[] = [{ cost: 0, gap: initialGap }];
  let cumulativeCost = 0;
  const raisesApplied = new Map<string, number>();

  for (const w of belowTarget) {
    const needed = targetMedianF - w.salary;
    const raise = Math.max(needed, constraints.minRaise);
    raisesApplied.set(w.id, raise);
    cumulativeCost += raise;
    const updated = applyRaises(filtered, raisesApplied);
    const newGap = computeGap(updated);
    points.push({ cost: cumulativeCost, gap: newGap });
  }

  const budget = constraints.budgetLimit;
  let bestGap = initialGap;
  for (const p of points) {
    if (p.cost <= budget && p.gap < bestGap) bestGap = p.gap;
  }
  const percent = bestGap * 100;
  const roundedPercent = Math.round(percent * 2) / 2;
  return roundedPercent / 100;
}

/**
 * Generate three scenarios: Minimalne koszty, Zbalansowany, Ekspresowy.
 * Pure function; filters by constraints (department, lockSenior) then runs each strategy.
 */
export function generateScenarios(
  employees: Employee[],
  constraints: SolioConstraints
): SolioScenario[] {
  const filtered = filterEmployees(employees, constraints);
  return [
    scenarioMinimalCost(filtered, constraints),
    scenarioBalanced(filtered, constraints),
    scenarioEkspresowy(filtered, constraints),
  ];
}
