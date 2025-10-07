# SafroChain API Indexeur

A professional, high-performance NestJS API for indexing and querying SafroChain blockchain data. This API provides comprehensive endpoints for addresses, transactions, validators, and blocks with optimized pagination and filtering.

## 🚀 Features

- **Comprehensive Data Access**: Get detailed information about addresses, transactions, validators, and blocks
- **Professional Pagination**: Optimized pagination with metadata and filtering
- **Auto-Generated Swagger Documentation**: Interactive API documentation
- **TypeORM Integration**: Efficient database queries with PostgreSQL
- **Validation & Error Handling**: Robust input validation and error responses
- **Environment Configuration**: Flexible configuration via environment variables

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

## 🛠️ Installation

1. **Clone and navigate to the project:**

```bash
cd safrochain_api_indexeur
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# ========== PostgreSQL Config ==========
DB_HOST=localhost
DB_PORT=5432
DB_NAME=safrochain_indexdb
DB_USER=safrochain_indexuser
DB_PASSWORD=rootroot

# ========== Application Config ==========
APP_PORT=3000
APP_NAME=SafroChain API
APP_VERSION=1.0.0
APP_DESCRIPTION=Professional blockchain indexer API for SafroChain

# ========== API Configuration ==========
API_PREFIX=api/v1
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100

# ========== Swagger Configuration ==========
SWAGGER_TITLE=SafroChain API
SWAGGER_DESCRIPTION=Professional blockchain indexer API for SafroChain
SWAGGER_VERSION=1.0.0
SWAGGER_PATH=docs
```

4. **Build and start the application:**

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📚 API Documentation

Once the server is running, visit:

- **API Base URL**: `http://localhost:3000/api/v1`
- **Swagger Documentation**: `http://localhost:3000/docs`

## 🔗 API Endpoints

### Address Endpoints

- `GET /api/v1/address/{address}` - Get comprehensive address information
- `GET /api/v1/address/{address}/transactions` - Get address transactions (paginated)
- `GET /api/v1/address/{address}/balance` - Get address balance
- `GET /api/v1/address/{address}/vesting` - Get vesting information
- `GET /api/v1/address/{address}/governance` - Get governance participation

### Transaction Endpoints

- `GET /api/v1/transaction/{hash}` - Get transaction details
- `GET /api/v1/transaction` - Get transactions list (paginated)
- `GET /api/v1/transaction/{hash}/messages` - Get transaction messages
- `GET /api/v1/transaction/{hash}/statistics` - Get transaction statistics

### Validator Endpoints

- `GET /api/v1/validator/{address}` - Get validator information
- `GET /api/v1/validator` - Get validators list (paginated)
- `GET /api/v1/validator/{address}/description` - Get validator description
- `GET /api/v1/validator/{address}/commission` - Get validator commission
- `GET /api/v1/validator/{address}/voting-power` - Get validator voting power
- `GET /api/v1/validator/{address}/status` - Get validator status
- `GET /api/v1/validator/{address}/statistics` - Get validator statistics
- `GET /api/v1/validator/{address}/activity` - Get validator recent activity

### Block Endpoints

- `GET /api/v1/block/height/{height}` - Get block by height
- `GET /api/v1/block/hash/{hash}` - Get block by hash
- `GET /api/v1/block` - Get blocks list (paginated)

## 📊 Pagination

All list endpoints support professional pagination:

```typescript
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1000,
    "totalPages": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

## 🔍 Filtering

### Transaction Filtering

- `address`: Filter by involved address
- `message_type`: Filter by message type
- `success`: Filter by success status

### Validator Filtering

- `status`: Filter by validator status (0=Bonded, 1=Unbonding, 2=Unbonded, 3=Jailed)
- `jailed`: Filter by jailed status
- `search`: Search by moniker, operator address, or consensus address

### Block Filtering

- `proposer`: Filter by proposer address
- `min_txs`: Minimum number of transactions
- `max_txs`: Maximum number of transactions

## 🏗️ Architecture

```
src/
├── config/           # Configuration files
├── common/           # Shared DTOs and utilities
├── entities/         # TypeORM entities
├── modules/          # Feature modules
│   ├── address/      # Address-related functionality
│   ├── transaction/  # Transaction-related functionality
│   ├── validator/    # Validator-related functionality
│   └── block/        # Block-related functionality
├── app.module.ts     # Main application module
└── main.ts          # Application entry point
```

## 🗄️ Database Schema

The API works with the following main entities:

- **Account**: User accounts and addresses
- **Transaction**: Blockchain transactions
- **Message**: Individual messages within transactions
- **Block**: Blockchain blocks
- **Validator**: Validator information and status
- **Proposal**: Governance proposals
- **VestingAccount**: Vesting account information

## 🚀 Performance Features

- **Connection Pooling**: Optimized database connection management
- **Query Optimization**: Efficient TypeORM queries with proper indexing
- **Pagination**: Cursor-based pagination for large datasets
- **Caching Ready**: Structure prepared for Redis caching implementation
- **Error Handling**: Comprehensive error handling and validation

## 🔧 Development

### Available Scripts

```bash
npm run start:dev    # Start in development mode
npm run build        # Build for production
npm run start:prod   # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:cov     # Run tests with coverage
```

### Code Structure

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and data access
- **DTOs**: Data transfer objects for validation
- **Entities**: Database models
- **Modules**: Feature-based organization

## 📝 Environment Variables

| Variable            | Description             | Default              |
| ------------------- | ----------------------- | -------------------- |
| `DB_HOST`           | Database host           | localhost            |
| `DB_PORT`           | Database port           | 5432                 |
| `DB_NAME`           | Database name           | safrochain_indexdb   |
| `DB_USER`           | Database user           | safrochain_indexuser |
| `DB_PASSWORD`       | Database password       | rootroot             |
| `APP_PORT`          | Application port        | 3000                 |
| `API_PREFIX`        | API route prefix        | api/v1               |
| `DEFAULT_PAGE_SIZE` | Default pagination size | 20                   |
| `MAX_PAGE_SIZE`     | Maximum pagination size | 100                  |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

---

**SafroChain API Indexeur** - Professional blockchain data access made simple.
