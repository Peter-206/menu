# The Bar menu

A QR-friendly cocktail menu, a large-screen bar display, and an ingredient availability page. The bar is open, so prices are not shown. Recipes live in [`src/catalog.json`](src/catalog.json); [`COCKTAILS.md`](COCKTAILS.md) and [`supabase/seed.sql`](supabase/seed.sql) are generated from it.

## Run locally

```sh
npm install
npm run dev
```

Open the URL printed by Vite for the menu, and add `/admin/` for the staff page. Without Supabase settings, the app runs in **preview mode**: ingredient changes are stored in this browser only, and a banner says so. This is useful for reviewing the design.

## Connect live availability

1. Create a Supabase project. In its SQL editor, run [`supabase/001_ingredient_availability.sql`](supabase/001_ingredient_availability.sql), then [`supabase/seed.sql`](supabase/seed.sql).
2. Copy `.env.example` to `.env.local`. Fill in the project URL and **publishable** key from Supabase. Never put a secret or service-role key in a `VITE_` setting.
3. Restart the development server. The menu now reads shared availability, and the admin checkboxes update it. Public pages refresh availability every 15 seconds and when a browser tab becomes visible.

The requested admin is **unprotected**. Its link is absent from the guest menu, and it is marked `noindex`, but anyone who finds the address or public database calls can change stock. The SQL grants anonymous clients read access and update access to availability only; they cannot add or delete ingredient rows through the public key.

## Deploy to GitHub Pages

1. In the GitHub repository, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.
2. Add repository variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` with the same values used locally.
3. Push to `main` or run **Deploy menu** manually. The workflow checks the database settings, tests, builds, and deploys the static pages.

For this repository, the expected guest URL is `https://peter-206.github.io/menu/` and the staff URL is `https://peter-206.github.io/menu/admin/` after Pages is enabled. If the repository name or domain changes, the build uses the repository name as its base path.

Once the guest URL is live, generate a printable QR SVG:

```sh
npm run generate:qr -- https://peter-206.github.io/menu/
```

This writes `public/menu-qr.svg`. Commit and deploy that file if you want it served by the site, or print the SVG directly.

## Edit drinks

Edit `src/catalog.json`, including each drink's `recipe` ingredient IDs. Items marked `optional` are garnishes and do not remove a drink when unavailable. Then run:

```sh
npm run generate:catalog
npm test
npm run build
```

When you add a required ingredient, run the updated `supabase/seed.sql` in Supabase before deploying. The seed preserves existing stock states. The build verifies that the generated Markdown and SQL match the catalog.
