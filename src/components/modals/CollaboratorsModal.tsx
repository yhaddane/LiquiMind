import React, { useState, useEffect } from 'react';
import {
  Users,
  X,
  Plus,
  ShieldCheck,
  Mail,
  UserCheck,
  Trash2,
  Lock,
  Check,
  AlertCircle,
  Copy,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SpaceCollaborator } from '../../types';

export const CollaboratorsModal: React.FC = () => {
  const {
    spaces,
    collaboratorSpaceTarget,
    isCollaboratorsModalOpen,
    setIsCollaboratorsModalOpen,
    inviteCollaborator,
    removeCollaborator,
    updateCollaboratorRole,
    updateCollaboratorPermissions,
  } = useApp();

  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('personal');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'EDITOR' | 'VIEWER'>('EDITOR');
  const [canAddTx, setCanAddTx] = useState(true);
  const [canBudgets, setCanBudgets] = useState(true);
  const [canAccounts, setCanAccounts] = useState(false);
  const [canInvite, setCanInvite] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (collaboratorSpaceTarget && collaboratorSpaceTarget !== 'all') {
      setSelectedSpaceId(collaboratorSpaceTarget);
    } else if (spaces.length > 0) {
      setSelectedSpaceId(spaces[0].id);
    }
  }, [collaboratorSpaceTarget, spaces, isCollaboratorsModalOpen]);

  if (!isCollaboratorsModalOpen) return null;

  const currentSpace =
    spaces.find((s) => s.id === selectedSpaceId) ||
    spaces[0] || {
      id: 'personal',
      name: 'Personnel',
      icon: '👤',
      tag: 'Perso',
      collaborators: [],
    };

  const collaborators = currentSpace.collaborators || [];

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = inviteEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFeedbackMsg({ text: 'Veuillez saisir une adresse email valide.', type: 'info' });
      return;
    }

    inviteCollaborator(currentSpace.id, cleanEmail, inviteRole, {
      canAddTransactions: canAddTx,
      canEditBudgets: canBudgets,
      canManageAccounts: canAccounts,
      canInviteOthers: canInvite,
      canViewReports: true,
    });

    setFeedbackMsg({
      text: `✅ Collaborateur ${cleanEmail} invité avec succès sur l'espace « ${currentSpace.name} » !`,
      type: 'success',
    });
    setInviteEmail('');
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/?space=${currentSpace.id}&invite=${Date.now().toString(36)}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getRoleBadge = (role: SpaceCollaborator['role']) => {
    switch (role) {
      case 'OWNER':
        return {
          label: 'Propriétaire',
          color: 'bg-blue-600/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
        };
      case 'ADMIN':
        return {
          label: 'Administrateur',
          color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
        };
      case 'EDITOR':
        return {
          label: 'Éditeur (Saisie)',
          color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
        };
      case 'VIEWER':
        return {
          label: 'Lecteur (Consultation)',
          color: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161618] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-700 dark:text-blue-400 font-bold">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Gestion Collaborative & Équipe</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Invitez vos associés, conjoints ou experts-comptables avec des permissions précises.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCollaboratorsModalOpen(false)}
            className="rounded-full p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {feedbackMsg && (
            <div
              className={`flex items-center gap-2 p-3 rounded-2xl text-xs font-semibold animate-in fade-in ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                  : 'bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400'
              }`}
            >
              <Check className="h-4 w-4 shrink-0" />
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* Space Selector Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Espace à administrer :
              </label>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSpaceId}
                onChange={(e) => setSelectedSpaceId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                {spaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.name} ({s.tag})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleCopyInviteLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                title="Copier le lien d'accès direct pour l'envoyer par WhatsApp ou Email"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedLink ? 'Lien copié !' : 'Copier lien d’invitation'}</span>
              </button>
            </div>
          </div>

          {/* Invite Collaborator Form */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-3">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span>Inviter par adresse email</span>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2 relative">
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="associe@entreprise.com ou conjoint@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="ADMIN">Administrateur</option>
                    <option value="EDITOR">Éditeur (Saisie)</option>
                    <option value="VIEWER">Lecteur (Consultation)</option>
                  </select>
                </div>
              </div>

              {/* Specific Permissions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={canAddTx}
                    onChange={(e) => setCanAddTx(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Saisir transactions</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={canBudgets}
                    onChange={(e) => setCanBudgets(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Modifier budgets</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={canAccounts}
                    onChange={(e) => setCanAccounts(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Gérer comptes</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={canInvite}
                    onChange={(e) => setCanInvite(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Inviter d'autres</span>
                </label>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl btn-brand font-bold text-xs shadow-xs active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Envoyer l'invitation</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Members List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span>
                Membres de l'espace « {currentSpace.name} » ({collaborators.length})
              </span>
            </div>

            {collaborators.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                Aucun collaborateur extérieur sur cet espace. Invitez-en un ci-dessus avec son adresse email.
              </div>
            ) : (
              <div className="space-y-2">
                {collaborators.map((c) => {
                  const badge = getRoleBadge(c.role);
                  const isOwner = c.role === 'OWNER';

                  return (
                    <div
                      key={c.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181b] shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-black text-xs">
                          {c.email.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {c.name || c.email}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                            {c.status === 'INVITED' && (
                              <span className="text-[10px] text-amber-500 font-semibold">
                                (Invitation envoyée)
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">{c.email}</span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {!isOwner && (
                          <select
                            value={c.role}
                            onChange={(e) =>
                              updateCollaboratorRole(currentSpace.id, c.id, e.target.value as any)
                            }
                            className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                          >
                            <option value="ADMIN">Administrateur</option>
                            <option value="EDITOR">Éditeur</option>
                            <option value="VIEWER">Lecteur</option>
                          </select>
                        )}

                        {!isOwner ? (
                          <button
                            type="button"
                            onClick={() => removeCollaborator(currentSpace.id, c.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                            title="Révoquer l'accès"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 px-2 py-1">
                            <Lock className="h-3 w-3" />
                            <span>Propriétaire</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
          <span className="text-[11px] text-slate-400">
            Les collaborateurs invités ont un accès synchronisé en temps réel.
          </span>
          <button
            type="button"
            onClick={() => setIsCollaboratorsModalOpen(false)}
            className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
