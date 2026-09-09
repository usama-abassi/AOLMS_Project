# AOLMS Development Plan

## Stage 1: Repository Setup
- [ ] Initialize project structure
- [ ] Create `docs/DEVELOPMENT_PLAN.md`
- [ ] Initialize `.gitignore`
- [ ] Create `.env.example`

## Stage 2: Backend Foundation (NestJS)
- [ ] Initialize NestJS `server`
- [ ] Configure environment variables
- [ ] Setup TypeORM and database connection
- [ ] Implement Auth (Supabase JWT validation)
- [ ] Guards, Roles, Validation, Error Handling
- [ ] API Response wrapper
- [ ] Health endpoint

## Stage 3: Backend Entities
- [ ] Define TypeORM entities: `profiles`, `projects`, `orders`, `order_assignments`, `delivery_submissions`, `assurance_tickets`, `assurance_submissions`, `ont_inventory`, `cpe_inventory`, `cpe_replacements`, `attachments`, `audit_logs`

## Stage 4: Backend Modules & Logic
- [ ] Implement modules/services/controllers for all entities
- [ ] Implement business rules (assignment, lifecycle, 24-hour edit)

## Stage 5: Frontend Foundation
- [ ] Initialize Vite React `client`
- [ ] Setup Routing, Supabase Auth, TanStack Query
- [ ] Setup theme system (CSS variables)
- [ ] Responsive layout shell

## Stage 6: Implementation
- [ ] Admin interface
- [ ] Controller interface (Spreadsheet)
- [ ] Technician interface (Mobile forms)
- [ ] Local IndexedDB draft system
- [ ] Excel import/export
- [ ] Reporting

## Stage 7: Quality Assurance
- [ ] Tests (Unit, Component, E2E)
- [ ] Security hardening
- [ ] Linting/Type checking

## Stage 8: Production Readiness
- [ ] README.md update
- [ ] Deployment notes
