// @vitest-environment happy-dom
//
// Vérifie l'invariant CLAUDE.md « la console opérateur n'est jamais exposée »
// au niveau du HTML rendu côté client :
//   - le <meta name="robots" content="noindex, nofollow"> EST présent quand
//     on est sur une route /admin/*
//   - il est ABSENT après navigation vers une autre route
//   - il est ABSENT au montage initial du hub d'accueil
//
// Si ces invariants se cassent (mauvais layout, oubli du démontage), le test
// claque avant que la prod ne se prenne une indexation par Googlebot.

import { afterEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { SiteLanding } from '../routes/public/landing.js';
import { AdminLayout } from '../routes/admin/layout.js';
import { AdminVueEnsemble } from '../routes/admin/vue-ensemble.js';

function noindexMeta(): HTMLMetaElement | null {
  return document.querySelector('meta[name="robots"][data-pli-admin="1"]');
}

afterEach(() => {
  // Nettoyage défensif au cas où un test laisse une balise traîner.
  noindexMeta()?.remove();
});

describe('Console opérateur — invariant noindex', () => {
  it('AUCUN <meta name="robots"> sur la landing publique /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<SiteLanding />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(noindexMeta()).toBeNull();
  });

  it('INJECTE <meta name="robots" content="noindex, nofollow"> sur /admin', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminVueEnsemble />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    const meta = noindexMeta();
    expect(meta).not.toBeNull();
    expect(meta!.getAttribute('content')).toBe('noindex, nofollow');
  });

  it('RETIRE la balise au démontage de AdminLayout', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminVueEnsemble />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(noindexMeta()).not.toBeNull();
    unmount();
    expect(noindexMeta()).toBeNull();
  });

  it('ne duplique pas la balise si AdminLayout est monté deux fois (pattern d’erreur)', () => {
    const first = render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminVueEnsemble />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    // Deuxième arbre rendu en parallèle (simule un bug de routing)
    const second = render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminVueEnsemble />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(document.querySelectorAll('meta[name="robots"][data-pli-admin="1"]').length).toBe(1);
    first.unmount();
    second.unmount();
  });
});
