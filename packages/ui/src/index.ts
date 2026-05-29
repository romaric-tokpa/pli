// @pli/ui — design-system Pli (tokens, preset Tailwind, base CSS, composants).
//
// Surface publique consommée par apps/web (et toute future surface Pli) :
// composants UI typés, hooks, tokens. Tout est ré-exporté ici pour permettre
// un import unique côté consommateur : `import { Button, StatusPill } from '@pli/ui'`.

// Tokens (palette charte, typo, rayons, ombres)
export { couleurs, ombres, policeFamille, rayons, taillesTexte } from './tokens.js';

// Iconographie & marques
export { Icon, type IconName, type IconProps } from './components/icon.js';
export { ALIAS_ICONES_LEGACY, type NomIconeLegacy } from './components/icon-aliases.js';
export {
  Logo,
  SealIcon,
  type LogoProps,
  type LogoVariant,
  type SealIconProps,
} from './components/logo.js';

// Boutons
export {
  Button,
  IconButton,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
  type IconButtonProps,
  type IconButtonVariant,
} from './components/button.js';

// Formulaires
export {
  Checkbox,
  SearchField,
  Select,
  Switch,
  TextField,
  type CheckboxProps,
  type SearchFieldProps,
  type SearchFieldSize,
  type SelectOption,
  type SelectProps,
  type SwitchProps,
  type TextFieldProps,
} from './components/form-fields.js';

// Conteneurs
export {
  Card,
  KPICard,
  type CardProps,
  type KPICardProps,
  type KPITone,
  type KPITrend,
} from './components/card.js';

// Statut & mapping métier
export {
  STATUS_STYLES,
  StatusPill,
  toneDepuisEtatReconciliation,
  type StatusPalette,
  type StatusPillProps,
  type StatusPillSize,
  type StatusTone,
} from './components/status-pill.js';

// Navigation
export {
  Breadcrumbs,
  Stepper,
  Tabs,
  type BreadcrumbItem,
  type BreadcrumbsProps,
  type StepperProps,
  type TabItem,
  type TabsProps,
} from './components/navigation.js';

// Feedback
export {
  EmptyState,
  ProgressBar,
  Skeleton,
  SkeletonRow,
  type EmptyStateProps,
  type ProgressBarProps,
  type ProgressTone,
  type SkeletonProps,
} from './components/feedback.js';

// Overlays
export {
  Drawer,
  Modal,
  type DrawerProps,
  type ModalProps,
  type ModalSize,
} from './components/overlays.js';

// Toast
export {
  ToastProvider,
  useToast,
  type ToastPayload,
  type ToastProviderProps,
  type ToastPusher,
} from './components/toast.js';

// Tableau
export { Table, type TableColumn, type TableProps } from './components/table.js';

// Avatar
export { Avatar, type AvatarProps } from './components/avatar.js';

// Uploader
export { Uploader, type UploaderProps } from './components/uploader.js';

// Utilitaire interne — réexporté pour les écrans qui en auraient besoin.
export { cn } from './lib/cn.js';
