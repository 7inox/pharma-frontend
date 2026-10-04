import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, forkJoin, of } from 'rxjs';
import { ProductoService } from '../../services/producto-service';
import { ProductoRequest } from '../../models/producto.model';
import { CategoriaService } from '../../../categorias/services/categoria-service';
import { Categoria } from '../../../categorias/models/categoria.model';
import { erroresDeValidacion, mensajeError } from '../../../../core/utils/http-error';

@Component({ selector: 'app-producto-form', imports: [ReactiveFormsModule, RouterLink], templateUrl: './producto-form.html', styleUrl: './producto-form.css' })
export class ProductoForm {
  readonly id = input<string>();
  private readonly service = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly disponible = signal(false);
  protected readonly error = signal('');
  protected readonly errores = signal<Record<string, string>>({});
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly categoriaOriginal = signal<number | null>(null);
  protected readonly form = inject(FormBuilder).group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    precio: [null as number | null, [Validators.required, Validators.min(0.01)]],
    stock: [null as number | null, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    estado: [true, Validators.required],
    categoriaId: [null as number | null, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
  });
  protected readonly categoriaElegida = toSignal(this.form.controls.categoriaId.valueChanges, { initialValue: null });
  protected readonly opciones = computed(() => this.categorias().filter(c => c.estado || c.id === this.categoriaOriginal()));
  protected readonly hayCategoriasActivas = computed(() => this.categorias().some(c => c.estado));
  protected readonly categoriaInactiva = computed(() => this.categorias().some(c => c.id === this.categoriaElegida() && !c.estado));
  constructor() {
    effect(onCleanup => {
      const raw = this.id(); const id = raw === undefined ? null : Number(raw);
      this.error.set(''); this.errores.set({}); this.categorias.set([]); this.categoriaOriginal.set(null); this.disponible.set(false);
      this.form.reset({ nombre: '', precio: null, stock: null, categoriaId: null, estado: true });
      if (id !== null && (!Number.isSafeInteger(id) || id <= 0)) { this.error.set('Identificador de producto inválido.'); this.cargando.set(false); return; }
      this.cargando.set(true);
      const sub = forkJoin({ categorias: this.categoriaService.listar(), producto: id === null ? of(null) : this.service.obtener(id) }).subscribe({
        next: ({ categorias, producto }) => {
          this.categorias.set(categorias);
          if (producto) { this.categoriaOriginal.set(producto.categoriaId); this.form.reset({ nombre: producto.nombre, precio: producto.precio, stock: producto.stock, estado: producto.estado, categoriaId: producto.categoriaId }); }
          this.disponible.set(true); this.cargando.set(false);
        },
        error: e => { this.error.set(mensajeError(e)); this.cargando.set(false); }
      });
      onCleanup(() => sub.unsubscribe());
    });
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.errores.set({}));
  }
  mensajeCampo(campo: keyof typeof this.form.controls) {
    if (this.errores()[campo]) return this.errores()[campo];
    const c = this.form.controls[campo]; if (!c.touched) return '';
    if (c.hasError('required')) return 'Este campo es obligatorio.';
    if (c.hasError('minlength')) return 'Introduce al menos 3 caracteres.';
    if (c.hasError('maxlength')) return 'Máximo 150 caracteres.';
    if (c.hasError('min')) return campo === 'precio' ? 'El precio mínimo es S/ 0.01.' : campo === 'stock' ? 'El stock no puede ser negativo.' : 'Selecciona una categoría válida.';
    if (c.hasError('pattern')) return campo === 'stock' ? 'El stock debe ser un número entero.' : 'Selecciona una categoría válida.';
    return '';
  }
  guardar() {
    if (this.guardando() || this.cargando() || !this.disponible()) return;
    this.form.controls.nombre.setValue((this.form.controls.nombre.value ?? '').trim());
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.hayCategoriasActivas() || this.categoriaInactiva()) return;
    const v = this.form.getRawValue();
    if (!this.categorias().some(c => c.id === v.categoriaId && c.estado)) { this.error.set('Selecciona una categoría activa del listado.'); return; }
    const dto: ProductoRequest = { nombre: v.nombre!, precio: Number(v.precio), stock: Number(v.stock), estado: v.estado!, categoriaId: Number(v.categoriaId) };
    this.guardando.set(true); this.error.set(''); this.errores.set({});
    const peticion = this.id() === undefined ? this.service.crear(dto) : this.service.actualizar(Number(this.id()), dto);
    peticion.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.guardando.set(false))).subscribe({
      next: () => this.router.navigate(['/productos'], { state: { mensaje: this.id() === undefined ? 'Producto registrado correctamente.' : 'Producto actualizado correctamente.' } }),
      error: e => { this.error.set(mensajeError(e)); this.errores.set(erroresDeValidacion(e)); }
    });
  }
}
