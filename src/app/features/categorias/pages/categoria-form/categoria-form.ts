import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoriaService } from '../../services/categoria-service';
import { CategoriaRequest } from '../../models/categoria.model';
import { mensajeError, erroresDeValidacion } from '../../../../core/utils/http-error';
@Component({ selector: 'app-categoria-form', imports: [ReactiveFormsModule, RouterLink], templateUrl: './categoria-form.html' })
export class CategoriaForm {
    readonly id = input<string>();
    private readonly service = inject(CategoriaService);
    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);
    private readonly destroyRef = inject(DestroyRef);
    protected readonly cargando = signal(false);
    protected readonly guardando = signal(false);
    protected readonly error = signal('');
    protected readonly errores = signal<Record<string, string>>({});
    protected readonly registroDisponible = signal(true);
    protected readonly form = this.fb.nonNullable.group({ nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/\S/)]], descripcion: ['', [Validators.maxLength(200)]], estado: [true] });
    constructor() { effect(onCleanup => { const raw = this.id(); this.error.set(''); this.errores.set({}); this.registroDisponible.set(true); this.form.reset({ nombre: '', descripcion: '', estado: true }); if (raw === undefined) {
        this.cargando.set(false);
        return;
    } const id = Number(raw); if (!Number.isSafeInteger(id) || id <= 0) {
        this.error.set('El identificador de categoría no es válido.');
        this.registroDisponible.set(false);
        return;
    } this.cargando.set(true); const sub = this.service.obtener(id).subscribe({ next: c => { this.form.reset({ nombre: c.nombre, descripcion: c.descripcion ?? '', estado: c.estado }); this.cargando.set(false); }, error: (err: HttpErrorResponse) => { this.error.set(mensajeError(err)); this.registroDisponible.set(false); this.cargando.set(false); } }); onCleanup(() => sub.unsubscribe()); }); this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.errores.set({})); }
    mensajeCampo(campo: 'nombre' | 'descripcion'): string { const control = this.form.controls[campo]; const delServidor = this.errores()[campo]; if (delServidor)
        return delServidor; if (!control.touched)
        return ''; if (control.hasError('required') || control.hasError('pattern'))
        return 'El nombre es obligatorio.'; if (control.hasError('minlength'))
        return 'El nombre debe tener al menos 3 caracteres.'; if (control.hasError('maxlength'))
        return campo === 'nombre' ? 'Máximo 50 caracteres.' : 'Máximo 200 caracteres.'; return ''; }
    guardar() { if (this.guardando() || this.cargando() || !this.registroDisponible())
        return; const valores = this.form.getRawValue(); this.form.controls.nombre.setValue(valores.nombre.trim()); if (this.form.invalid) {
        this.form.markAllAsTouched();
        return;
    } this.error.set(''); this.errores.set({}); this.guardando.set(true); const dto: CategoriaRequest = { nombre: valores.nombre.trim(), descripcion: valores.descripcion.trim() || null, estado: valores.estado }; const editar = this.id() !== undefined; const peticion = editar ? this.service.actualizar(Number(this.id()), dto) : this.service.crear(dto); peticion.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.guardando.set(false))).subscribe({ next: () => this.router.navigate(['/categorias'], { state: { mensaje: editar ? 'Categoría actualizada correctamente.' : 'Categoría registrada correctamente.' } }), error: (err: HttpErrorResponse) => { this.error.set(mensajeError(err)); this.errores.set(erroresDeValidacion(err)); } }); }
}
