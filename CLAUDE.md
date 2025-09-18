# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 + Vite application called "AthleX" - an e-commerce demo app for women's athletic shoes. The app uses Vue Router for navigation and Tailwind CSS v4 for styling.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production to `dist/`
- `npm run preview` - Preview production build locally

Package manager: Uses pnpm (evidenced by pnpm-lock.yaml)

## Architecture

**Frontend Stack:**
- Vue 3 with Composition API (`<script setup>` syntax)
- Vue Router 4 for client-side routing
- Tailwind CSS v4 with PostCSS
- Vite as build tool with Vue DevTools plugin

**Key Application Structure:**
- Entry point: `src/main.js` mounts Vue app to `#app`
- Root component: `src/App.vue` provides layout with header navigation
- Router: `src/router/index.js` defines routes for `/menu` and `/shop` pages
- Views: `src/views/` contains page components (Menu.vue, Shop.vue)

**Data Flow:**
- Shop page (`src/views/Shop.vue`) fetches product data from `/public/data/womens-sneakers.json`
- Uses reactive refs and computed properties for state management
- Implements variant selection (color/size) with inventory checking

**Styling Setup:**
- Tailwind v4 configuration in `tailwind.config.js` (minimal config)
- PostCSS setup in `postcss.config.js` with Tailwind and Autoprefixer
- Main CSS entry: `src/assets/main.css` imports Tailwind
- Custom CSS variable: `--brand: #ef4444` (red theme color)

**Path Aliases:**
- `@` mapped to `./src` in both `vite.config.js` and `jsconfig.json`

**Node Version Requirement:**
- `^20.19.0 || >=22.12.0`

## Key Features

**Product Display System:**
- Rich text description rendering using custom Quill Delta parser
- Variant selection (color/size) with real-time inventory display
- Product specifications display with key-value pairs
- Shipping and policy information sections
- Tag-based filtering system

**Navigation:**
- Simple two-page app (Menu → Shop)
- Router-link based navigation with hover states