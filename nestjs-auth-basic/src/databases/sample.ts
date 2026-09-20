export const ADMIN_ROLE = 'SUPER_ADMIN';
export const USER_ROLE = 'NORMAL_USER';
export const HR_ROLE = 'HR'
// Du lieu quyen mau cho cac API hien co. Chi duoc luu khi goi seed database.
export const INIT_PERMISSIONS = [
  {
    "_id": "650000000000000000001001",
    "name": "Get Company with paginate",
    "apiPath": "/api/v1/companies",
    "method": "GET",
    "module": "COMPANIES",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "650000000000000000001002",
    "name": "Get Company by id",
    "apiPath": "/api/v1/companies/:id",
    "method": "GET",
    "module": "COMPANIES",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "650000000000000000001003",
    "name": "Create Company",
    "apiPath": "/api/v1/companies",
    "method": "POST",
    "module": "COMPANIES",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "650000000000000000001004",
    "name": "Update Company",
    "apiPath": "/api/v1/companies/:id",
    "method": "PATCH",
    "module": "COMPANIES",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "650000000000000000001005",
    "name": "Delete Company",
    "apiPath": "/api/v1/companies/:id",
    "method": "DELETE",
    "module": "COMPANIES",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "650000000000000000001006",
    "name": "Get User with paginate",
    "apiPath": "/api/v1/users",
    "method": "GET",
    "module": "USERS",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "650000000000000000001007",
    "name": "Get User by id",
    "apiPath": "/api/v1/users/:id",
    "method": "GET",
    "module": "USERS",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "650000000000000000001008",
    "name": "Create User",
    "apiPath": "/api/v1/users",
    "method": "POST",
    "module": "USERS",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "650000000000000000001009",
    "name": "Update User",
    "apiPath": "/api/v1/users/:id",
    "method": "PATCH",
    "module": "USERS",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "65000000000000000000100a",
    "name": "Delete User",
    "apiPath": "/api/v1/users/:id",
    "method": "DELETE",
    "module": "USERS",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "65000000000000000000100b",
    "name": "Get Job with paginate",
    "apiPath": "/api/v1/jobs",
    "method": "GET",
    "module": "JOBS",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "65000000000000000000100c",
    "name": "Get Job by id",
    "apiPath": "/api/v1/jobs/:id",
    "method": "GET",
    "module": "JOBS",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "65000000000000000000100d",
    "name": "Create Job",
    "apiPath": "/api/v1/jobs",
    "method": "POST",
    "module": "JOBS",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "65000000000000000000100e",
    "name": "Update Job",
    "apiPath": "/api/v1/jobs/:id",
    "method": "PATCH",
    "module": "JOBS",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "65000000000000000000100f",
    "name": "Delete Job",
    "apiPath": "/api/v1/jobs/:id",
    "method": "DELETE",
    "module": "JOBS",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "650000000000000000001010",
    "name": "Get Resume with paginate",
    "apiPath": "/api/v1/resumes",
    "method": "GET",
    "module": "RESUMES",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "650000000000000000001011",
    "name": "Get Resume by id",
    "apiPath": "/api/v1/resumes/:id",
    "method": "GET",
    "module": "RESUMES",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "650000000000000000001012",
    "name": "Create Resume",
    "apiPath": "/api/v1/resumes",
    "method": "POST",
    "module": "RESUMES",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "650000000000000000001013",
    "name": "Update Resume",
    "apiPath": "/api/v1/resumes/:id",
    "method": "PATCH",
    "module": "RESUMES",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "650000000000000000001014",
    "name": "Delete Resume",
    "apiPath": "/api/v1/resumes/:id",
    "method": "DELETE",
    "module": "RESUMES",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "650000000000000000001015",
    "name": "Get Permission with paginate",
    "apiPath": "/api/v1/permissions",
    "method": "GET",
    "module": "PERMISSIONS",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "650000000000000000001016",
    "name": "Get Permission by id",
    "apiPath": "/api/v1/permissions/:id",
    "method": "GET",
    "module": "PERMISSIONS",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "650000000000000000001017",
    "name": "Create Permission",
    "apiPath": "/api/v1/permissions",
    "method": "POST",
    "module": "PERMISSIONS",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "650000000000000000001018",
    "name": "Update Permission",
    "apiPath": "/api/v1/permissions/:id",
    "method": "PATCH",
    "module": "PERMISSIONS",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "650000000000000000001019",
    "name": "Delete Permission",
    "apiPath": "/api/v1/permissions/:id",
    "method": "DELETE",
    "module": "PERMISSIONS",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "65000000000000000000101a",
    "name": "Get Role with paginate",
    "apiPath": "/api/v1/roles",
    "method": "GET",
    "module": "ROLES",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "65000000000000000000101b",
    "name": "Get Role by id",
    "apiPath": "/api/v1/roles/:id",
    "method": "GET",
    "module": "ROLES",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "65000000000000000000101c",
    "name": "Create Role",
    "apiPath": "/api/v1/roles",
    "method": "POST",
    "module": "ROLES",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "65000000000000000000101d",
    "name": "Update Role",
    "apiPath": "/api/v1/roles/:id",
    "method": "PATCH",
    "module": "ROLES",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "65000000000000000000101e",
    "name": "Delete Role",
    "apiPath": "/api/v1/roles/:id",
    "method": "DELETE",
    "module": "ROLES",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "65000000000000000000101f",
    "name": "Get resumes by current user",
    "apiPath": "/api/v1/resumes/by-user",
    "method": "POST",
    "module": "RESUMES",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  },
  {
    "_id": "650000000000000000001020",
    "name": "Upload file",
    "apiPath": "/api/v1/files/upload",
    "method": "POST",
    "module": "FILES",
    "createdBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    },
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "__v": 0,
    "updatedBy": {
      "_id": "650000000000000000000001",
      "email": "admin@example.com"
    }
  }
];

