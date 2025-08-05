# Professional B2B Development Standards

## Philosophy: Business Velocity with Professional Quality

This project uses a **business-focused quality approach** that prioritizes:

1. **Security** - Prevent vulnerabilities and data breaches
2. **Runtime Correctness** - Prevent crashes and data loss
3. **Business Logic** - Code that impacts customer experience
4. **Style Preferences** - Nice-to-have but not blocking

## Quality Tiers

### 🔴 CRITICAL (Blocks Deployment)
- Security vulnerabilities
- Runtime crashes
- Data loss scenarios
- Authentication/authorization bypasses

### 🟡 HIGH (Review Required)
- Performance issues
- Accessibility problems
- Major UX bugs
- API contract changes

### 🟢 MEDIUM (Fix Gradually)
- Code organization
- Minor optimizations
- Documentation gaps

### ⚪ LOW (Ignore for Now)
- Style preferences (`||` vs `??`)
- Import order
- Spacing and formatting
- Academic "best practices"

## Development Scripts

### Fast Development Mode
```bash
# Ultra-fast linting (only critical issues)
npm run lint:dev

# Fast type checking
npm run typecheck

# Quick development validation
npm run dev:check

# Development build (faster, relaxed rules)
npm run build:dev
```

### Production Mode
```bash
# Full linting (includes style warnings)
npm run lint

# Production build (strict standards)
npm run build

# Complete validation
npm run validate
```

## ESLint Configuration

### Production Rules (`eslint.config.mjs`)
- **Errors**: Security, runtime crashes, unused variables
- **Warnings**: Style preferences, minor quality issues
- **Rationale**: Catches real issues while allowing development flexibility

### Development Rules (`eslint.config.dev.mjs`)
- **Errors**: Only critical security and runtime issues
- **Off**: All style and preference rules
- **Rationale**: Maximum development velocity with safety net

## CI/CD Pipeline Strategy

### Development Branches (`ci-dev.yml`)
- Fast validation (< 2 minutes)
- Security + runtime checks only
- Unit tests only
- Quick feedback loop

### Production Branches (`ci.yml`)
- Full validation (< 10 minutes)
- All tests + integration tests
- Complete security scan
- Production build verification

## Code Quality Guidelines

### What We Care About
✅ **Security**: No XSS, SQL injection, eval, etc.  
✅ **Crashes**: No undefined variables, type errors  
✅ **Business Logic**: User flows work correctly  
✅ **Performance**: App loads fast, no memory leaks  
✅ **Tests**: Critical user journeys are tested  

### What We Don't Obsess Over
❌ **`||` vs `??`**: Both work, developer choice  
❌ **Import order**: Auto-formatters handle this  
❌ **Explicit types**: Sometimes `any` is pragmatic  
❌ **Console.log**: Useful for debugging, remove before prod  
❌ **Perfect async/await**: Focus on functionality first  

## Development Workflow

### Daily Development
1. Use `npm run dev:check` for quick validation
2. Focus on business requirements, not style rules
3. Console.log debugging is allowed and encouraged
4. Fix security/runtime errors immediately

### Pre-commit
1. Run `npm run pre-commit` (formats, fixes, checks)
2. Address any ERRORS (warnings are OK)
3. Commit with confidence

### Pull Request
1. CI runs full validation automatically
2. Security and runtime issues block merge
3. Style warnings are informational only
4. Code review focuses on business logic

## Benefits of This Approach

### For Developers
- **10x faster local development** (no waiting for style warnings)
- **Clear priorities** (fix crashes before semicolons)
- **Less frustration** (warnings don't block work)
- **Focus on features** (what customers actually see)

### For Business
- **Faster feature delivery** (less time on academic rules)
- **Professional quality** (security and reliability maintained)
- **Team velocity** (new developers contribute immediately)
- **Real impact** (focus on user experience)

### For Customers
- **Secure application** (all security checks maintained)
- **Reliable experience** (no crashes or data loss)
- **Fast features** (team focuses on business value)
- **Professional polish** (without sacrificing velocity)

## Examples

### ✅ What Gets Flagged (Errors)
```typescript
// Security issue - BLOCKS deployment
eval(userInput);

// Runtime crash - BLOCKS deployment
const user = getUser();
console.log(user.name); // user might be null

// Unused variable - BLOCKS deployment  
const unusedVar = 'test';
```

### ⚠️ What Gets Warned (Informational)
```typescript
// Style preference - WARNING only
const value = data || fallback; // vs data ?? fallback

// Console statement - WARNING only
console.log('Debug info:', data);

// Any type - WARNING only
const response: any = await api.call();
```

### ✅ What's Allowed
```typescript
// Defensive programming
if (user && user.preferences && user.preferences.theme) {
  // This is good defensive coding, even if "unnecessary"
}

// Pragmatic any usage
const formData: any = new FormData(); // FormData has complex types

// Development debugging
console.log('API Response:', response);
```

## Rationale

This approach recognizes that **different code quality aspects have different business impacts**:

- **Security vulnerability** = Customer data breach = $100k+ incident
- **Runtime crash** = Customer can't use app = Lost revenue
- **Missing semicolon** = Zero customer impact = Academic preference

By focusing our energy on high-impact issues and being pragmatic about low-impact style preferences, we deliver better software faster while maintaining professional standards.

## Migration Strategy

1. **Week 1**: Team adopts new development scripts
2. **Week 2**: Update local development workflows  
3. **Week 3**: Measure development velocity improvement
4. **Ongoing**: Gradual style cleanup during regular maintenance

Success metrics:
- Faster local development (target: < 10 second feedback)
- Fewer CI failures due to style issues
- Maintained security/reliability standards
- Improved team velocity and satisfaction