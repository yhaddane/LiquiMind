import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Plus,
  Search,
  Sparkles,
  Check,
  Image as ImageIcon,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import { Category } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';

interface PredefinedCategoryItem {
  name: string;
  icon: string;
  group: 'LOGEMENT' | 'ALIMENTATION' | 'RESTO' | 'TRANSPORT' | 'FAMILLE' | 'SANTE' | 'NUMERIQUE' | 'SOLIDARITE' | 'VOYAGES' | 'ANIMAUX';
  defaultKind: 'FIXED_EXPENSE' | 'VARIABLE_EXPENSE';
  suggestedBudget?: number;
}

const PREDEFINED_CATALOG: PredefinedCategoryItem[] = [
  // Logement
  { name: 'Loyer', icon: '🏠', group: 'LOGEMENT', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 4200 },
  { name: 'Eau & électricité', icon: '🔌', group: 'LOGEMENT', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 550 },
  { name: 'Internet fibre', icon: '🛜', group: 'LOGEMENT', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 399 },
  { name: 'Syndic & Copropriété', icon: '🏢', group: 'LOGEMENT', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 300 },
  { name: 'Assurance habitation', icon: '🛡️', group: 'LOGEMENT', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 150 },
  { name: 'Gaz & Bouteilles de gaz', icon: '🔥', group: 'LOGEMENT', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 100 },
  { name: 'Bricolage & Réparations', icon: '🔨', group: 'LOGEMENT', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 400 },
  { name: 'Décoration & Mobilier', icon: '🛋️', group: 'LOGEMENT', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 500 },
  { name: 'Femme de ménage / Aide', icon: '🧹', group: 'LOGEMENT', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 800 },

  // Alimentation
  { name: 'Courses & Hypermarché', icon: '🛒', group: 'ALIMENTATION', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 2500 },
  { name: 'Boulangerie & Pâtisserie', icon: '🥖', group: 'ALIMENTATION', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 200 },
  { name: 'Boucherie & Volailles', icon: '🥩', group: 'ALIMENTATION', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 800 },
  { name: 'Marché aux légumes & fruits', icon: '🥬', group: 'ALIMENTATION', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 600 },
  { name: 'Poissonnerie', icon: '🐟', group: 'ALIMENTATION', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 500 },
  { name: 'Épicerie de quartier (Hanout)', icon: '🏪', group: 'ALIMENTATION', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 350 },

  // Restauration & Sorties
  { name: 'Café & Salons de thé', icon: '☕', group: 'RESTO', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 250 },
  { name: 'Restaurants & Dîners', icon: '🍽️', group: 'RESTO', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 800 },
  { name: 'Livraison (Glovo / Delivery)', icon: '🛵', group: 'RESTO', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 400 },
  { name: 'Fast-food & Snacks', icon: '🍔', group: 'RESTO', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 300 },
  { name: 'Cinéma & Billetterie', icon: '🎟️', group: 'RESTO', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 200 },
  { name: 'Soirées & Fêtes', icon: '🎉', group: 'RESTO', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 400 },

  // Transport & Véhicule
  { name: 'Carburant (Essence / Diesel)', icon: '⛽', group: 'TRANSPORT', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 1000 },
  { name: 'Taxi & VTC (Careem / InDrive)', icon: '🚕', group: 'TRANSPORT', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 350 },
  { name: 'Assurance Automobile', icon: '🚗', group: 'TRANSPORT', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 450 },
  { name: 'Vidange & Entretien auto', icon: '🔧', group: 'TRANSPORT', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 500 },
  { name: 'Péage autoroute', icon: '🛣️', group: 'TRANSPORT', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 200 },
  { name: 'Stationnement & Parking', icon: '🅿️', group: 'TRANSPORT', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 150 },
  { name: 'Lavage auto', icon: '🧼', group: 'TRANSPORT', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 100 },
  { name: 'Transports en commun (Tram/Bus)', icon: '🚊', group: 'TRANSPORT', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 200 },

  // Famille & Scolarité
  { name: 'École & Frais de scolarité', icon: '🎒', group: 'FAMILLE', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 2200 },
  { name: 'Crèche & Garderie', icon: '🍼', group: 'FAMILLE', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 1500 },
  { name: 'Fournitures scolaires & Livres', icon: '📚', group: 'FAMILLE', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 400 },
  { name: 'Cours particuliers & Soutien', icon: '✏️', group: 'FAMILLE', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 600 },
  { name: 'Activités sportives enfants', icon: '🥋', group: 'FAMILLE', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 350 },
  { name: 'Habillement enfants', icon: '👶', group: 'FAMILLE', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 500 },

  // Santé & Bien-être
  { name: 'Pharmacie & Médicaments', icon: '💊', group: 'SANTE', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 300 },
  { name: 'Consultations & Médecin', icon: '🩺', group: 'SANTE', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 500 },
  { name: 'Dentiste & Soins dentaires', icon: '🦷', group: 'SANTE', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 800 },
  { name: 'Optique & Lunettes', icon: '👓', group: 'SANTE', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 600 },
  { name: 'Assurance santé / Mutuelle', icon: '🏥', group: 'SANTE', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 400 },
  { name: 'Salle de sport & Abonnement', icon: '🏋️', group: 'SANTE', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 299 },
  { name: 'Hammam & Spa marocain', icon: '🧖', group: 'SANTE', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 200 },
  { name: 'Coiffeur & Barbier', icon: '✂️', group: 'SANTE', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 150 },
  { name: 'Cosmétiques & Soins visage', icon: '💄', group: 'SANTE', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 250 },

  // Numérique & Abonnements
  { name: 'Forfait Téléphone mobile', icon: '📱', group: 'NUMERIQUE', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 149 },
  { name: 'Netflix & Streaming vidéo', icon: '🎬', group: 'NUMERIQUE', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 95 },
  { name: 'Spotify / Apple Music', icon: '🎵', group: 'NUMERIQUE', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 55 },
  { name: 'Jeux vidéo & PlayStation Plus', icon: '🎮', group: 'NUMERIQUE', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 120 },
  { name: 'Logiciels & Cloud (Google, iCloud)', icon: '☁️', group: 'NUMERIQUE', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 80 },
  { name: 'Shopping High-Tech & Gadgets', icon: '💻', group: 'NUMERIQUE', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 600 },

  // Solidarité & Obligations
  { name: 'Aide aux parents & Proches', icon: '🤲', group: 'SOLIDARITE', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 1000 },
  { name: 'Zakat & Aumônes (Sadaqa)', icon: '🕌', group: 'SOLIDARITE', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 500 },
  { name: 'Cadeaux & Mariages', icon: '🎁', group: 'SOLIDARITE', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 400 },
  { name: 'Frais bancaires & Tenue de compte', icon: '🏦', group: 'SOLIDARITE', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 60 },
  { name: 'Impôts, Taxe d’habitation & Vignette', icon: '📋', group: 'SOLIDARITE', defaultKind: 'FIXED_EXPENSE', suggestedBudget: 500 },

  // Voyages & Vacances
  { name: 'Billets d’avion / Bateau', icon: '✈️', group: 'VOYAGES', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 1500 },
  { name: 'Hôtels & Résidences', icon: '🏨', group: 'VOYAGES', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 1200 },
  { name: 'Sorties en vacances & Excursions', icon: '🏖️', group: 'VOYAGES', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 800 },

  // Animaux
  { name: 'Nourriture & Croquettes animaux', icon: '🐕', group: 'ANIMAUX', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 250 },
  { name: 'Vétérinaire & Vaccins', icon: '🐾', group: 'ANIMAUX', defaultKind: 'VARIABLE_EXPENSE', suggestedBudget: 400 },
];

const GROUP_LABELS: Record<string, string> = {
  ALL: 'Toutes les catégories',
  LOGEMENT: '🏠 Logement & Énergie',
  ALIMENTATION: '🛒 Alimentation & Courses',
  RESTO: '🍽️ Restauration & Sorties',
  TRANSPORT: '⛽ Transport & Véhicule',
  FAMILLE: '🎒 Famille & Scolarité',
  SANTE: '💊 Santé & Bien-être',
  NUMERIQUE: '📱 Numérique & Abonnements',
  SOLIDARITE: '🤲 Solidarité & Famille',
  VOYAGES: '✈️ Voyages & Vacances',
  ANIMAUX: '🐾 Animaux',
};

const SUGGESTED_EMOJIS = [
  '🛒', '☕', '🍽️', '⛽', '🏠', '🎒', '💊', '📱', '🎬', '🏋️',
  '🤲', '🚗', '✈️', '💻', '👕', '🎁', '🔌', '🛜', '🥖', '🥩',
  '🚲', '🏖️', '🐾', '🩺', '🦷', '👓', '👶', '🎮', '🎵', '🕌',
  '📚', '🧹', '🛋️', '🧼', '🅿️', '🚕', '🛵', '🍔', '🍕', '🍣',
  '⚽', '🎾', '🥊', '🎨', '📸', '🎸', '⌚', '💎', '📦', '🔧'
];

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultKind?: 'FIXED_EXPENSE' | 'VARIABLE_EXPENSE';
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  defaultKind = 'VARIABLE_EXPENSE',
}) => {
  const { categories, addCategory, addBudget, selectedMonth, userSettings } = useApp();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<'CATALOG' | 'CUSTOM'>('CATALOG');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');

  // Custom Category State
  const [customName, setCustomName] = useState('');
  const [customKind, setCustomKind] = useState<'FIXED_EXPENSE' | 'VARIABLE_EXPENSE'>(defaultKind);
  const [customIcon, setCustomIcon] = useState('🛒');
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [initialBudget, setInitialBudget] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Existing category names for duplicate avoidance
  const existingNames = new Set(categories.map((c) => c.name.toLowerCase().trim()));

  // Filter catalog
  const filteredCatalog = PREDEFINED_CATALOG.filter((item) => {
    if (selectedGroup !== 'ALL' && item.group !== selectedGroup) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return item.name.toLowerCase().includes(q);
    }
    return true;
  });

  // Handle Logo Upload via Image file
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to maximum 128x128 for lightweight localStorage persistence
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        const targetSize = 96;
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            img,
            (img.width - size) / 2,
            (img.height - size) / 2,
            size,
            size,
            0,
            0,
            targetSize,
            targetSize
          );
          const dataUrl = canvas.toDataURL('image/png', 0.9);
          setCustomLogoUrl(dataUrl);
        }
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  // Add from catalog
  const handleAddPredefined = (item: PredefinedCategoryItem) => {
    const parentCategory = categories.find((c) =>
      c.isGroup && (item.defaultKind === 'FIXED_EXPENSE' ? c.kind === 'FIXED_EXPENSE' : c.kind === 'VARIABLE_EXPENSE')
    );

    const newCat: Omit<Category, 'id'> = {
      name: item.name,
      icon: item.icon,
      direction: 'OUT',
      kind: item.defaultKind,
      parentId: parentCategory ? parentCategory.id : (item.defaultKind === 'FIXED_EXPENSE' ? 'cat_g_dep_fix' : 'cat_g_dep_var'),
      spaceId: 'personal',
      order: categories.length + 1,
    };

    const newId = addCategory(newCat);

    // If default budget suggested, create envelope
    if (item.suggestedBudget && item.suggestedBudget > 0) {
      addBudget(newId, item.suggestedBudget);
    }

    onClose();
  };

  // Create custom category
  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const parentCategory = categories.find((c) =>
      c.isGroup && (customKind === 'FIXED_EXPENSE' ? c.kind === 'FIXED_EXPENSE' : c.kind === 'VARIABLE_EXPENSE')
    );

    const newCat: Omit<Category, 'id'> = {
      name: customName.trim(),
      icon: customIcon || '📁',
      customLogoUrl: customLogoUrl || undefined,
      direction: 'OUT',
      kind: customKind,
      parentId: parentCategory ? parentCategory.id : (customKind === 'FIXED_EXPENSE' ? 'cat_g_dep_fix' : 'cat_g_dep_var'),
      spaceId: 'personal',
      order: categories.length + 1,
    };

    const newId = addCategory(newCat);

    const budgetVal = parseFloat(initialBudget);
    if (!isNaN(budgetVal) && budgetVal > 0) {
      addBudget(newId, budgetVal);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#161618] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-neutral-900 dark:text-white">
                Ajouter une catégorie de dépense
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Catalogue exhaustif ou création sur mesure avec logo personnalisé
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-5 pt-3 pb-2 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/30">
          <button
            type="button"
            onClick={() => setActiveTab('CATALOG')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
              activeTab === 'CATALOG'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Catalogue complet ({PREDEFINED_CATALOG.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CUSTOM')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
              activeTab === 'CUSTOM'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Créer sur mesure (avec logo)</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'CATALOG' ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Search & Groups */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une catégorie (Loyer, Essence, Salle de sport, Netflix, Courses...)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              {/* Group pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {Object.entries(GROUP_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedGroup(key)}
                    className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                      selectedGroup === key
                        ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900'
                        : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredCatalog.map((item) => {
                const alreadyExists = existingNames.has(item.name.toLowerCase().trim());
                return (
                  <div
                    key={item.name}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                      alreadyExists
                        ? 'border-neutral-100 dark:border-neutral-800/40 bg-neutral-50/50 dark:bg-neutral-900/20 opacity-60'
                        : 'border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0 select-none">{item.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-0.5">
                          <span
                            className={`px-1.5 py-0.5 rounded-md font-semibold ${
                              item.defaultKind === 'FIXED_EXPENSE'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                            }`}
                          >
                            {item.defaultKind === 'FIXED_EXPENSE' ? 'Dépense fixe' : 'Dépense variable'}
                          </span>
                          {item.suggestedBudget && (
                            <span>~{item.suggestedBudget} DH</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {alreadyExists ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 shrink-0 px-2 py-1">
                        <Check className="h-3 w-3" />
                        <span>Présente</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddPredefined(item)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold hover:scale-102 active:scale-98 transition shrink-0 shadow-xs"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Ajouter</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateCustom} className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Custom Name */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Nom de la catégorie *
              </label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Ex : Équitation, Entretien Moto, Matériel Photo, Cadeaux Noël..."
                className="w-full px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>

            {/* Type selector */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Type de dépense (Sous-enveloppe) *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCustomKind('VARIABLE_EXPENSE')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    customKind === 'VARIABLE_EXPENSE'
                      ? 'border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">
                    🧺 Dépense variable
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">
                    Courses, sorties, restos, carburant, loisirs
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomKind('FIXED_EXPENSE')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    customKind === 'FIXED_EXPENSE'
                      ? 'border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">
                    📌 Dépense fixe
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">
                    Loyer, fibre, école, assurance, abonnements
                  </div>
                </button>
              </div>
            </div>

            {/* Initial Monthly Budget */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Plafond budgétaire mensuel ({userSettings.primaryCurrency || 'DH'})
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={initialBudget}
                onChange={(e) => setInitialBudget(e.target.value)}
                placeholder="Ex : 500 (ou laissez vide pour 0 DH)"
                className="w-full px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>

            {/* Logo / Icon Choice */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Logo & Icône de la catégorie
              </label>

              {/* Upload Section */}
              <div className="p-4 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {customLogoUrl ? (
                    <div className="relative group">
                      <img
                        src={customLogoUrl}
                        alt="Logo personnalisé"
                        className="w-14 h-14 rounded-2xl object-cover border border-neutral-300 dark:border-neutral-700 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setCustomLogoUrl(null)}
                        className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-1 shadow-sm hover:scale-110 transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-200 dark:bg-neutral-800 text-neutral-500">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">
                      {customLogoUrl ? 'Logo personnalisé chargé !' : 'Uploader votre propre logo'}
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      Format PNG, JPG, SVG, WebP (recadré et optimisé automatiquement)
                    </div>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition shrink-0"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{customLogoUrl ? 'Changer de logo' : 'Choisir un logo'}</span>
                </button>
              </div>

              {/* Or Select Predefined Emoji */}
              <div>
                <span className="block text-[11px] font-semibold text-neutral-500 mb-1.5">
                  Ou choisir une icône rapide :
                </span>
                <div className="grid grid-cols-10 gap-1.5 max-h-32 overflow-y-auto p-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                  {SUGGESTED_EMOJIS.map((em) => (
                    <button
                      type="button"
                      key={em}
                      onClick={() => {
                        setCustomIcon(em);
                        setCustomLogoUrl(null);
                      }}
                      className={`h-9 flex items-center justify-center rounded-xl text-lg transition ${
                        customIcon === em && !customLogoUrl
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 scale-105'
                          : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit button with high-contrast text */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl btn-brand text-xs font-black shadow-lg shadow-black/10 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Créer et ajouter la catégorie</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
