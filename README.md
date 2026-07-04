# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

# shadi

## Project Structure

- `frontend/` - React + Vite client app for Vercel.
- `backend/` - Express + Socket.IO + Sequelize API for Railway or any Node host.

## Local Commands

From the project root:

```bash
npm run dev
npm run server
npm run dev:all
npm run build
```

## Hosting

Frontend:
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

Backend:
- Root directory: `backend`
- Start command: `npm start`
- Health check: `/api/health`
