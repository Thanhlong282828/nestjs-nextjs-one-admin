/** Validated input for the current MySQL employee model. This does not persist data. */
export type PreparedEmployee = Readonly<{
  companyId: string;
  branchId: string;
  departmentId: string;
  code: string;
  fullName: string;
}>;

export class InvalidScopedEmployeeError extends Error {}

export class PrepareScopedEmployeeCommand {
  constructor(readonly input: Readonly<Record<string, unknown>>) {}
}

/** Reject unsupported fields rather than silently discarding information supplied by callers. */
export class PrepareScopedEmployeeHandler {
  execute(command: PrepareScopedEmployeeCommand): PreparedEmployee {
    const input = command.input;
    const keys = ['companyId', 'branchId', 'departmentId', 'code', 'fullName'];
    if (Object.keys(input).some(key => !keys.includes(key))) throw new InvalidScopedEmployeeError('Unsupported employee field');
    const id = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const { companyId, branchId, departmentId, code, fullName } = input;
    if (typeof companyId !== 'string' || !id.test(companyId) || typeof branchId !== 'string' || !id.test(branchId) || typeof departmentId !== 'string' || !id.test(departmentId)) throw new InvalidScopedEmployeeError('Invalid employee scope');
    if (typeof code !== 'string' || typeof fullName !== 'string') throw new InvalidScopedEmployeeError('Invalid employee fields');
    const normalizedCode = code.trim();
    const normalizedName = fullName.trim();
    const hasControl = [...normalizedCode + normalizedName].some(character => {
      const value = character.codePointAt(0);
      return value !== undefined && (value < 32 || value === 127);
    });
    if (!normalizedCode || normalizedCode.length > 32 || !normalizedName || normalizedName.length > 150 || hasControl) throw new InvalidScopedEmployeeError('Invalid employee fields');
    return { companyId, branchId, departmentId, code: normalizedCode, fullName: normalizedName };
  }
}
