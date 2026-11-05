import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../models/error-response';

export function mensajeError(err: HttpErrorResponse, fallback?: string): string {
  if (err.status === 0) {
    return fallback ?? 'No se pudo conectar con el servidor. Verifique que el backend esté en ejecución y que CORS permita este origen.';
  }
  const body = err.error as (Partial<ErrorResponse> & { mensaje?: string }) | null;
  const message = body?.message ?? body?.mensaje ?? fallback ?? `Error ${err.status}: ${err.statusText}`;
  return body?.requestId ? `${message} Código de seguimiento: ${body.requestId}` : message;
}

export function erroresDeValidacion(err: HttpErrorResponse): Record<string, string> {
  return (err.error as Partial<ErrorResponse> | null)?.validationErrors ?? {};
}
