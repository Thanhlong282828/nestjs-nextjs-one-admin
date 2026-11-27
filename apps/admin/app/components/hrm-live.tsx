'use client';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { adminCatalog } from '../../../../packages/i18n/src/admin';
import type { Locale } from '../../../../packages/i18n/src';

type Named = { id: string; name: string };
type Employee = { id: string; departmentId: string; code: string; fullName: string; status: string };
type Attendance = { id: string; employeeId: string; workDate: string; status: string };
type Status = 'idle' | 'loading' | 'ready' | 'denied' | 'error' | 'expired';
type SectionStatus = 'ready' | 'denied' | 'error';
const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
function list<T>(value: unknown, check: (item: unknown) => item is T): T[] {
  if (!object(value) || !Array.isArray(value.items) || !value.items.every(check)) throw new Error('Invalid response');
  return value.items;
}
const named = (v: unknown): v is Named => object(v) && typeof v.id === 'string' && typeof v.name === 'string';
const employee = (v: unknown): v is Employee => object(v) && typeof v.id === 'string' && typeof v.departmentId === 'string' && typeof v.code === 'string' && typeof v.fullName === 'string' && typeof v.status === 'string';
const attendance = (v: unknown): v is Attendance => object(v) && typeof v.id === 'string' && typeof v.employeeId === 'string' && typeof v.workDate === 'string' && typeof v.status === 'string';
function apiBase(): string {
  if (typeof window === 'undefined' || !['localhost', '127.0.0.1'].includes(window.location.hostname)) throw new Error('Local API unavailable');
  const port = process.env.NEXT_PUBLIC_AURUM_LOCAL_API_PORT ?? '4000';
  if (!/^[1-9]\d{0,4}$/.test(port) || Number(port) > 65535) throw new Error('Invalid local API port');
  return `http://${window.location.hostname}:${port}/api/v1`;
}
async function request(path: string, options: RequestInit = {}): Promise<unknown> {
  const response = await fetch(`${apiBase()}${path}`, { ...options, credentials: 'include', cache: 'no-store' });
  if (!response.ok) throw new Error(String(response.status));
  if (response.status === 204) return null;
  return response.json() as Promise<unknown>;
}
function EmployeeEditor({ locale, company, branch, departments, selected, onSaved }: { locale: Locale; company: string; branch: string; departments: Named[]; selected: Employee | null; onSaved: (item: Employee) => void }) {
  const t = adminCatalog[locale];
  const [open, setOpen] = useState(false), [code, setCode] = useState(''), [name, setName] = useState(''), [departmentId, setDepartmentId] = useState('');
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const [editing, setEditing] = useState<Employee | null>(null);
  function start(item: Employee | null) { setEditing(item); setCode(item?.code ?? ''); setName(item?.fullName ?? ''); setDepartmentId(item?.departmentId ?? ''); setMessage(''); setOpen(true); }
  async function send(path: string, method: string, body: object) {
    setBusy(true); setMessage('');
    try { const value = await request(path, { method, headers: { 'content-type': 'application/json', 'x-aurum-request': '1' }, body: JSON.stringify(body) }); if (!employee(value)) throw new Error('response'); onSaved(value); setOpen(false); setMessage(t.employeeSaved); }
    catch (error) { setMessage(error instanceof Error && error.message === '409' ? t.employeeDuplicate : t.employeeSaveError); }
    finally { setBusy(false); }
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!window.confirm(t.employeeConfirm)) return; void send(editing ? `/hrm/employees/${encodeURIComponent(editing.id)}` : '/hrm/employees', editing ? 'PATCH' : 'POST', { companyId: company, branchId: branch, departmentId, code, fullName: name }); }
  return <section><button type="button" disabled={busy || departments.length === 0} onClick={() => start(null)}>{t.employeeCreate}</button>{selected && <><button type="button" disabled={busy} onClick={() => start(selected)}>{t.employeeEdit}</button>{(selected.status === 'active' || selected.status === 'inactive') && <button type="button" disabled={busy} onClick={() => { if (window.confirm(t.employeeConfirm)) void send(`/hrm/employees/${encodeURIComponent(selected.id)}/status`, 'PATCH', { companyId: company, branchId: branch, status: selected.status === 'active' ? 'inactive' : 'active' }); }}>{selected.status === 'active' ? t.employeeDeactivate : t.employeeActivate}</button>}</>}
    {open && <form onSubmit={submit}><h4>{editing ? t.employeeEdit : t.employeeCreate}</h4><label>{t.employeeCode}<input required maxLength={32} value={code} onChange={event => setCode(event.target.value)} /></label><label>{t.employeeName}<input required maxLength={150} value={name} onChange={event => setName(event.target.value)} /></label><label>{t.departmentLabel}<select required value={departmentId} onChange={event => setDepartmentId(event.target.value)}><option value="">{t.choosePrompt}</option>{departments.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><button disabled={busy} type="submit">{busy ? t.employeeSaving : t.employeeSave}</button><button disabled={busy} type="button" onClick={() => setOpen(false)}>{t.employeeCancel}</button></form>}
    <p role="status">{message}</p></section>;
}
export default function HrmLive({ locale }: { locale: Locale }) {
  const t = adminCatalog[locale];
  const [signedIn, setSignedIn] = useState(false), [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [companies, setCompanies] = useState<Named[]>([]), [branches, setBranches] = useState<Named[]>([]);
  const [company, setCompany] = useState(''), [branch, setBranch] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]), [departments, setDepartments] = useState<Named[]>([]), [attendances, setAttendances] = useState<Attendance[]>([]);
  const [employeePage, setEmployeePage] = useState(1), [employeeTotal, setEmployeeTotal] = useState(0);
  const [searchDraft, setSearchDraft] = useState(''), [search, setSearch] = useState(''), [sort, setSort] = useState<'code' | 'name'>('code');
  const [detail, setDetail] = useState<Employee | null>(null);
  const [refresh, setRefresh] = useState(0);
  const scopeVersion = useRef(0);
  const renderedScopeVersion = scopeVersion.current;
  const [sections, setSections] = useState<Record<'employees' | 'departments' | 'attendance', SectionStatus>>({ employees: 'ready', departments: 'ready', attendance: 'ready' });
  const [status, setStatus] = useState<Status>('loading');
  const handleError = useCallback((error: unknown) => {
    const message = error instanceof Error ? error.message : '';
    if (message === '401') { scopeVersion.current++; setDetail(null); setSignedIn(false); setStatus('expired'); }
    else setStatus(message === '403' ? 'denied' : 'error');
  }, []);
  const loadCompanies = useCallback(async () => { const result = await request('/companies'); setCompanies(list(result, named)); }, []);
  useEffect(() => {
    let active = true;
    void (async () => { try { await request('/auth/me'); if (!active) return; setSignedIn(true); await loadCompanies(); if (active) setStatus('ready'); } catch (error) { if (active) handleError(error); } })();
    return () => { active = false; };
  }, [handleError, loadCompanies]);
  useEffect(() => {
    let active = true;
    if (!company) return () => { active = false; };
    void request(`/companies/${encodeURIComponent(company)}/branches`).then(result => { if (active) setBranches(list(result, named)); }).catch(error => { if (active) handleError(error); });
    return () => { active = false; };
  }, [company, handleError]);
  useEffect(() => {
    let active = true;
    if (!company || !branch) return () => { active = false; };
    const scope = `companyId=${encodeURIComponent(company)}&branchId=${encodeURIComponent(branch)}`;
    void Promise.allSettled([request(`/hrm/employees?${scope}&page=${employeePage}&sort=${sort}&search=${encodeURIComponent(search)}`), request(`/hrm/departments?${scope}`), request(`/hrm/attendances?${scope}`)]).then(([e, d, a]) => {
      if (!active) return;
      const outcomes = [e, d, a];
      if (outcomes.some(result => result.status === 'rejected' && result.reason instanceof Error && result.reason.message === '401')) { handleError(new Error('401')); return; }
      const failure = (result: PromiseSettledResult<unknown>): SectionStatus => result.status === 'rejected' && result.reason instanceof Error && result.reason.message === '403' ? 'denied' : 'error';
      const next: Record<'employees' | 'departments' | 'attendance', SectionStatus> = { employees: 'error', departments: 'error', attendance: 'error' };
      if (e.status === 'fulfilled') { try { if (!object(e.value) || !Number.isSafeInteger(e.value.total) || typeof e.value.total !== 'number' || e.value.total < 0) throw new Error('Invalid total'); setEmployees(list(e.value, employee)); setEmployeeTotal(e.value.total); next.employees = 'ready'; } catch { setEmployees([]); } } else { setEmployees([]); next.employees = failure(e); }
      if (d.status === 'fulfilled') { try { setDepartments(list(d.value, named)); next.departments = 'ready'; } catch { setDepartments([]); } } else { setDepartments([]); next.departments = failure(d); }
      if (a.status === 'fulfilled') { try { setAttendances(list(a.value, attendance)); next.attendance = 'ready'; } catch { setAttendances([]); } } else { setAttendances([]); next.attendance = failure(a); }
      setSections(next); setStatus('ready');
    });
    return () => { active = false; };
  }, [company, branch, employeePage, search, sort, handleError, refresh]);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus('loading');
    try { await request('/auth/login', { method: 'POST', headers: { 'content-type': 'application/json', 'x-aurum-request': '1' }, body: JSON.stringify({ email, password }) }); setPassword(''); setSignedIn(true); await loadCompanies(); setStatus('ready'); } catch (error) { handleError(error); }
  }
  async function logout() {
    try { await request('/auth/logout', { method: 'POST', headers: { 'x-aurum-request': '1' } }); scopeVersion.current++; setDetail(null); setSignedIn(false); setCompanies([]); setCompany(''); setStatus('idle'); } catch (error) { handleError(error); }
  }
  async function loadDetail(id: string) {
    const version = scopeVersion.current;
    try { const result = await request(`/hrm/employees/${encodeURIComponent(id)}?companyId=${encodeURIComponent(company)}&branchId=${encodeURIComponent(branch)}`); if (!employee(result)) throw new Error('Invalid response'); if (version === scopeVersion.current) setDetail(result); } catch (error) { if (version === scopeVersion.current) handleError(error); }
  }
  return <section className="panel glass-surface hrm-live" style={{ padding: 24, marginTop: 20 }} aria-label={t.hr}>
    {!signedIn ? <form onSubmit={login}><h2>{t.signIn}</h2><p>{status === 'expired' ? t.sessionExpired : t.hrUnavailableDesc}</p><label>{t.emailLabel}<input type="email" required autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} /></label><label>{t.passwordLabel}<input type="password" required autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} /></label><button type="submit" disabled={status === 'loading'}>{t.signIn}</button></form> : <>
      <button type="button" onClick={() => void logout()}>{t.signOut}</button>
      <div className="hrm-scope"><label>{t.chooseCompany}<select value={company} onChange={event => { scopeVersion.current++; setCompany(event.target.value); setBranch(''); setBranches([]); setEmployees([]); setDepartments([]); setAttendances([]); setEmployeePage(1); setDetail(null); }}><option value="">{t.choosePrompt}</option>{companies.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>{t.chooseBranch}<select value={branch} onChange={event => { scopeVersion.current++; setBranch(event.target.value); setEmployees([]); setDepartments([]); setAttendances([]); setEmployeePage(1); setDetail(null); if (event.target.value) setStatus('loading'); }} disabled={!company}><option value="">{t.choosePrompt}</option>{branches.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
      {branch && status === 'ready' && <><EmployeeEditor key={`${company}:${branch}`} locale={locale} company={company} branch={branch} departments={departments} selected={detail} onSaved={item => { if (scopeVersion.current === renderedScopeVersion) { setDetail(item); setRefresh(value => value + 1); } }} /><h3>{t.departmentLabel}</h3>{sections.departments !== 'ready' ? <p role="status">{sections.departments === 'denied' ? t.hrmDenied : t.hrmLoadError}</p> : departments.length ? <ul>{departments.map(item => <li key={item.id}>{item.name}</li>)}</ul> : <p>{t.hrmEmpty}</p>}<h3>{t.directory}</h3><form onSubmit={event => { event.preventDefault(); const next = searchDraft.trim(); if (next !== search || employeePage !== 1) { setStatus('loading'); setEmployeePage(1); setSearch(next); setDetail(null); } }}><label>{t.employeeSearch}<input value={searchDraft} maxLength={100} onChange={event => setSearchDraft(event.target.value)} /></label><button type="submit">{t.searchAction}</button><label>{t.sortBy}<select value={sort} onChange={event => { const value = event.target.value === 'name' ? 'name' : 'code'; if (value !== sort) { setStatus('loading'); setEmployeePage(1); setSort(value); setDetail(null); } }}><option value="code">{t.employeeCode}</option><option value="name">{t.employeeName}</option></select></label></form>{sections.employees !== 'ready' ? <p role="status">{sections.employees === 'denied' ? t.hrmDenied : t.hrmLoadError}</p> : <>{employees.length ? <table><thead><tr><th scope="col">{t.employeeCode}</th><th scope="col">{t.employeeName}</th></tr></thead><tbody>{employees.map(item => <tr key={item.id}><td>{item.code}</td><td><button type="button" onClick={() => void loadDetail(item.id)}>{item.fullName}</button></td></tr>)}</tbody></table> : <p>{t.hrmEmpty}</p>}<div className="hrm-scope"><button type="button" disabled={employeePage === 1} onClick={() => { setStatus('loading'); setEmployeePage(employeePage - 1); }}>{t.previousPage}</button><span>{t.pageLabel} {employeePage}</span><button type="button" disabled={employeePage * 20 >= employeeTotal} onClick={() => { setStatus('loading'); setEmployeePage(employeePage + 1); }}>{t.nextPage}</button></div></>}{detail && <section aria-label={t.employeeDetail}><h4>{t.employeeDetail}</h4><p>{detail.fullName} · {detail.code}</p><p>{t.employeeStatus}: {detail.status === 'active' ? t.employeeActive : detail.status === 'inactive' ? t.employeeInactive : detail.status}</p><button type="button" onClick={() => setDetail(null)}>{t.closeDetail}</button></section>}<h3>{t.attendanceLabel}</h3>{sections.attendance !== 'ready' ? <p role="status">{sections.attendance === 'denied' ? t.hrmDenied : t.hrmLoadError}</p> : attendances.length ? <ul>{attendances.map(item => <li key={item.id}>{new Date(item.workDate).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { timeZone: 'UTC' })} · {item.status} · {employees.find(person => person.id === item.employeeId)?.fullName ?? item.employeeId}</li>)}</ul> : <p>{t.hrmEmpty}</p>}</>}
    </>}
    <p role="status">{status === 'loading' ? t.hrLoading : status === 'denied' ? t.hrmDenied : status === 'error' ? t.hrmLoadError : ''}</p>
  </section>;
}
