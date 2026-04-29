# 👟 Cloud Strider Project Guidelines

## 🌟 Project Overview
Cloud Strider is a high-performance, brutalist-inspired sneaker e-commerce platform. The project prioritizes a raw, bold aesthetic combined with cutting-edge frontend interactions, specifically the 3D sneaker deconstruction scroll animation.

---

## 🛠️ Tech Stack & Architecture
- **Main Backend**: ASP.NET Core 10 (MVC Pattern)
- **Security Service**: Node.js / Express (Port 7000) for specialized security logic.
- **Database**: 
    - MS SQL Server (Primary for Product & Application Identity).
    - PostgreSQL (Secondary, used by Security Service).
- **Authentication**: ASP.NET Core Identity + OAuth (Google/Facebook).
- **Frontend**: Razor Views (.cshtml), Bootstrap 5, Three.js, GSAP,  Custom CSS.
- **Animations**: Canvas-based frame-scrubbing with RAM caching for 60fps performance.

---

## 📂 Directory Structure
- `/Controllers`: Handles HTTP requests and business flow for the main ASP.NET app.
- `/Models`: Entity definitions and ViewModels.
- `/Views`: Razor templates. Use layout nesting for consistency.
- `/Data`: `ApplicationDbContext` and database configurations.
- `/server`: Node.js security service source code.
- `/wwwroot`:
    - `/css`: Modular CSS files. Avoid inline styles.
    - `/js`: Feature-specific JS (e.g., `deconstruct.js`).
    - `/videos`: Source assets for animations.
    - `/Images`: Product and UI assets.

---

## 💻 Coding Standards

### C# / Backend
- **Naming**: Use `PascalCase` for classes, methods, and public properties. Use `_camelCase` for private fields.
- **Controllers**: Keep controllers thin. Move complex logic to Helper classes or Services if the project scales.
- **Async/Await**: Always use asynchronous calls for database and I/O operations (`ToListAsync`, `SaveChangesAsync`, etc.).
- **Dependency Injection**: Inject services/contexts via constructors.

### Javascript / Frontend
- **Performance**: For scroll-based animations, use `requestAnimationFrame`. Always cache frames in memory (RAM) to avoid disk/network latency during interaction.
- **Modularity**: Encapsulate complex logic into self-invoking functions or ES6 modules.
- **DOM Access**: Cache DOM references; avoid repeated `document.getElementById` calls in high-frequency loops (like `onScroll`).

### CSS / Styling
- **Aesthetic**: Follow **Brutalist Design** principles:
    - Bold, oversized typography.
    - High-contrast color palettes (Black, White, Neon accents).
    - Hard edges (no border-radius unless specified).
    - Visible "raw" elements (grid lines, thick borders).
- **Responsiveness**: Use Bootstrap's grid system but override components to match the brutalist theme.

---

## 🗄️ Database & Migrations
- **Migrations**: Always use `Add-Migration` for schema changes. Never modify the database directly.
- **Seeding**: Initial data and admin user promotion are handled in `Program.cs`. 
- **Identity**: Custom user data should extend `ApplicationUser`.

---

## 🚀 Development Workflow
1.  **Git**: Write descriptive commit messages (e.g., `feat: add frame-caching to 3d animation`).
2.  **Admin Access**: The default admin is `ilianblagovv@gmail.com`. Ensure roles are seeded on new environment setups.
3.  **Performance Testing**: Check the 3D animation on various devices. It must maintain 60fps during scroll.

---

## ⚠️ Important Notes
- **Video Assets**: When adding new deconstruction animations, ensure the video is optimized for frame extraction.
- **Security**: Never hardcode secrets. Use `appsettings.json` for development and Environment Variables/User Secrets for production.
