// AdminUtilisateurs — comptes plateforme (sub-lot 12d).
// Porté de _wireframe/src/admin-business.jsx (AdminUtilisateurs).
//
// Action sensible journalisée : « Réinitialiser le mot de passe ».
// AUCUN MONTANT — uniquement des comptes, rôles, dates.

import { useEffect, useMemo, useState } from 'react';
import type { Entreprise, UtilisateurPlateforme } from '@pli/types';
import {
  Avatar,
  Button,
  Card,
  SearchField,
  Select,
  StatusPill,
  Table,
  useToast,
} from '@pli/ui';
import { creerAdminServiceMock, type ContexteAdmin } from '../../services/index.js';
import { AdminPageHeader } from './_page-header.js';

const CONTEXTE_DEMO: ContexteAdmin = { type: 'admin', adminId: 'u1' };

const ROLES = [
  { value: 'Super Admin', label: 'Super Admin' },
  { value: 'Support N2', label: 'Support N2' },
  { value: 'Admin RH', label: 'Admin RH' },
  { value: 'Gestionnaire', label: 'Gestionnaire' },
  { value: 'DAF', label: 'DAF' },
];

export function AdminUtilisateurs() {
  const services = useMemo(() => ({ admin: creerAdminServiceMock() }), []);
  const pousser = useToast();

  const [utilisateurs, setUtilisateurs] = useState<UtilisateurPlateforme[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [recherche, setRecherche] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    void (async () => {
      const [u, e] = await Promise.all([
        services.admin.listerUtilisateursPlateforme(CONTEXTE_DEMO),
        services.admin.listerEntreprises(CONTEXTE_DEMO),
      ]);
      setUtilisateurs(u);
      setEntreprises(e);
    })();
  }, [services]);

  const filtrees = useMemo(() => {
    return utilisateurs.filter((u) => {
      if (recherche && !`${u.nom} ${u.email}`.toLowerCase().includes(recherche.toLowerCase()))
        return false;
      if (role && u.role !== role) return false;
      return true;
    });
  }, [utilisateurs, recherche, role]);

  const entreprisesParId = useMemo(
    () => new Map(entreprises.map((e) => [e.id, e])),
    [entreprises],
  );

  const reinitialiser = async (u: UtilisateurPlateforme) => {
    await services.admin.reinitialiserMotDePasseUtilisateur(CONTEXTE_DEMO, u.id);
    pousser({
      message: `Lien de réinitialisation envoyé à ${u.email}`,
      tone: 'succes',
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Utilisateurs"
        subtitle={`${utilisateurs.length} comptes au total — super admins + administrateurs RH`}
        actions={
          <Button variant="secondary" icon="Download">
            Exporter
          </Button>
        }
      />

      <div className="p-8 space-y-4">
        <Card padding="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[260px]">
              <SearchField
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher par nom ou e-mail…"
              />
            </div>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Tous les rôles"
              icon="SlidersHorizontal"
              options={ROLES}
              className="min-w-[200px]"
            />
            <div className="ml-auto text-[12px] text-texte-secondaire">
              {filtrees.length} résultat{filtrees.length > 1 ? 's' : ''}
            </div>
          </div>
        </Card>

        <Card padding="p-0">
          <Table
            columns={[
              {
                label: 'Utilisateur',
                render: (r) => (
                  <div className="flex items-center gap-2.5">
                    <Avatar name={r.nom} size={30} />
                    <div>
                      <div className="font-medium">{r.nom}</div>
                      <div className="text-[12px] text-texte-secondaire">{r.email}</div>
                    </div>
                  </div>
                ),
              },
              {
                label: 'Rôle',
                width: 150,
                render: (r) => {
                  const isPlateforme = r.role === 'Super Admin' || r.role === 'Support N2';
                  return (
                    <span
                      className={`text-[11.5px] px-2 py-0.5 rounded font-medium ${isPlateforme ? 'bg-cachet/15 text-cachet' : 'bg-surface text-encre'}`}
                    >
                      {r.role}
                    </span>
                  );
                },
              },
              {
                label: 'Entreprise',
                render: (r) => {
                  if (!r.entrepriseId) {
                    return (
                      <span className="text-texte-secondaire italic">Plateforme Pli</span>
                    );
                  }
                  const e = entreprisesParId.get(r.entrepriseId);
                  return <span>{e?.nom ?? r.entrepriseId}</span>;
                },
              },
              {
                label: '2FA',
                width: 110,
                render: (r) =>
                  r.a2f ? (
                    <StatusPill tone="succes" size="sm">
                      Activée
                    </StatusPill>
                  ) : (
                    <StatusPill tone="attente" size="sm">
                      Désactivée
                    </StatusPill>
                  ),
              },
              {
                label: 'Statut',
                width: 120,
                render: (r) =>
                  r.statut === 'actif' ? (
                    <StatusPill tone="succes" size="sm">
                      Actif
                    </StatusPill>
                  ) : (
                    <StatusPill tone="neutre" size="sm" icon="Power">
                      Suspendu
                    </StatusPill>
                  ),
              },
              {
                label: 'Dernière connexion',
                width: 200,
                render: (r) => (
                  <span className="text-texte-secondaire tabular-nums">
                    {r.derniereConnexion}
                  </span>
                ),
              },
              {
                label: '',
                width: 150,
                render: (r) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="KeyRound"
                    onClick={() => reinitialiser(r)}
                  >
                    Réinitialiser
                  </Button>
                ),
              },
            ]}
            data={filtrees}
          />
        </Card>
      </div>
    </>
  );
}
