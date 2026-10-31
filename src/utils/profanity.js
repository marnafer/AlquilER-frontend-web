// Filtro de lenguaje inapropiado (cliente). Espejo ligero del backend
// (App\Helpers\ProfanityFilter). El control definitivo esta en el servidor.
const TERMINOS = [
  'puta','puto','mierda','carajo','joder','cono','pendejo','pendeja','idiota','imbecil',
  'estupido','estupida','boludo','boluda','pelotudo','pelotuda','forro','forra','trolo',
  'maricon','marica','culiado','culiada','hijodeputa','maldito','maldita','basura',
  'asqueroso','asquerosa','inutil','tarado','tarada','chingar','chingada','verga',
  'cabron','cabrona','pinche','guey','zorra','zorro','prostituta','prostituto','joto',
  'culero','culera','mamada','mamar','chingo','chingas','chingues','fuck','shit','bitch',
  'asshole','bastard','dick','pussy','cunt','whore','slut','nigger','nigga','faggot',
  'retard','retarded','douche','douchebag','motherfucker','bullshit','crap','damn',
];

function normalizar(texto) {
  if (!texto) return '';
  let t = String(texto).toLowerCase();
  // quitar acentos
  t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // leetspeak basico
  t = t.replace(/0/g,'o').replace(/1/g,'i').replace(/3/g,'e').replace(/4/g,'a')
       .replace(/5/g,'s').replace(/7/g,'t').replace(/8/g,'b').replace(/@/g,'a')
       .replace(/\$/g,'s').replace(/!/g,'i');
  // eliminar no alfanumericos
  t = t.replace(/[^a-z0-9]/g, '');
  return t;
}

const TERMINOS_NORM = [...new Set(TERMINOS.map(normalizar).filter(Boolean))];

export function contieneProfanidad(texto) {
  const norm = normalizar(texto);
  if (!norm) return false;
  return TERMINOS_NORM.some((t) => norm.includes(t));
}

export const MENSAJE_PROFANIDAD = 'El texto contiene lenguaje inapropiado y no puede ser publicado.';
