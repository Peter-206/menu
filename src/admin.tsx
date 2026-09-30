import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { affectedDrinkCount, trackedIngredients } from './catalog';
import { isPreview, setIngredientUnavailable } from './availability';
import { useAvailability } from './useAvailability';
import './styles.css';

function Admin() {
  const { unavailable, loading, error, refresh } = useAvailability();
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const filtered = [...trackedIngredients]
    .filter((ingredient) => ingredient.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => Number(unavailable.has(b.id)) - Number(unavailable.has(a.id)) || a.name.localeCompare(b.name));

  async function toggle(ingredientId: string, checked: boolean) {
    setSaving(ingredientId);
    setSaveError(null);
    try {
      await setIngredientUnavailable(ingredientId, checked);
      await refresh();
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : 'Could not save the change.');
    } finally {
      setSaving(null);
    }
  }

  return <main className="admin-shell">
    <header className="admin-header"><span className="eyebrow">The Bar · Staff</span><h1>Ingredient availability<span className="brand-period">.</span></h1><p>Check an ingredient when it runs out. Drinks that need it will disappear from the guest menu.</p></header>
    {isPreview && <div className="admin-note">Preview mode: changes are stored in this browser only. Connect Supabase before publishing.</div>}
    {loading ? <div className="admin-state">Loading ingredients…</div> : error ? <div className="admin-state" role="alert"><strong>Couldn’t load availability.</strong><p>{error}</p><button className="outline-button" onClick={() => void refresh()}>Try again</button></div> : <>
      <div className="admin-toolbar"><div><span className="eyebrow">Stock check</span><strong>{unavailable.size} out of stock</strong></div><label className="search-box"><span className="sr-only">Search ingredients</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ingredients" type="search" /></label></div>
      {saveError && <div className="save-error" role="alert">Couldn’t save that change: {saveError}</div>}
      <div className="ingredient-grid">{filtered.map((ingredient) => <label className={`ingredient-row ${unavailable.has(ingredient.id) ? 'is-unavailable' : ''}`} key={ingredient.id}><input type="checkbox" checked={unavailable.has(ingredient.id)} disabled={saving !== null} onChange={(event) => void toggle(ingredient.id, event.target.checked)} /><span className="custom-check" aria-hidden="true">✓</span><span className="ingredient-info"><strong>{ingredient.name}</strong><small>{affectedDrinkCount(ingredient.id)} {affectedDrinkCount(ingredient.id) === 1 ? 'drink' : 'drinks'} affected</small></span><span className="ingredient-status">{saving === ingredient.id ? 'Saving…' : unavailable.has(ingredient.id) ? 'Out' : 'In stock'}</span></label>)}</div>
      {filtered.length === 0 && <p className="admin-empty">No ingredients match your search.</p>}
    </>}
  </main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><Admin /></React.StrictMode>);
