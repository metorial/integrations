import { createGetRecordTool, createListRecordsTool } from './shared';

export let listWorkers = createListRecordsTool({
  key: 'list_workers',
  name: 'List Human Resources Workers',
  description:
    'List Dynamics 365 Human Resources worker records through Finance and Operations OData.',
  outputKey: 'workers',
  entitySetName: 'Workers',
  companyScoped: false,
  idFields: ['PersonnelNumber', 'WorkerPersonnelNumber', 'WorkerRecId'],
  numberFields: ['PersonnelNumber', 'WorkerPersonnelNumber'],
  nameFields: ['Name', 'WorkerName', 'KnownAs'],
  statusFields: ['WorkerType', 'EmploymentStatus']
});

export let getWorker = createGetRecordTool({
  key: 'get_worker',
  name: 'Get Human Resources Worker',
  description: 'Retrieve one Dynamics 365 Human Resources worker by OData key values.',
  outputKey: 'worker',
  entitySetName: 'Workers',
  companyScoped: false,
  idFields: ['PersonnelNumber', 'WorkerPersonnelNumber', 'WorkerRecId'],
  numberFields: ['PersonnelNumber', 'WorkerPersonnelNumber'],
  nameFields: ['Name', 'WorkerName', 'KnownAs'],
  statusFields: ['WorkerType', 'EmploymentStatus']
});

export let listEmployees = createListRecordsTool({
  key: 'list_employees',
  name: 'List Human Resources Employees',
  description:
    'List employee employment records by legal entity, worker, status, and OData filters.',
  outputKey: 'employees',
  entitySetName: 'EmployeesV2',
  companyScoped: true,
  idFields: ['PersonnelNumber', 'WorkerPersonnelNumber', 'EmployeeNumber'],
  numberFields: ['PersonnelNumber', 'EmployeeNumber'],
  nameFields: ['Name', 'EmployeeName', 'WorkerName'],
  statusFields: ['EmploymentStatus', 'WorkerType'],
  dateFields: ['EmploymentStartDate', 'EmploymentEndDate']
});

export let listPositions = createListRecordsTool({
  key: 'list_positions',
  name: 'List Human Resources Positions',
  description:
    'List position records, assignments, and organizational placement by OData filters.',
  outputKey: 'positions',
  entitySetName: 'Positions',
  companyScoped: false,
  idFields: ['PositionId', 'PositionNumber'],
  numberFields: ['PositionId', 'PositionNumber'],
  nameFields: ['Description', 'PositionTitle', 'JobId'],
  statusFields: ['PositionStatus', 'WorkerAssignmentStatus'],
  dateFields: ['AvailableForAssignment', 'RetirementDate']
});

export let listJobs = createListRecordsTool({
  key: 'list_jobs',
  name: 'List Human Resources Jobs',
  description:
    'List job records and job metadata for role, position, and workforce planning workflows.',
  outputKey: 'jobs',
  entitySetName: 'Jobs',
  companyScoped: false,
  idFields: ['JobId'],
  numberFields: ['JobId'],
  nameFields: ['Description', 'JobDescription', 'Title'],
  statusFields: ['JobType']
});

export let listDepartments = createListRecordsTool({
  key: 'list_departments',
  name: 'List Human Resources Departments',
  description: 'List department and organization unit records for workforce reporting.',
  outputKey: 'departments',
  entitySetName: 'Departments',
  companyScoped: false,
  idFields: ['DepartmentNumber', 'DepartmentId', 'OperatingUnitNumber'],
  numberFields: ['DepartmentNumber', 'DepartmentId', 'OperatingUnitNumber'],
  nameFields: ['Name', 'DepartmentName', 'OperatingUnitName'],
  statusFields: ['OperatingUnitType']
});

export let listLeaveBalances = createListRecordsTool({
  key: 'list_leave_balances',
  name: 'List Human Resources Leave Balances',
  description:
    'List worker leave and absence balance read models by worker, plan, legal entity, and OData filters.',
  outputKey: 'leaveBalances',
  entitySetName: 'LeaveBalances',
  companyScoped: true,
  idFields: ['PersonnelNumber', 'WorkerPersonnelNumber', 'LeaveTypeId'],
  numberFields: ['PersonnelNumber', 'LeaveTypeId', 'LeavePlanId'],
  nameFields: ['LeaveTypeDescription', 'LeavePlanDescription', 'WorkerName'],
  statusFields: ['LeaveTypeId'],
  amountFields: ['Balance', 'AvailableBalance', 'AccruedAmount']
});

export let listLeaveRequests = createListRecordsTool({
  key: 'list_leave_requests',
  name: 'List Human Resources Leave Requests',
  description:
    'List worker leave request records for status review. This package does not submit, approve, or cancel leave requests.',
  outputKey: 'leaveRequests',
  entitySetName: 'LeaveRequests',
  companyScoped: true,
  idFields: ['LeaveRequestId', 'RequestId'],
  numberFields: ['LeaveRequestId', 'RequestId', 'PersonnelNumber'],
  nameFields: ['WorkerName', 'LeaveTypeDescription'],
  statusFields: ['RequestStatus', 'WorkflowStatus', 'ApprovalStatus'],
  dateFields: ['StartDate', 'EndDate', 'SubmittedDateTime']
});

export let listCompensationPlans = createListRecordsTool({
  key: 'list_compensation_plans',
  name: 'List Human Resources Compensation Plans',
  description:
    'List compensation plan and compensation read-model records for workforce reporting.',
  outputKey: 'compensationPlans',
  entitySetName: 'CompensationPlans',
  companyScoped: false,
  idFields: ['CompensationPlanId', 'PlanId'],
  numberFields: ['CompensationPlanId', 'PlanId'],
  nameFields: ['Description', 'PlanDescription', 'Name'],
  statusFields: ['CompensationPlanType'],
  amountFields: ['PayRate', 'FixedCompensationAmount'],
  currencyFields: ['CurrencyCode']
});

export let listBenefitEnrollments = createListRecordsTool({
  key: 'list_benefit_enrollments',
  name: 'List Human Resources Benefit Enrollments',
  description:
    'List benefit enrollment and benefit read-model records by worker, plan, status, and OData filters.',
  outputKey: 'benefitEnrollments',
  entitySetName: 'BenefitEnrollments',
  companyScoped: true,
  idFields: ['BenefitPlanId', 'PersonnelNumber', 'EnrollmentId'],
  numberFields: ['BenefitPlanId', 'PersonnelNumber', 'EnrollmentId'],
  nameFields: ['BenefitPlanDescription', 'WorkerName', 'PlanDescription'],
  statusFields: ['EnrollmentStatus', 'BenefitStatus'],
  dateFields: ['CoverageStartDate', 'CoverageEndDate']
});
