import {
  Search, User, Heart, ShoppingCart, Menu, X, Star,
  ArrowRight, ArrowLeft, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Sun, Truck, Shield, RotateCcw, Gem, Headphones, Zap, Ruler, Lightbulb,
  Tags, ShoppingBag, Eye, Minus, Plus, Tag, ScanBarcode, Box,
  AlertTriangle, Lock, MapPin, Phone, Mail, Clock, CreditCard,
  Building, Pencil, StickyNote, Receipt, CalendarCheck, CircleCheck,
  Bell, Send, Check, AlertCircle, Crosshair, PackageOpen, Wrench,
  Briefcase, Leaf, Smile, MessageCircle, PhoneCall, Calendar,
  Info, SlidersHorizontal, Home, DollarSign, Layers,
} from 'lucide-react';

const lucideMap = {
  'search': Search,
  'magnifying-glass': Search,
  'user': User,
  'heart': Heart,
  'shopping-cart': ShoppingCart,
  'cart-shopping': ShoppingCart,
  'bars': Menu,
  'menu': Menu,
  'xmark': X,
  'x': X,
  'star': Star,
  'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'sun': Sun,
  'truck-fast': Truck,
  'truck': Truck,
  'shield-halved': Shield,
  'shield': Shield,
  'rotate-left': RotateCcw,
  'rotate-ccw': RotateCcw,
  'gem': Gem,
  'headset': Headphones,
  'bolt': Zap,
  'ruler': Ruler,
  'lightbulb': Lightbulb,
  'tags': Tags,
  'tag': Tag,
  'face-smile': Smile,
  'smile': Smile,
  'bag-shopping': ShoppingBag,
  'shopping-bag': ShoppingBag,
  'eye': Eye,
  'minus': Minus,
  'plus': Plus,
  'barcode': ScanBarcode,
  'box': Box,
  'exclamation-triangle': AlertTriangle,
  'lock': Lock,
  'location-dot': MapPin,
  'map-pin': MapPin,
  'phone': Phone,
  'envelope': Mail,
  'mail': Mail,
  'clock': Clock,
  'credit-card': CreditCard,
  'building': Building,
  'pen-to-square': Pencil,
  'note-sticky': StickyNote,
  'receipt': Receipt,
  'calendar-check': CalendarCheck,
  'calendar': Calendar,
  'circle-check': CircleCheck,
  'bell': Bell,
  'paper-plane': Send,
  'check': Check,
  'circle-exclamation': AlertCircle,
  'location-crosshairs': Crosshair,
  'box-open': PackageOpen,
  'wrench': Wrench,
  'briefcase': Briefcase,
  'leaf': Leaf,
  'comments': MessageCircle,
  'phone-volume': PhoneCall,
  'sliders': SlidersHorizontal,
  'sliders-h': SlidersHorizontal,
  'house': Home,
  'dollar-sign': DollarSign,
  'layer-group': Layers,
  'ruler-combined': Ruler,
  'chess-queen': Gem,
  'vector-square': Box,
  'info': Info,
};

const BRAND_SVGS = {
  'instagram': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  'facebook-f': (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  ),
  'twitter': (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  'x-twitter': (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  'pinterest-p': (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  ),
  'youtube': (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  'linkedin-in': (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  'cc-visa': (props) => (
    <svg viewBox="0 0 48 32" fill="currentColor" {...props}>
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <path d="M19.5 21h-3l1.9-11h3l-1.9 11zm10.2-10.7c-.6-.2-1.5-.5-2.7-.5-3 0-5 1.5-5 3.7 0 1.6 1.5 2.5 2.6 3 1.2.6 1.6.9 1.6 1.5 0 .8-1 1.2-1.9 1.2-1.3 0-2-.2-3-.7l-.4-.2-.5 2.8c.7.3 2 .6 3.3.6 3.1 0 5.2-1.5 5.2-3.8 0-1.3-.8-2.2-2.5-3-.1 0-.1 0 0 0l-.5.8zm6.5-.3h-2.2c-.7 0-1.2.2-1.5 1l-4.2 10h3.2l.6-1.7h3.6l.3 1.7h2.9l-2.7-11zm-3.5 7.1l1.5-4.1.8 4.1h-2.3zM16.3 10.3l-2.9 7.4-.3-1.5c-.5-1.8-2.1-3.7-3.9-4.7l2.7 10.5h3.2l4.8-11.7h-3.6z" fill="white" />
    </svg>
  ),
  'cc-mastercard': (props) => (
    <svg viewBox="0 0 48 32" fill="currentColor" {...props}>
      <rect width="48" height="32" rx="4" fill="#252525" />
      <circle cx="19" cy="16" r="8" fill="#EB001B" />
      <circle cx="29" cy="16" r="8" fill="#F79E1B" />
      <path d="M24 10.2a8 8 0 010 11.6 8 8 0 000-11.6z" fill="#FF5F00" />
    </svg>
  ),
  'cc-amex': (props) => (
    <svg viewBox="0 0 48 32" fill="currentColor" {...props}>
      <rect width="48" height="32" rx="4" fill="#016FD0" />
      <text x="24" y="19" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">AMEX</text>
    </svg>
  ),
  'cc-paypal': (props) => (
    <svg viewBox="0 0 48 32" fill="currentColor" {...props}>
      <rect width="48" height="32" rx="4" fill="#003087" />
      <text x="24" y="19" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">PayPal</text>
    </svg>
  ),
  'google-pay': (props) => (
    <svg viewBox="0 0 48 32" fill="currentColor" {...props}>
      <rect width="48" height="32" rx="4" fill="#FFFFFF" stroke="#E0E0E0" />
      <text x="24" y="19" textAnchor="middle" fill="#5F6368" fontSize="8" fontWeight="bold" fontFamily="Arial">G Pay</text>
    </svg>
  ),
  'apple-pay': (props) => (
    <svg viewBox="0 0 48 32" fill="currentColor" {...props}>
      <rect width="48" height="32" rx="4" fill="#000000" />
      <text x="24" y="19" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">Pay</text>
    </svg>
  ),
};

export default function Icon({ name, className = '', style, ...props }) {
  const cleanName = name.replace(/^fa-(solid|regular|brands|fas|far|fab)\s+/, '').replace(/^fa-/, '');

  if (lucideMap[cleanName]) {
    const LucideIcon = lucideMap[cleanName];
    return <LucideIcon className={className} style={style} {...props} />;
  }

  if (BRAND_SVGS[cleanName]) {
    return BRAND_SVGS[cleanName]({ className, style, ...props });
  }

  console.warn(`[Icon] Unknown icon: "${cleanName}" (original: "${name}")`);
  return <span className={className} style={style} />;
}

export function BrandIcon({ name, className = '', style, ...props }) {
  const cleanName = name.replace(/^fa-(solid|regular|brands|fas|far|fab)\s+/, '').replace(/^fa-/, '');

  if (BRAND_SVGS[cleanName]) {
    return BRAND_SVGS[cleanName]({ className, style, ...props });
  }

  return <Icon name={cleanName} className={className} style={style} {...props} />;
}
