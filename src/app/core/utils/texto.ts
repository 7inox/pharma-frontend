export function normalizar(texto:string):string { return texto.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim(); }
export function coincide(busqueda:string,...campos:string[]):boolean { const texto=normalizar(campos.join(' ')); return normalizar(busqueda).split(/\s+/).filter(Boolean).every(p=>texto.includes(p)); }
