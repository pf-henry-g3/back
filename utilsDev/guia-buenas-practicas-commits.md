# 🧾 Guía de Buenas Prácticas para Commits

Este documento define la convención oficial de commits del proyecto, basada en el estándar **Conventional Commits**.  
El objetivo es mantener un historial ordenado, legible y fácil de interpretar para todo el equipo.

---

## 🧱 Tipos principales de commits

| Tipo | Cuándo usarlo | Ejemplo |
|------|----------------|----------|
| feat | Nueva funcionalidad | `feat(auth): add role-based access control` |
| fix | Solución de error o bug | `fix(users): correct password hash validation` |
| refactor | Cambio interno sin alterar el comportamiento | `refactor(auth): simplify token validation logic` |
| chore | Tareas de mantenimiento o configuración | `chore(env): update .env.example with new variables` |
| docs | Cambios en documentación | `docs(readme): add setup instructions for database` |
| test | Agregar o modificar tests | `test(auth): add unit tests for AuthGuard` |
| style | Cambios de formato o estilo de código (sin afectar lógica) | `style(users): apply Prettier formatting` |
| perf | Mejora de rendimiento | `perf(api): optimize query execution time` |
| build | Cambios en build, dependencias o CI/CD | `build(ci): add GitHub Actions for testing` |
| revert | Revertir un commit anterior | `revert: revert "feat(auth): add JWT guard"` |

---

## 🧩 Estructura de un commit

Cada mensaje debe seguir la estructura:

```
<tipo>(<scope>): <resumen corto>

<opcional cuerpo del mensaje>

<opcional pie de mensaje>
```

### 📘 Ejemplo simple

```
feat(auth): implement JWT authentication
```

### 📘 Ejemplo extendido

```
feat(auth): implement JWT authentication

- Added JWT strategy and passport integration
- Created AuthGuard for route protection
- Updated user entity with token payload

Closes #42
```

---

## 💡 Consejos clave

- **Usar modo imperativo**
  - ✅ add, update, fix  
  - ❌ added, fixed, updates

- **Primera letra en minúscula, sin punto final.**
  - ✅ `feat(users): add endpoint for user creation`  
  - ❌ `Feat(Users): Added endpoint for user creation.`

- **Un solo tema por commit.**
  Si hiciste varias cosas distintas, dividilas en commits separados.

- **Usar inglés técnico.**
  Facilita la colaboración y mantiene coherencia con la comunidad open source.

- **Usar scope (ámbito) descriptivo.**
  Indica la parte del proyecto afectada: `auth`, `users`, `products`, `orders`, etc.

- **Usar el cuerpo del commit cuando haya cambios complejos.**
  Las viñetas ayudan a resumir qué hiciste y por qué.

- **Evitar commits genéricos como:**
  - ❌ update stuff
  - ❌ fix bugs  
  - ✅ `fix(products): correct stock validation logic`

---

## 🧭 Mini “chuleta” rápida para tus commits

| Situación | Plantilla rápida |
|------------|------------------|
| Nueva funcionalidad | `feat(<scope>): <acción>` |
| Corrección de bug | `fix(<scope>): <qué se corrigió>` |
| Refactor interno | `refactor(<scope>): <qué se mejoró>` |
| Documentación | `docs(<archivo o sección>): <qué se agregó>` |
| Cambio de configuración | `chore(<scope>): <descripción>` |
| Actualización de tests | `test(<scope>): <qué test agregaste>` |
| Cambio de estilo o formato | `style(<scope>): <qué ajustaste>` |
| Mejora de rendimiento | `perf(<scope>): <qué optimizaste>` |
| Build o CI/CD | `build(<scope>): <qué configuraste>` |
| Reversión | `revert: revert "<commit anterior>"` |

---

## 🧰 Ejemplos reales

```
feat(orders): restrict GET /orders/:id to the logged-in user's orders
fix(products): correct CRUD logic for products and categories
refactor(auth): simplify guard logic and improve readability
docs(readme): add instructions for environment setup
chore(env): add example variables for local development
```

---

## 🧱 Plantilla para commits grandes

Cuando un cambio incluye varias acciones:

```
<tipo>(<scope>): <resumen general>

- <detalle 1>
- <detalle 2>
- <detalle 3>
(optional) Closes #<número de issue>
```

### Ejemplo:

```
feat(users): implement automatic superadmin creation

- Added default superadmin on first boot
- Updated role assignment logic
- Secured admin-only endpoints
```

---

## 🚫 Errores comunes

| Error | Alternativa correcta |
|--------|------------------------|
| `fix: fixed the bug in login` | `fix(auth): correct login validation bug` |
| `update code` | `refactor(core): clean up unused imports` |
| `final changes` | `chore(project): minor adjustments before release` |

---

## ✅ Beneficios de seguir esta convención

- Historial limpio y entendible  
- Facilita los code reviews  
- Permite generar changelogs automáticos  
- Mejora la colaboración en equipo  
- Evita commits ambiguos o redundantes
