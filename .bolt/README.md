# Bolt.new Project Configuration

## Express Server Hard Rule

This project enforces the use of **Express.js server architecture** as a hard rule. All AI agents and developers must comply with the specifications outlined in `express-server-rule.md`.

### Quick Reference

- **Backend Framework**: Express.js (CommonJS)
- **Protocol**: HTTP only (no SSL/HTTPS)
- **Port**: 3001
- **Module System**: CommonJS (`require`/`module.exports`)

### Rule Files

1. `express-server-rule.md` - Complete rule specification
2. `config.json` - Machine-readable configuration
3. `README.md` - This overview file

### Compliance Check

Before making any backend changes, verify:
- ✅ Express.js is used
- ✅ CommonJS module system
- ✅ HTTP-only configuration
- ✅ Required endpoints exist
- ✅ Proper error handling

### Enforcement

This rule is **MANDATORY** and violations will result in immediate code rejection and rewrite requirements.

For questions or rule modifications, contact the project maintainer.