import {
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  Zap,
  ZapOff,
  Plug,
  PlugZap,
  PowerOff,
  Power,
  TriangleAlert,
  CircleAlert,
  OctagonAlert,
  CheckCircle,
  XCircle,
  Info,
  CircleHelp,
  Wrench,
  Settings,
  Hammer,
  Truck,
  Package,
  Send,
  MapPin,
  Navigation,
  Thermometer,
  ThermometerSun,
  ThermometerSnowflake,
  Snowflake,
  Flame,
  Sun,
  TrendingDown,
  TrendingUp,
  Activity,
  BarChart3,
  LineChart,
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Phone,
  Mail,
  MessageCircle,
  MessageSquare,
  Clock,
  Timer,
  Calendar,
  CalendarCheck,
  Check,
  X,
  Plus,
  Minus,
  Search,
  Eye,
  Star,
  Heart,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  FileText,
  ClipboardList,
  List,
  Users,
  User,
  Award,
  Target,
  Bike,
  Cpu,
  Leaf,
  Building2,
  BadgeEuro,
  type LucideProps,
} from "lucide-react"
import { ComponentType } from "react"

/**
 * DynamicIcon — renders a Lucide icon by name string.
 * Uses explicit imports for tree-shaking (no `icons` barrel import).
 */

// Explicit icon map — only the icons we actually use
const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  Zap,
  ZapOff,
  Plug,
  PlugZap,
  PowerOff,
  Power,
  TriangleAlert,
  AlertTriangle: TriangleAlert,
  CircleAlert,
  AlertCircle: CircleAlert,
  OctagonAlert,
  AlertOctagon: OctagonAlert,
  CheckCircle,
  XCircle,
  Info,
  CircleHelp,
  HelpCircle: CircleHelp,
  Wrench,
  Settings,
  Hammer,
  Truck,
  Package,
  Send,
  MapPin,
  Navigation,
  Thermometer,
  ThermometerSun,
  ThermometerSnowflake,
  Snowflake,
  Flame,
  Sun,
  TrendingDown,
  TrendingUp,
  Activity,
  BarChart3,
  LineChart,
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Phone,
  Mail,
  MessageCircle,
  MessageSquare,
  Clock,
  Timer,
  Calendar,
  CalendarCheck,
  Check,
  X,
  Plus,
  Minus,
  Search,
  Eye,
  Star,
  Heart,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  FileText,
  ClipboardList,
  List,
  Users,
  User,
  Award,
  Target,
  Bike,
  Cpu,
  Leaf,
  Building2,
  BadgeEuro,
}

// Aliases for kebab-case, German names, and legacy icon names
const ALIASES: Record<string, string> = {
  "battery-warning": "BatteryWarning",
  "battery-charging": "BatteryCharging",
  "battery-medium": "BatteryMedium",
  "battery-low": "BatteryLow",
  "battery-full": "BatteryFull",
  "trending-down": "TrendingDown",
  "trending-up": "TrendingUp",
  "zap-off": "ZapOff",
  "alert-triangle": "TriangleAlert",
  "alert-circle": "CircleAlert",
  "alert-octagon": "OctagonAlert",
  "thermometer-sun": "ThermometerSun",
  "thermometer-snowflake": "ThermometerSnowflake",
  "power-off": "PowerOff",
  "shield-check": "ShieldCheck",
  "check-circle": "CheckCircle",
  "x-circle": "XCircle",
  "help-circle": "CircleHelp",
  "arrow-right": "ArrowRight",
  "chevron-right": "ChevronRight",
  "external-link": "ExternalLink",
  "file-text": "FileText",
  "clipboard-list": "ClipboardList",
  "map-pin": "MapPin",
  "message-circle": "MessageCircle",
  "message-square": "MessageSquare",
  "calendar-check": "CalendarCheck",
  "bar-chart": "BarChart3",
  "line-chart": "LineChart",
  "plug-zap": "PlugZap",
  "badge-euro": "BadgeEuro",
  "building-2": "Building2",
  // German aliases
  batterie: "Battery",
  blitz: "Zap",
  werkzeug: "Wrench",
  schild: "Shield",
  lkw: "Truck",
  uhr: "Clock",
  haken: "Check",
  zahnrad: "Settings",
  stecker: "Plug",
  // Legacy simple names
  cog: "Settings",
  bolt: "Zap",
  battery: "Battery",
  wrench: "Wrench",
  shield: "Shield",
  truck: "Truck",
  clock: "Clock",
  check: "Check",
  plug: "Plug",
  phone: "Phone",
  mail: "Mail",
  star: "Star",
  heart: "Heart",
  search: "Search",
  eye: "Eye",
  lock: "Lock",
  key: "Key",
  flame: "Flame",
  snowflake: "Snowflake",
  sun: "Sun",
  target: "Target",
  bike: "Bike",
  cpu: "Cpu",
  leaf: "Leaf",
  activity: "Activity",
  euro: "BadgeEuro",
}

function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")
}

export interface DynamicIconProps extends Omit<LucideProps, "ref" | "name"> {
  name: string | null | undefined
  fallback?: string
}

const DynamicIcon = ({
  name,
  fallback = "CircleHelp",
  ...props
}: DynamicIconProps) => {
  if (!name) {
    const F = ICON_MAP[fallback]
    return F ? <F {...props} /> : null
  }

  // 1. Direct match (PascalCase)
  let Icon = ICON_MAP[name]

  // 2. Alias lookup (lowercase)
  if (!Icon) {
    const aliased = ALIASES[name.toLowerCase()]
    if (aliased) Icon = ICON_MAP[aliased]
  }

  // 3. kebab-case → PascalCase
  if (!Icon && name.includes("-")) {
    Icon = ICON_MAP[toPascalCase(name)]
  }

  // 4. Fallback
  if (!Icon) {
    Icon = ICON_MAP[fallback]
  }

  return Icon ? <Icon {...props} /> : null
}

export default DynamicIcon
