import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FinTracker API',
      version: '1.0.0',
      description:
        'Personal Finance Tracker REST API — JWT-authenticated endpoints for managing transactions, categories, budgets, and analytics.',
      contact: {
        name: 'FinTracker',
      },
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Local development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token obtained from /api/auth/login',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            currency: { type: 'string', example: 'USD' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            amount: { type: 'string', example: '49.99' },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
            description: { type: 'string' },
            notes: { type: 'string', nullable: true },
            date: { type: 'string', format: 'date-time' },
            categoryId: { type: 'string' },
            category: { $ref: '#/components/schemas/Category' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
            color: { type: 'string', example: '#6366f1' },
            icon: { type: 'string', example: 'tag' },
            isDefault: { type: 'boolean' },
          },
        },
        Budget: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            amount: { type: 'string' },
            period: { type: 'string', enum: ['WEEKLY', 'MONTHLY', 'YEARLY'] },
            spent: { type: 'number' },
            remaining: { type: 'number' },
            percentage: { type: 'number' },
            isOverBudget: { type: 'boolean' },
            category: { $ref: '#/components/schemas/Category' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication & session management' },
      { name: 'Transactions', description: 'Income & expense transactions' },
      { name: 'Categories', description: 'Transaction categories' },
      { name: 'Budgets', description: 'Budget tracking' },
      { name: 'Analytics', description: 'Financial analytics & reports' },
      { name: 'User', description: 'User profile & settings' },
    ],
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          tags: ['Auth'],
          security: [],
          responses: {
            200: { description: 'Server is healthy' },
          },
        },
      },
      '/api/auth/register': {
        post: {
          summary: 'Register a new account',
          tags: ['Auth'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', minLength: 2, example: 'Jane Doe' },
                    email: { type: 'string', format: 'email', example: 'jane@example.com' },
                    password: {
                      type: 'string',
                      minLength: 8,
                      description: 'Min 8 chars, 1 uppercase, 1 number',
                      example: 'Password123',
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Account created, returns user and access token' },
            400: { description: 'Validation error' },
            409: { description: 'Email already in use' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'Login',
          tags: ['Auth'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'demo@financetracker.app' },
                    password: { type: 'string', example: 'demo123456' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful, returns user and access token' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          summary: 'Logout (invalidates refresh token)',
          tags: ['Auth'],
          security: [],
          responses: { 200: { description: 'Logged out' } },
        },
      },
      '/api/auth/refresh': {
        post: {
          summary: 'Refresh access token using httpOnly cookie',
          tags: ['Auth'],
          security: [],
          responses: {
            200: { description: 'New access token' },
            401: { description: 'Refresh token missing or expired' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          summary: 'Get current user',
          tags: ['Auth'],
          responses: {
            200: { description: 'Current authenticated user' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/transactions': {
        get: {
          summary: 'List transactions with filters and pagination',
          tags: ['Transactions'],
          parameters: [
            { name: 'type', in: 'query', schema: { type: 'string', enum: ['INCOME', 'EXPENSE'] } },
            { name: 'categoryId', in: 'query', schema: { type: 'string' } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'sortBy', in: 'query', schema: { type: 'string', default: 'date' } },
            { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
          ],
          responses: {
            200: {
              description: 'Paginated transactions',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          transactions: { type: 'array', items: { $ref: '#/components/schemas/Transaction' } },
                          meta: { $ref: '#/components/schemas/PaginationMeta' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Create a transaction',
          tags: ['Transactions'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['type', 'amount', 'description', 'date', 'categoryId'],
                  properties: {
                    type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                    amount: { type: 'number', example: 49.99 },
                    description: { type: 'string', example: 'Grocery Shopping' },
                    notes: { type: 'string' },
                    date: { type: 'string', format: 'date', example: '2024-01-15' },
                    categoryId: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Transaction created' },
            400: { description: 'Validation error or category type mismatch' },
            404: { description: 'Category not found' },
          },
        },
      },
      '/api/transactions/{id}': {
        put: {
          summary: 'Update a transaction',
          tags: ['Transactions'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    amount: { type: 'number' },
                    description: { type: 'string' },
                    notes: { type: 'string' },
                    date: { type: 'string', format: 'date' },
                    categoryId: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Updated transaction' }, 404: { description: 'Not found' } },
        },
        delete: {
          summary: 'Delete a transaction',
          tags: ['Transactions'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Deleted' }, 404: { description: 'Not found' } },
        },
      },
      '/api/categories': {
        get: {
          summary: 'List all categories for the current user',
          tags: ['Categories'],
          responses: { 200: { description: 'Array of categories with transaction counts' } },
        },
        post: {
          summary: 'Create a category',
          tags: ['Categories'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'type'],
                  properties: {
                    name: { type: 'string' },
                    type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                    color: { type: 'string', example: '#6366f1' },
                    icon: { type: 'string', example: 'tag' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Category created' } },
        },
      },
      '/api/budgets': {
        get: {
          summary: 'List budgets enriched with spending data',
          tags: ['Budgets'],
          responses: { 200: { description: 'Budgets with spent/remaining/percentage' } },
        },
        post: {
          summary: 'Create a budget',
          tags: ['Budgets'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['categoryId', 'amount', 'period'],
                  properties: {
                    categoryId: { type: 'string' },
                    amount: { type: 'number', example: 500 },
                    period: { type: 'string', enum: ['WEEKLY', 'MONTHLY', 'YEARLY'] },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Budget created' } },
        },
      },
      '/api/budgets/summary': {
        get: {
          summary: 'Budget summary (over/near/on-track counts)',
          tags: ['Budgets'],
          responses: { 200: { description: 'Budget summary' } },
        },
      },
      '/api/analytics/overview': {
        get: {
          summary: 'Financial overview (income, expenses, balance, savings rate)',
          tags: ['Analytics'],
          responses: { 200: { description: 'Overview metrics' } },
        },
      },
      '/api/analytics/monthly': {
        get: {
          summary: 'Monthly income vs expense breakdown',
          tags: ['Analytics'],
          parameters: [
            { name: 'months', in: 'query', schema: { type: 'integer', default: 6 } },
          ],
          responses: { 200: { description: 'Monthly breakdown array' } },
        },
      },
      '/api/analytics/categories': {
        get: {
          summary: 'Spending breakdown by category',
          tags: ['Analytics'],
          responses: { 200: { description: 'Category breakdown' } },
        },
      },
      '/api/analytics/trend': {
        get: {
          summary: 'Daily income/expense trend',
          tags: ['Analytics'],
          responses: { 200: { description: 'Daily trend data' } },
        },
      },
      '/api/user/profile': {
        put: {
          summary: 'Update profile (name, currency)',
          tags: ['User'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    currency: { type: 'string', example: 'EUR' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Updated user' } },
        },
      },
      '/api/user/password': {
        put: {
          summary: 'Change password',
          tags: ['User'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['currentPassword', 'newPassword'],
                  properties: {
                    currentPassword: { type: 'string' },
                    newPassword: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Password changed' }, 400: { description: 'Wrong current password' } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
