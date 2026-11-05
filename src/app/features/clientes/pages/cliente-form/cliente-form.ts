import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ClienteService } from '../../services/cliente-service';
import { ClienteRequest } from '../../models/cliente.model';
import { mensajeError, erroresDeValidacion } from '../../../../core/utils/http-error';

@Component({ selector: 'app-cliente-form', imports: [ReactiveFormsModule, RouterLink], templateUrl: './cliente-form.html' })
export class ClienteForm {
  readonly id = input<string>();
  private readonly service = inject(ClienteService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly disponible = signal(true);
  protected readonly error = signal('');
  protected readonly errores = signal<Record<string, string>>({});
  protected readonly campos = [
    { nombre: 'dni', etiqueta: 'DNI', maximo: 8, ayuda: 'Exactamente 8 dígitos.' },
    { nombre: 'nombres', etiqueta: 'Nombres', maximo: 100, ayuda: 'Entre 2 y 100 caracteres.' },
    { nombre: 'apellidos', etiqueta: 'Apellidos', maximo: 100, ayuda: 'Entre 2 y 100 caracteres.' },
    { nombre: 'email', etiqueta: 'Correo electrónico', maximo: 150, ayuda: 'Correo único y válido.' },
    { nombre: 'telefono', etiqueta: 'Teléfono (opcional)', maximo: 9, ayuda: '9 dígitos o vacío.' },
    { nombre: 'direccion', etiqueta: 'Dirección (opcional)', maximo: 250, ayuda: 'Máximo 250 caracteres.' },
  ] as const;
  protected readonly form = inject(FormBuilder).nonNullable.group({
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefono: ['', Validators.pattern(/^\d{9}$/)],
    direccion: ['', Validators.maxLength(250)],
    estado: [true],
  });
  constructor() {
    effect(onCleanup => {
      const raw = this.id(); this.error.set(''); this.errores.set({}); this.disponible.set(true); this.cargando.set(false);
      this.form.reset({ dni: '', nombres: '', apellidos: '', email: '', telefono: '', direccion: '', estado: true });
      if (raw === undefined) return;
      const id = Number(raw);
      if (!Number.isSafeInteger(id) || id <= 0) { this.error.set('Identificador de cliente inválido.'); this.disponible.set(false); return; }
      this.cargando.set(true);
      const sub = this.service.obtener(id).subscribe({
        next: c => { this.form.reset({ ...c, telefono: c.telefono ?? '', direccion: c.direccion ?? '' }); this.cargando.set(false); },
        error: err => { this.error.set(mensajeError(err)); this.disponible.set(false); this.cargando.set(false); }
      });
      onCleanup(() => sub.unsubscribe());
    });
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.errores.set({}));
  }
  mensajeCampo(campo: typeof this.campos[number]['nombre']) {
    if (this.errores()[campo]) return this.errores()[campo];
    const control = this.form.controls[campo]; if (!control.touched) return '';
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('pattern')) return campo === 'dni' ? 'El DNI debe tener exactamente 8 dígitos.' : 'El teléfono debe tener exactamente 9 dígitos.';
    if (control.hasError('email')) return 'Introduce un correo electrónico válido.';
    if (control.hasError('minlength')) return 'Introduce al menos 2 caracteres.';
    if (control.hasError('maxlength')) return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres.`;
    return '';
  }
  guardar() {
    if (this.guardando() || this.cargando() || !this.disponible()) return;
    for (const campo of this.campos) this.form.controls[campo.nombre].setValue(this.form.controls[campo.nombre].value.trim());
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const dto: ClienteRequest = { ...v, telefono: v.telefono || null, direccion: v.direccion || null };
    this.guardando.set(true); this.error.set(''); this.errores.set({});
    const editar = this.id() !== undefined;
    const peticion = editar ? this.service.actualizar(Number(this.id()), dto) : this.service.crear(dto);
    peticion.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.guardando.set(false))).subscribe({
      next: () => this.router.navigate(['/clientes'], { state: { mensaje: editar ? 'Cliente actualizado correctamente.' : 'Cliente registrado correctamente.' } }),
      error: err => { this.error.set(mensajeError(err)); this.errores.set(erroresDeValidacion(err)); }
    });
  }
}
