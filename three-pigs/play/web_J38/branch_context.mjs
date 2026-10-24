let current='normal';
export const branchId=()=>current;
export function setBranchId(id){if(!['normal','peace'].includes(id))throw Error('Only normal and peace are implemented');current=id;}
