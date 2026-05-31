// AdminCommunications — annonces + modèles e-mail (sub-lot 12d).
// Porté de _wireframe/src/admin-ops.jsx (AdminCommunications).
//
// Action sensible journalisée : « Programmer une annonce » → audit type
// `communication`.

import { useEffect, useMemo, useState } from 'react';
import type { AnnoncePlateforme, ModeleEmail } from '@pli/types';
import {
  Button,
  Card,
  Icon,
  Modal,
  Select,
  StatusPill,
  Table,
  TextField,
  useToast,
} from '@pli/ui';
import { creerAdminServiceMock, type ContexteAdmin } from '../../services/index.js';
import { AdminPageHeader } from './_page-header.js';

const CONTEXTE_DEMO: ContexteAdmin = { type: 'admin', adminId: 'u1' };

function formatNum(n: number): string {
  return n.toLocaleString('fr-FR').replace(/,/g, ' ');
}

interface NouvelleAnnonce {
  titre: string;
  segment: string;
  canal: string;
  message: string;
}

const NOUVELLE_VIDE: NouvelleAnnonce = { titre: '', segment: '', canal: '', message: '' };

export function AdminCommunications() {
  const services = useMemo(() => ({ admin: creerAdminServiceMock() }), []);
  const pousser = useToast();

  const [annonces, setAnnonces] = useState<AnnoncePlateforme[]>([]);
  const [modeles, setModeles] = useState<ModeleEmail[]>([]);
  const [tab, setTab] = useState<'annonces' | 'modeles'>('annonces');
  const [composeOpen, setComposeOpen] = useState(false);
  const [nouvelle, setNouvelle] = useState<NouvelleAnnonce>(NOUVELLE_VIDE);

  useEffect(() => {
    void (async () => {
      const [a, m] = await Promise.all([
        services.admin.listerAnnonces(CONTEXTE_DEMO),
        services.admin.listerModelesEmail(CONTEXTE_DEMO),
      ]);
      setAnnonces(a);
      setModeles(m);
    })();
  }, [services]);

  const programmer = async () => {
    await services.admin.programmerAnnonce(
      CONTEXTE_DEMO,
      nouvelle.titre,
      nouvelle.segment,
      nouvelle.canal,
    );
    setComposeOpen(false);
    setNouvelle(NOUVELLE_VIDE);
    pousser({ message: 'Annonce programmée', tone: 'succes' });
  };

  return (
    <>
      <AdminPageHeader
        title="Communications"
        subtitle="Annonces plateforme, bannières et modèles d'e-mails transactionnels"
        actions={
          tab === 'annonces' ? (
            <Button variant="primary" icon="Megaphone" onClick={() => setComposeOpen(true)}>
              Nouvelle annonce
            </Button>
          ) : (
            <Button variant="secondary" icon="CirclePlus">
              Nouveau modèle
            </Button>
          )
        }
      />

      <div className="p-8">
        <Card padding="p-0">
          <div className="border-b border-bordure px-5 flex items-center gap-1">
            {(
              [
                ['annonces', 'Annonces & bannières', 'Megaphone', annonces.length],
                ['modeles', "Modèles d'e-mails", 'Mail', modeles.length],
              ] as const
            ).map(([k, l, ic, c]) => (
              <button
                type="button"
                key={k}
                onClick={() => setTab(k)}
                className={`flex items-center gap-2 px-4 h-12 text-[13px] font-medium transition border-b-2 ${
                  tab === k
                    ? 'border-encre text-encre'
                    : 'border-transparent text-texte-secondaire hover:text-encre'
                }`}
              >
                <Icon name={ic} size={14} />
                {l}
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full ${tab === k ? 'bg-encre text-white' : 'bg-surface text-texte-secondaire'}`}
                >
                  {c}
                </span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === 'annonces' ? (
              <div className="space-y-3">
                {annonces.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-lg border border-bordure p-4 flex items-start gap-4"
                  >
                    <div className="h-10 w-10 rounded-md bg-papier border border-bordure flex items-center justify-center text-cachet">
                      <Icon name="Megaphone" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-[14px] font-semibold text-encre">{a.titre}</h3>
                        {a.statut === 'publiee' ? (
                          <StatusPill tone="succes" size="sm">
                            Publiée
                          </StatusPill>
                        ) : (
                          <StatusPill tone="attente" size="sm" icon="Clock">
                            Programmée
                          </StatusPill>
                        )}
                      </div>
                      <div className="text-[12.5px] text-texte-secondaire mt-1">
                        <span className="inline-flex items-center gap-1.5">
                          <Icon name="Building2" size={12} />
                          {a.segment}
                        </span>
                        <span className="mx-2">·</span>
                        <span className="inline-flex items-center gap-1.5">
                          <Icon name="Send" size={12} />
                          {a.canal}
                        </span>
                      </div>
                      <div className="text-[11.5px] text-texte-secondaire mt-1">
                        {a.publiee}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" icon="PenLine">
                      Modifier
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <Table
                dense
                columns={[
                  {
                    label: 'Modèle',
                    render: (r) => (
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded bg-surface flex items-center justify-center text-encre">
                          <Icon name="Mail" size={14} />
                        </div>
                        <span className="font-medium">{r.nom}</span>
                      </div>
                    ),
                  },
                  {
                    label: 'Envois (30 j)',
                    width: 160,
                    render: (r) => (
                      <span className="tabular-nums">{formatNum(r.envois)}</span>
                    ),
                  },
                  {
                    label: 'Dernière modification',
                    width: 200,
                    render: (r) => (
                      <span className="text-texte-secondaire tabular-nums">
                        {r.derniereModif}
                      </span>
                    ),
                  },
                  {
                    label: '',
                    width: 200,
                    render: () => (
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" icon="Eye">
                          Aperçu
                        </Button>
                        <Button variant="secondary" size="sm" icon="PenLine">
                          Éditer
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={modeles}
              />
            )}
          </div>
        </Card>
      </div>

      <Modal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="Nouvelle annonce"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setComposeOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              icon="Send"
              disabled={!nouvelle.titre || !nouvelle.segment || !nouvelle.canal}
              onClick={programmer}
            >
              Programmer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextField
            label="Titre"
            placeholder="Ex. : Maintenance planifiée le 03/03/2026"
            value={nouvelle.titre}
            onChange={(e) => setNouvelle({ ...nouvelle, titre: e.target.value })}
          />
          <Select
            label="Cible"
            placeholder="Sélectionner…"
            value={nouvelle.segment}
            onChange={(e) => setNouvelle({ ...nouvelle, segment: e.target.value })}
            options={[
              { value: 'toutes', label: 'Toutes les entreprises' },
              { value: 'mensuel', label: 'Plan mensuel uniquement' },
              { value: 'annuel', label: 'Plan annuel uniquement' },
              { value: 'essai', label: 'Entreprises en essai' },
            ]}
          />
          <Select
            label="Canal"
            placeholder="Sélectionner…"
            value={nouvelle.canal}
            onChange={(e) => setNouvelle({ ...nouvelle, canal: e.target.value })}
            options={[
              { value: 'banniere', label: 'Bannière dans la console' },
              { value: 'email', label: 'E-mail aux administrateurs' },
              { value: 'les_deux', label: 'Bannière + e-mail' },
            ]}
          />
          <div>
            <div className="block text-[13px] font-medium text-encre mb-1.5">Message</div>
            <div className="rounded-md border border-bordure focus-within:border-encre transition">
              <textarea
                rows={6}
                value={nouvelle.message}
                onChange={(e) => setNouvelle({ ...nouvelle, message: e.target.value })}
                className="w-full p-3 bg-transparent outline-none text-[14px] resize-none"
                placeholder="Contenu de l'annonce…"
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
