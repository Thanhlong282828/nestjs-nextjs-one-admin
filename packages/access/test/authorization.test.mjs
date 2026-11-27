import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { authorizeBranch, authorizeCompany, authorizeClassifiedBranch } from '../dist/index.js';
const companyA=randomUUID(), companyB=randomUUID(), branchA=randomUUID(), branchB=randomUUID();
const member={companyId:companyA,status:'active',permissions:['employee.read'],branchIds:[branchA]};
const user={userId:randomUUID(),status:'active',memberships:[member]};
const branch=(id, companyId=companyA)=>({id,companyId});
test('company and branch permissions deny cross-company, cross-branch and privilege escalation',()=>{
 assert.equal(authorizeCompany(user,companyA,'employee.read').allowed,true);
 assert.equal(authorizeBranch(user,companyA,branch(branchA),'employee.read').allowed,true);
 assert.equal(authorizeCompany(user,companyB,'employee.read').allowed,false);
 assert.equal(authorizeBranch(user,companyB,branch(branchA),'employee.read').allowed,false);
 assert.equal(authorizeBranch(user,companyA,branch(branchB),'employee.read').allowed,false);
 assert.equal(authorizeBranch(user,companyA,branch(branchA),'employee.write').allowed,false);
});
test('disabled users, suspended or ambiguous memberships and invalid inputs fail closed',()=>{
 assert.equal(authorizeCompany(null,companyA,'employee.read').reason,'unauthenticated');
 assert.equal(authorizeCompany({...user,status:'disabled'},companyA,'employee.read').allowed,false);
 assert.equal(authorizeCompany({...user,memberships:[{...member,status:'suspended'}]},companyA,'employee.read').allowed,false);
 assert.equal(authorizeCompany({...user,memberships:[member,member]},companyA,'employee.read').allowed,false);
 assert.equal(authorizeBranch(user,companyA,branch('invalid'),'employee.read').allowed,false);
 assert.equal(authorizeCompany({...user,userId:'invalid'},companyA,'employee.read').allowed,false);
});
test('all-branch scope remains limited to the assigned company and empty scope grants no branch',()=>{
 const all={...user,memberships:[{...member,branchIds:null}]};
 const none={...user,memberships:[{...member,branchIds:[]}]};
 assert.equal(authorizeBranch(all,companyA,branch(branchB),'employee.read').allowed,true);
 assert.equal(authorizeBranch(all,companyA,branch(branchB,companyB),'employee.read').allowed,false);
 assert.equal(authorizeBranch(all,companyB,branch(branchB,companyB),'employee.read').allowed,false);
 assert.equal(authorizeBranch(none,companyA,branch(branchA),'employee.read').allowed,false);
});
test('classified branch policy rejects missing, ambiguous and cross-track context',()=>{
 const real={companyId:companyA,classification:'REAL',provenance:'verified-import',sourceReference:'import-reference'};
 const demo={companyId:companyA,classification:'DEMO',provenance:'demo-provisioner',sourceReference:null};
 const check=(track, record, scope=companyA)=>authorizeClassifiedBranch(user,scope,branch(branchA),'employee.read',track,record).allowed;
 assert.equal(check('REAL',real),true);
 assert.equal(check('DEMO',demo),true);
 assert.equal(check('REAL',demo),false);
 assert.equal(check('DEMO',real),false);
 assert.equal(check('REAL',null),false);
 assert.equal(check('REAL',{...real,sourceReference:' '}),false);
 assert.equal(check('DEMO',{...demo,provenance:''}),false);
 assert.equal(check('UNKNOWN',demo),false);
 assert.equal(check('REAL',{...real,companyId:companyB}),false);
 assert.equal(check('REAL',real,companyB),false);
 assert.equal(authorizeClassifiedBranch(user,companyA,branch(branchB),'employee.read','REAL',real).allowed,false);
});
