// AdminSupport — tickets escaladés (sub-lot 12d).
// Porté de _wireframe/src/admin-ops.jsx (AdminSupport).
//
// Actions sensibles journalisées :
//   - « Se connecter en tant que » → AdminService.impersonnerEntreprise + audit
//   - « Marquer comme résolu » → AdminService.marquerTicketResolu + audit
//
// AUCUN MONTANT — uniquement la conversation ticket.

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  Entreprise,
  PrioriteTicket,
  TicketSupport,
} from '@pli/types';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Icon,
  SearchField,
  StatusPill,
  useToast,
  type StatusTone,
} from '@pli/ui';
import { creerAdminServiceMock, type ContexteAdmin } from '../../services/index.js';
import { AdminPageHeader } from './_page-header.js';

const CONTEXTE_DEMO: ContexteAdmin = { type: 'admin', adminId: 'u1' };

function prioritePill(p: PrioriteTicket) {
  const map: Record<PrioriteTicket, { tone: StatusTone; libelle: string; icon?: 'TriangleAlert' }> = {
    critique: { tone: 'erreur', libelle: 'Critique', icon: 'TriangleAlert' },
    haute: { tone: 'attente', libelle: 'Haute' },
    normale: { tone: 'info', libelle: 'Normale' },
    basse: { tone: 'neutre', libelle: 'Basse' },
  };
  const { tone, libelle, icon } = map[p];
  return (
    <StatusPill tone={tone} size="sm" icon={icon}>
      {libelle}
    </StatusPill>
  );
}

type Filtre = 'ouverts' | 'critique' | 'resolus' | 'tous';

export function AdminSupport() {
  const services = useMemo(() => ({ admin: creerAdminServiceMock() }), []);
  const pousser = useToast();

  const [tickets, setTickets] = useState<TicketSupport[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [filtre, setFiltre] = useState<Filtre>('ouverts');
  const [reply, setReply] = useState('');

  useEffect(() => {
    void (async () => {
      const [t, e] = await Promise.all([
        services.admin.listerTicketsSupport(CONTEXTE_DEMO),
        services.admin.listerEntreprises(CONTEXTE_DEMO),
      ]);
      setTickets(t);
      setEntreprises(e);
      if (!selected && t.length > 0) setSelected(t[0]!.id);
    })();
  }, [services, selected]);

  const entreprisesParId = useMemo(
    () => new Map(entreprises.map((e) => [e.id, e])),
    [entreprises],
  );

  const liste = useMemo(() => {
    return tickets.filter((t) => {
      if (filtre === 'ouverts') return t.statut !== 'resolue';
      if (filtre === 'critique') return t.priorite === 'critique';
      if (filtre === 'resolus') return t.statut === 'resolue';
      return true;
    });
  }, [tickets, filtre]);

  const courante = tickets.find((t) => t.id === selected) ?? liste[0] ?? null;
  const entCourante = courante ? entreprisesParId.get(courante.entrepriseId) : null;

  const impersonner = async () => {
    if (!courante || !entCourante) return;
    await services.admin.impersonnerEntreprise(CONTEXTE_DEMO, entCourante.id);
    pousser({
      message: `Impersonation enregistrée — vous opérez au nom de ${entCourante.nom}`,
      tone: 'info',
    });
  };

  const marquerResolu = async () => {
    if (!courante) return;
    await services.admin.marquerTicketResolu(CONTEXTE_DEMO, courante.id);
    pousser({ message: `Ticket ${courante.numero} marqué comme résolu`, tone: 'succes' });
  };

  const envoyerReponse = () => {
    if (!reply.trim()) return;
    setReply('');
    pousser({ message: 'Réponse envoyée', tone: 'succes' });
  };

  const compteurs = {
    ouverts: tickets.filter((t) => t.statut !== 'resolue').length,
    critique: tickets.filter((t) => t.priorite === 'critique').length,
    resolus: tickets.filter((t) => t.statut === 'resolue').length,
    tous: tickets.length,
  };

  return (
    <>
      <AdminPageHeader
        title="Support"
        subtitle="Tickets escaladés depuis les entreprises clientes"
      />

      <div className="px-8 pb-8 pt-6">
        <Card padding="p-0" className="overflow-hidden">
          <div
            className="grid grid-cols-1 lg:grid-cols-[380px_1fr]"
            style={{ minHeight: 680 }}
          >
            {/* Liste */}
            <div className="border-r border-bordure flex flex-col">
              <div className="p-4 border-b border-bordure space-y-3">
                <SearchField
                  value=""
                  onChange={() => {}}
                  placeholder="Rechercher un ticket…"
                  size="sm"
                />
                <div className="flex items-center gap-1 bg-surface p-1 rounded-md">
                  {(
                    [
                      ['ouverts', 'Ouverts', compteurs.ouverts],
                      ['critique', 'Critique', compteurs.critique],
                      ['resolus', 'Résolus', compteurs.resolus],
                      ['tous', 'Tous', compteurs.tous],
                    ] as const
                  ).map(([k, l, c]) => (
                    <button
                      type="button"
                      key={k}
                      onClick={() => setFiltre(k)}
                      className={`flex-1 h-7 text-[11.5px] rounded font-medium transition ${
                        filtre === k
                          ? 'bg-white text-encre shadow-sm'
                          : 'text-texte-secondaire hover:text-encre'
                      }`}
                    >
                      {l} <span className="text-texte-secondaire">({c})</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-bordure">
                {liste.length === 0 ? (
                  <EmptyState icon="LifeBuoy" title="Aucun ticket" />
                ) : (
                  liste.map((t) => {
                    const tEnt = entreprisesParId.get(t.entrepriseId);
                    const active = t.id === courante?.id;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setSelected(t.id)}
                        className={`w-full text-left p-4 transition ${active ? 'bg-papier' : 'hover:bg-surface/60'}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] text-texte-secondaire">
                            {t.numero}
                          </span>
                          {prioritePill(t.priorite)}
                        </div>
                        <div className="text-[13.5px] font-medium text-encre mt-1 truncate">
                          {t.sujet}
                        </div>
                        <div className="text-[11.5px] text-texte-secondaire mt-0.5 flex items-center gap-1.5">
                          <Icon name="Building2" size={10} />
                          {tEnt?.nom ?? t.entrepriseId}
                        </div>
                        <div className="text-[11px] text-texte-secondaire mt-1 tabular-nums">
                          {t.ouvertLe}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Détail */}
            {!courante ? (
              <EmptyState icon="LifeBuoy" title="Sélectionnez un ticket" />
            ) : (
              <div className="flex flex-col">
                <div className="p-5 border-b border-bordure">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[12px] text-texte-secondaire">
                          {courante.numero}
                        </span>
                        {prioritePill(courante.priorite)}
                        {courante.statut === 'resolue' && (
                          <StatusPill tone="succes" size="sm">
                            Résolue
                          </StatusPill>
                        )}
                      </div>
                      <h2 className="text-[18px] font-semibold text-encre">
                        {courante.sujet}
                      </h2>
                      <div className="mt-1 text-[12.5px] text-texte-secondaire flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1.5">
                          <Icon name="Building2" size={12} />
                          {entCourante ? (
                            <Link
                              to={`/admin/entreprises/${entCourante.id}`}
                              className="text-encre hover:underline"
                            >
                              {entCourante.nom}
                            </Link>
                          ) : (
                            courante.entrepriseId
                          )}
                        </span>
                        <span>·</span>
                        <span>
                          <Icon name="User" size={12} className="inline" />{' '}
                          {courante.contact} ({courante.role})
                        </span>
                        <span>·</span>
                        <span>Canal : {courante.canal}</span>
                        <span>·</span>
                        <span>Ouvert le {courante.ouvertLe}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon="LogIn"
                        onClick={impersonner}
                      >
                        Se connecter en tant que
                      </Button>
                      {courante.statut !== 'resolue' && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon="Check"
                          onClick={marquerResolu}
                        >
                          Marquer comme résolu
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-papier/40">
                  {courante.messages.map((m, i) => {
                    const isClient = m.auteur === 'client';
                    return (
                      <div
                        key={i}
                        className={`flex items-end gap-2.5 ${isClient ? 'flex-row' : 'flex-row-reverse'}`}
                      >
                        <Avatar name={m.nom} size={30} />
                        <div className={`max-w-[70%] ${isClient ? '' : 'items-end flex flex-col'}`}>
                          <div
                            className={`text-[11px] text-texte-secondaire mb-1 ${isClient ? '' : 'text-right'}`}
                          >
                            <span className="font-medium text-encre">{m.nom}</span> · {m.date}
                          </div>
                          <div
                            className={`rounded-lg px-3 py-2 text-[13.5px] ${isClient ? 'bg-white border border-bordure text-encre' : 'bg-encre text-white'}`}
                          >
                            {m.texte}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {courante.statut !== 'resolue' && (
                  <div className="p-4 border-t border-bordure bg-white">
                    <div className="flex items-end gap-2">
                      <div className="flex-1 rounded-md border border-bordure focus-within:border-encre transition">
                        <textarea
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          placeholder="Votre réponse au client…"
                          rows={3}
                          className="w-full p-3 bg-transparent outline-none text-[14px] resize-none"
                        />
                      </div>
                      <Button
                        variant="primary"
                        icon="Send"
                        disabled={!reply.trim()}
                        onClick={envoyerReponse}
                      >
                        Envoyer
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
