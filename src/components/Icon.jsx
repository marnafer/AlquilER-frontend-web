import React from 'react';
import {
    ArrowLeft, ArrowRight, ArrowsOut, Prohibit, Bathtub, Bed, Bell, BellSlash, Lightning,
    Briefcase, Broom, Buildings, Calendar, CalendarDots, CalendarCheck, CalendarPlus, CalendarX,
    Car, ChartLine, Check, CheckCircle, Checks, CaretDown, CaretLeft, CaretRight, CaretUp,
    Baby, Circle, Question, City, Clock, ClockCounterClockwise, Gear, ChatCircleDots, Chats,
    BellRinging, Couch, CurrencyDollar, DoorOpen, Barbell, Elevator, Envelope, EnvelopeOpen,
    WarningCircle, Warning, ArrowSquareOut, Eye, Drop, FileText, FileCsv, Funnel, Fire,
    FlagCheckered, FolderOpen, GasPump, HandWaving, Headset, Heart, House, Hourglass, HouseLine,
    IdentificationCard, Images, Tray, Info, Key, Oven, Laptop, Stack, ListBullets, MapTrifold,
    MapPin, Mountains, PaperPlaneTilt, PawPrint, PencilSimple, PersonSimpleSwim, Phone, PhoneCall,
    Plug, Plus, ArrowClockwise, RoadHorizon, Rocket, ArrowCounterClockwise, FloppyDisk,
    MagnifyingGlass, MagnifyingGlassMinus, ShieldCheck, TShirt, SignOut, ArrowsDownUp, SortDescending,
    SortAscending, CircleNotch, Plant, Star, StarHalf, Gauge, Tag, ThermometerCold, ThermometerHot,
    X, XCircle, ToggleRight, ToggleLeft, Trash, TrashSimple, Tree, Television, UploadSimple, User,
    UserCircleGear, Users, UserMinus, IdentificationBadge, UserList, Warehouse, WifiHigh, Browsers,
    Wrench, Columns, Garage
} from '@phosphor-icons/react';

// Mapa de nombres "estilo FontAwesome" (sin el prefijo fa-) al componente Phosphor.
// Se mantiene la nomenclatura antigua para que los helpers (utils/servicios.js,
// utils/categorias.js) y los datos que guardan clases "fa-*" sigan funcionando.
const ICONOS = {
    'archway': Columns,
    'arrow-left': ArrowLeft,
    'arrow-right': ArrowRight,
    'arrows-alt': ArrowsOut,
    'ban': Prohibit,
    'bath': Bathtub,
    'bed': Bed,
    'bell': Bell,
    'bell-slash': BellSlash,
    'bolt': Lightning,
    'briefcase': Briefcase,
    'broom': Broom,
    'building': Buildings,
    'building-user': Buildings,
    'calendar': Calendar,
    'calendar-alt': CalendarDots,
    'calendar-check': CalendarCheck,
    'calendar-plus': CalendarPlus,
    'calendar-times': CalendarX,
    'car': Car,
    'chart-line': ChartLine,
    'check': Check,
    'check-circle': CheckCircle,
    'check-double': Checks,
    'chevron-down': CaretDown,
    'chevron-left': CaretLeft,
    'chevron-right': CaretRight,
    'chevron-up': CaretUp,
    'children': Baby,
    'circle': Circle,
    'circle-check': CheckCircle,
    'circle-question': Question,
    'city': City,
    'clock': Clock,
    'clock-rotate-left': ClockCounterClockwise,
    'cog': Gear,
    'comment-dots': ChatCircleDots,
    'comments': Chats,
    'concierge-bell': BellRinging,
    'couch': Couch,
    'dollar-sign': CurrencyDollar,
    'door-open': DoorOpen,
    'dumbbell': Barbell,
    'elevator': Elevator,
    'envelope': Envelope,
    'envelope-open-text': EnvelopeOpen,
    'exclamation-circle': WarningCircle,
    'exclamation-triangle': Warning,
    'external-link-alt': ArrowSquareOut,
    'eye': Eye,
    'faucet': Drop,
    'file-contract': FileText,
    'file-csv': FileCsv,
    'filter': Funnel,
    'fire-flame-curved': Fire,
    'flag-checkered': FlagCheckered,
    'folder-open': FolderOpen,
    'gas-pump': GasPump,
    'hand-sparkles': HandWaving,
    'headset': Headset,
    'heart': Heart,
    'home': House,
    'hourglass-half': Hourglass,
    'house': House,
    'house-chimney-window': HouseLine,
    'house-circle-check': HouseLine,
    'id-card': IdentificationCard,
    'images': Images,
    'inbox': Tray,
    'info-circle': Info,
    'key': Key,
    'kitchen-set': Oven,
    'laptop': Laptop,
    'layer-group': Stack,
    'list': ListBullets,
    'map-marked-alt': MapTrifold,
    'map-marker-alt': MapPin,
    'map-pin': MapPin,
    'mound': Mountains,
    'mountain': Mountains,
    'paper-plane': PaperPlaneTilt,
    'paw': PawPrint,
    'pen': PencilSimple,
    'person-swimming': PersonSimpleSwim,
    'phone': Phone,
    'phone-alt': PhoneCall,
    'plug': Plug,
    'plus': Plus,
    'question-circle': Question,
    'redo-alt': ArrowClockwise,
    'road': RoadHorizon,
    'rocket': Rocket,
    'rotate-left': ArrowCounterClockwise,
    'rotate-right': ArrowClockwise,
    'save': FloppyDisk,
    'search': MagnifyingGlass,
    'search-minus': MagnifyingGlassMinus,
    'shield-halved': ShieldCheck,
    'shirt': TShirt,
    'sign-out-alt': SignOut,
    'sort': ArrowsDownUp,
    'sort-down': SortDescending,
    'sort-up': SortAscending,
    'spinner': CircleNotch,
    'sprout': Plant,
    'square-parking': Garage,
    'star': Star,
    'star-half-alt': StarHalf,
    'tachometer-alt': Gauge,
    'tag': Tag,
    'tags': Tag,
    'temperature-arrow-down': ThermometerCold,
    'temperature-arrow-up': ThermometerHot,
    'temperature-high': ThermometerHot,
    'temperature-low': ThermometerCold,
    'times': X,
    'times-circle': XCircle,
    'toggle-off': ToggleLeft,
    'toggle-on': ToggleRight,
    'trash': Trash,
    'trash-alt': Trash,
    'trash-can-arrow-up': TrashSimple,
    'tree': Tree,
    'triangle-exclamation': Warning,
    'tv': Television,
    'upload': UploadSimple,
    'user': User,
    'user-edit': UserCircleGear,
    'users': Users,
    'user-shield': ShieldCheck,
    'user-slash': UserMinus,
    'user-tag': IdentificationBadge,
    'warehouse': Warehouse,
    'wifi': WifiHigh,
    'window-restore': Browsers,
    'wrench': Wrench,
    'xmark': X
};

const VARIANTES = new Set([
    'fas', 'far', 'fal', 'fat', 'fab',
    'fa-solid', 'fa-regular', 'fa-light', 'fa-thin', 'fa-brands'
]);

const RE_ICONO = /^fa-[a-z0-9-]+$/;

// Acepta tanto un nombre nuevo ("heart") como una cadena de clases heredada
// ("fas fa-heart", "fa-spinner fa-spin", "fas fa-heart dash-action-arrow").
const parsear = (valor) => {
    const resultado = { key: null, spin: false, extra: [] };
    const texto = valor == null ? '' : String(valor).trim();
    if (!texto) return resultado;

    texto.split(/\s+/).forEach((token) => {
        if (VARIANTES.has(token)) return;
        if (token === 'fa-spin' || token === 'fa-spin-reverse' || token === 'fa-pulse') {
            resultado.spin = true;
            return;
        }
        if (RE_ICONO.test(token)) {
            if (!resultado.key) resultado.key = token.slice(3);
            else resultado.extra.push(token);
            return;
        }
        if (token === 'ph-icon') return;
        resultado.extra.push(token);
    });

    return resultado;
};

const Icon = ({
    name,
    weight = 'duotone',
    spin = false,
    className = '',
    size,
    style,
    ...rest
}) => {
    const { key, spin: spinClase, extra } = parsear(name);
    const Comp = ICONOS[key] || Circle;
    const clases = ['ph-icon', ...extra, className].filter(Boolean).join(' ');
    const gira = spin || spinClase;

    return (
        <Comp
            className={clases}
            weight={weight}
            size={size}
            style={gira ? { animation: 'ph-spin 0.9s linear infinite', ...style } : style}
            aria-hidden="true"
            {...rest}
        />
    );
};

export default Icon;
